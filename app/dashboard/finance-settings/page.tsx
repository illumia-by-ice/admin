"use client";

import { Suspense, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { QueryState } from "@/components/admin/query-state";
import { ActionDialog } from "@/components/admin/action-dialog";
import { SettingsForm, deepMerge, getPath, type SettingField } from "@/components/admin/settings-form";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api/http";
import { financeApi, PRODUCT_LABEL, type FinanceProduct, type FinanceSettings, type Override } from "@/lib/api/finance";
import { formatDateTime, formatBps, formatNaira } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { useAdmin } from "@/lib/use-admin";

const terms = (): SettingField[] => [
  { key: "frequencies.WEEKLY", label: "Weekly terms offered (number of weeks)", type: "list", hint: "e.g. 4, 8, 12. Leave empty to not offer weekly plans." },
  { key: "frequencies.MONTHLY", label: "Monthly terms offered (number of months)", type: "list" },
];

const FIELDS: Record<"bnpl" | "snbl" | "rnsl", SettingField[]> = {
  bnpl: [
    { key: "enabled", label: "Offer Buy Now Pay Later", type: "boolean" },
    { key: "autoApprove", label: "Approve plans automatically", type: "boolean", hint: "Otherwise every plan waits for an admin." },
    { key: "minAmount", label: "Minimum price", type: "number", unit: "naira" },
    { key: "maxAmount", label: "Maximum price", type: "number", unit: "naira" },
    { key: "markupBps", label: "Markup", type: "number", unit: "percent", hint: "Added to the price. Customers see the total, never the rate." },
    { key: "downPaymentBps", label: "Down payment", type: "number", unit: "percent", hint: "Of the total, taken from the wallet at checkout. 0 = none." },
    ...terms(),
    { key: "markupByTenure", label: "Different markup for specific terms", type: "tenureMap", hint: "One per line, e.g. “MONTHLY:12 = 25” for 25% on 12-month plans." },
  ],
  snbl: [
    { key: "enabled", label: "Offer Save Now Buy Later", type: "boolean" },
    { key: "interestEnabled", label: "Charge interest", type: "boolean" },
    { key: "minAmount", label: "Minimum price", type: "number", unit: "naira" },
    { key: "maxAmount", label: "Maximum price", type: "number", unit: "naira" },
    { key: "interestBps", label: "Interest", type: "number", unit: "percent", hint: "Only if interest is on." },
    { key: "releaseThresholdBps", label: "Default release point", type: "number", unit: "percent", hint: "Share of the total paid before the item is released." },
    { key: "thresholdMinBps", label: "Lowest release point a customer can choose", type: "number", unit: "percent" },
    { key: "thresholdMaxBps", label: "Highest release point a customer can choose", type: "number", unit: "percent" },
    { key: "inactivityCancelDays", label: "Cancel savings plans with no payment for", type: "number", unit: "days" },
    { key: "refundFeeBps", label: "Cancellation fee", type: "number", unit: "percent", hint: "Kept from refunds when a savings plan is cancelled before release." },
    ...terms(),
    { key: "markupByTenure", label: "Different interest for specific terms", type: "tenureMap" },
  ],
  rnsl: [
    { key: "enabled", label: "Offer Rent Now Save Later", type: "boolean" },
    { key: "contributionMode", label: "How tenants pay their share", type: "select", options: [{ value: "WALLET", label: "From their wallet (held until the landlord is paid)" }, { value: "DIRECT_TO_LANDLORD", label: "Directly to the landlord, with proof" }] },
    { key: "minContributionBps", label: "Minimum tenant contribution", type: "number", unit: "percent", hint: "Of the rent." },
    { key: "maxTopUp", label: "Maximum top-up", type: "number", unit: "naira" },
    { key: "interestBps", label: "Interest on the top-up", type: "number", unit: "percent" },
    ...terms(),
    { key: "markupByTenure", label: "Different interest for specific terms", type: "tenureMap" },
  ],
};

const SHARED_FIELDS: SettingField[] = [
  { key: "graceDays", label: "Grace period before a payment is overdue", type: "number", unit: "days" },
  { key: "lateFee.enabled", label: "Charge a late fee", type: "boolean" },
  { key: "lateFee.type", label: "Late fee type", type: "select", options: [{ value: "FLAT", label: "Flat amount (₦)" }, { value: "PERCENT", label: "Percent of the installment" }] },
  { key: "lateFee.value", label: "Late fee value", type: "number", hint: "Naira for a flat fee, or a percentage. Charged once per late installment." },
  { key: "defaultAfterDaysOverdue", label: "Mark as defaulted after overdue for", type: "number", unit: "days" },
  { key: "maxAutoDebitRetries", label: "Auto-debit attempts per installment", type: "number", unit: "count" },
  { key: "reminderOffsetsDays", label: "Send reminders this many days before a due date", type: "list", hint: "e.g. 3, 1. Add 0 for a reminder on the day." },
  { key: "maxActivePlans", label: "Max open plans per customer", type: "number", unit: "count" },
  { key: "maxFinancedAmount", label: "Max total owed per customer", type: "number", unit: "naira" },
  { key: "autoApproveVerifiedUsers", label: "Approve verified customers automatically (all products)", type: "boolean" },
];

function FinanceSettingsInner() {
  const { values, set } = useUrlFilters<"tab">();
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["finance-settings"], queryFn: () => financeApi.settings() });
  const editable = can("settings:write");
  const save = (section: keyof FinanceSettings) => async (patch: Record<string, unknown>, reason?: string) => {
    // The API replaces nested objects, so send the whole section with the changes merged in.
    const current = q.data!.data[section] as Record<string, unknown>;
    await financeApi.updateSettings({ [section]: deepMerge(current, patch) } as Partial<FinanceSettings>, reason);
    await qc.invalidateQueries({ queryKey: ["finance-settings"] });
  };

  return (
    <div>
      <PageHeader title="Finance settings" description="Pricing and rules for installment plans. Products can be given their own values by category or individually." />
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>Changes apply to new plans only. Every existing plan keeps the terms it started with: pricing, late fees, grace period and cancellation fee.</AlertDescription>
      </Alert>
      <Tabs value={values.tab ?? "bnpl"} onValueChange={(t) => set({ tab: t === "bnpl" ? undefined : t })}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="bnpl">Buy Now Pay Later</TabsTrigger>
          <TabsTrigger value="snbl">Save Now Buy Later</TabsTrigger>
          <TabsTrigger value="rnsl">Rent Now Save Later</TabsTrigger>
          <TabsTrigger value="shared">Late payments and limits</TabsTrigger>
          <TabsTrigger value="overrides">Category and product overrides</TabsTrigger>
        </TabsList>
        <QueryState isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()}>
          {q.data && (
            <>
              {(["bnpl", "snbl", "rnsl"] as const).map((k) => (
                <TabsContent key={k} value={k}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{PRODUCT_LABEL[k.toUpperCase() as FinanceProduct]}</CardTitle>
                      <CardDescription>Global defaults. Overrides for a category or product take priority.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SettingsForm fields={FIELDS[k]} value={q.data.data[k]} disabled={!editable} onSave={save(k)} note="Saved settings apply to plans started from now on." />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
              <TabsContent value="shared">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Late payments and limits</CardTitle>
                    <CardDescription>Apply to all three products. Global only.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SettingsForm fields={SHARED_FIELDS} value={q.data.data.shared} disabled={!editable} onSave={save("shared")} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="overrides">
                <Overrides settings={q.data.data} editable={editable} />
              </TabsContent>
            </>
          )}
        </QueryState>
      </Tabs>
    </div>
  );
}

const summarize = (product: FinanceProduct, config: Record<string, unknown>) =>
  Object.entries(config)
    .map(([k, v]) => {
      if (k.endsWith("Bps") && typeof v === "number") return `${k.replace(/Bps$/, "")}: ${formatBps(v)}`;
      if ((k === "minAmount" || k === "maxAmount" || k === "maxTopUp") && typeof v === "number") return `${k}: ${formatNaira(v * 100)}`;
      return `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`;
    })
    .join(" · ");

function Overrides({ settings, editable }: { settings: FinanceSettings; editable: boolean }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["finance-overrides"], queryFn: () => financeApi.overrides() });
  const [editing, setEditing] = useState<Override | "new" | null>(null);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Overrides</CardTitle>
            <CardDescription>Priority: product, then category (the product’s type), then the global settings. Only the fields listed are changed.</CardDescription>
          </div>
          {editable && (
            <Button size="sm" onClick={() => setEditing("new")}>
              Add override
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="No overrides: every product uses the global settings.">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applies to</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data?.data.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Badge variant="outline">{o.scope === "CATEGORY" ? "Category" : "Product"}</Badge> <span className="font-mono text-xs">{o.scope_key}</span>
                    </TableCell>
                    <TableCell>{o.product}</TableCell>
                    <TableCell className="max-w-[360px] text-xs">{summarize(o.product, o.config)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(o.updated_at)}</TableCell>
                    <TableCell className="space-x-2 whitespace-nowrap text-right">
                      {editable && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEditing(o)}>
                            Edit
                          </Button>
                          <ActionDialog
                            label="Remove"
                            variant="ghost"
                            title="Remove this override?"
                            description="New plans for these items go back to the global settings."
                            fields={[{ name: "reason", label: "Reason", type: "reason" }]}
                            confirmLabel="Remove"
                            success="Override removed"
                            onConfirm={async (v) => {
                              await financeApi.removeOverride(o.id, v.reason as string | undefined);
                              qc.invalidateQueries({ queryKey: ["finance-overrides"] });
                            }}
                          />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </QueryState>
        </CardContent>
      </Card>
      <EffectivePreview />
      {editing && <OverrideEditor override={editing === "new" ? null : editing} settings={settings} onClose={() => setEditing(null)} onSaved={() => qc.invalidateQueries({ queryKey: ["finance-overrides"] })} />}
    </div>
  );
}

function OverrideEditor({ override, settings, onClose, onSaved }: { override: Override | null; settings: FinanceSettings; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [scope, setScope] = useState<"CATEGORY" | "PRODUCT">(override?.scope ?? "CATEGORY");
  const [scopeKey, setScopeKey] = useState(override?.scope_key ?? "");
  const [product, setProduct] = useState<FinanceProduct>(override?.product ?? "BNPL");
  const section = product.toLowerCase() as "bnpl" | "snbl" | "rnsl";
  // Only simple fields can be overridden here; terms lists and per-term rates stay global.
  const fields = FIELDS[section].filter((f) => !f.key.includes(".") && f.type !== "tenureMap");
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(Object.keys(override?.config ?? {}).map((k) => [k, true])));
  const display = (f: SettingField, v: any) => (f.type === "number" ? (v === undefined || v === null ? "" : String(f.unit === "percent" ? v / 100 : v)) : v);
  // Values as typed (numbers are text until saved; percents are shown as %, stored as basis points).
  const [vals, setVals] = useState<Record<string, any>>(() =>
    Object.fromEntries(Object.entries(override?.config ?? {}).map(([k, v]) => [k, display(FIELDS[(override?.product ?? "BNPL").toLowerCase() as "bnpl"].find((f) => f.key === k) ?? ({ type: "text" } as never), v)]))
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = (f: SettingField) => (vals[f.key] !== undefined ? vals[f.key] : display(f, getPath(settings[section], f.key)));

  const save = async () => {
    setError(null);
    if (!scopeKey.trim()) return setError(scope === "CATEGORY" ? "Enter the category (the product type, e.g. electronics)" : "Enter the product ID");
    const config: Record<string, unknown> = {};
    for (const f of fields) {
      if (!on[f.key]) continue;
      let v: any = current(f);
      if (f.type === "number") {
        const n = Number(String(v).replace(/[,₦%\s]/g, ""));
        if (String(v).trim() === "" || !Number.isFinite(n)) return setError(`${f.label} must be a number`);
        v = f.unit === "percent" ? Math.round(n * 100) : n;
      }
      config[f.key] = v;
    }
    if (!Object.keys(config).length) return setError("Tick at least one setting to override");
    setBusy(true);
    try {
      await financeApi.setOverride({ scope, scopeKey: scopeKey.trim(), product, config, reason: reason.trim() || undefined });
      toast({ title: "Override saved. It applies to new plans." });
      onSaved();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{override ? "Edit override" : "Add override"}</DialogTitle>
          <DialogDescription>Tick the settings to change for these items; everything else keeps the global value.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Applies to</Label>
            <Select value={scope} disabled={!!override} onValueChange={(v) => setScope(v as "CATEGORY" | "PRODUCT")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CATEGORY">A category</SelectItem>
                <SelectItem value="PRODUCT">One product</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{scope === "CATEGORY" ? "Category (product type)" : "Product ID"}</Label>
            <Input value={scopeKey} disabled={!!override} onChange={(e) => setScopeKey(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Payment option</Label>
            <Select
              value={product}
              disabled={!!override}
              onValueChange={(v) => {
                setProduct(v as FinanceProduct);
                setOn({});
                setVals({});
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["BNPL", "SNBL", "RNSL"] as FinanceProduct[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-3 border-t pt-4">
          {fields.map((f) => (
            <div key={f.key} className="grid items-center gap-2 sm:grid-cols-[24px_1fr_220px]">
              <Checkbox checked={!!on[f.key]} onCheckedChange={(c) => setOn((s) => ({ ...s, [f.key]: c === true }))} />
              <span className={on[f.key] ? "text-sm" : "text-sm text-muted-foreground"}>
                {f.label}
                {f.type === "number" && f.unit === "percent" ? " (%)" : f.type === "number" && f.unit === "naira" ? " (₦)" : ""}
              </span>
              {f.type === "boolean" ? (
                <Select value={String(current(f))} disabled={!on[f.key]} onValueChange={(v) => setVals((s) => ({ ...s, [f.key]: v === "true" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              ) : f.type === "select" ? (
                <Select value={String(current(f))} disabled={!on[f.key]} onValueChange={(v) => setVals((s) => ({ ...s, [f.key]: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  inputMode="decimal"
                  disabled={!on[f.key]}
                  value={String(current(f) ?? "")}
                  onChange={(e) => setVals((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <div className="space-y-1.5 pt-2">
            <Label>Reason (audit log)</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
          </div>
        </div>
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EffectivePreview() {
  const [product, setProduct] = useState<FinanceProduct>("BNPL");
  const [target, setTarget] = useState<{ productId?: string; category?: string }>({});
  const [input, setInput] = useState("");
  const [kind, setKind] = useState<"productId" | "category">("productId");
  const q = useQuery({ queryKey: ["finance-effective", product, target], queryFn: () => financeApi.effective({ product, ...target }), enabled: Boolean(target.productId || target.category) });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">What a product actually gets</CardTitle>
        <CardDescription>Look up the settings a product or category ends up with, and where each value comes from.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Select value={product} onValueChange={(v) => setProduct(v as FinanceProduct)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["BNPL", "SNBL", "RNSL"] as FinanceProduct[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={kind} onValueChange={(v) => setKind(v as "productId" | "category")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="productId">Product ID</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
          <Input className="w-[280px]" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setTarget({ [kind]: input.trim() })} placeholder={kind === "productId" ? "Paste a product ID" : "e.g. electronics"} />
          <Button variant="outline" onClick={() => setTarget({ [kind]: input.trim() })} disabled={!input.trim()}>
            Look up
          </Button>
        </div>
        {(target.productId || target.category) && (
          <QueryState isLoading={q.isLoading} error={q.error}>
            {q.data && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setting</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>From</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(q.data.data.settings).map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell className="font-mono text-xs">{k}</TableCell>
                      <TableCell className="text-sm">{k.endsWith("Bps") && typeof v === "number" ? formatBps(v) : typeof v === "object" ? JSON.stringify(v) : String(v)}</TableCell>
                      <TableCell>
                        <Badge variant={q.data!.data.sources[k] === "global" ? "secondary" : "default"}>{q.data!.data.sources[k]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </QueryState>
        )}
      </CardContent>
    </Card>
  );
}

export default function FinanceSettingsPage() {
  return (
    <Suspense>
      <FinanceSettingsInner />
    </Suspense>
  );
}
