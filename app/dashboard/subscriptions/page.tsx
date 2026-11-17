"use client";

import { Suspense, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { Pager } from "@/components/admin/pager";
import { FilterSelect } from "@/components/admin/filter-select";
import { ActionDialog } from "@/components/admin/action-dialog";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api/http";
import { subscriptionsApi, type Entitlement, type Interval, type PlanInput, type SubscriptionPlan, type UserType } from "@/lib/api/subscriptions";
import { formatDateTime, formatNaira, humanize } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { useAdmin } from "@/lib/use-admin";

const USER_TYPES: UserType[] = ["buyer", "vendor", "agent", "artisan"];
const INTERVALS: Interval[] = ["weekly", "monthly", "quarterly", "biannually", "annually"];

function SubscriptionsInner() {
  const { values, set } = useUrlFilters<"tab">();
  return (
    <div>
      <PageHeader title="Subscription plans" description="Plans customers can subscribe to, and the limits each one gives. Paid plans are created in Paystack automatically." />
      <Tabs value={values.tab ?? "plans"} onValueChange={(t) => set({ tab: t === "plans" ? undefined : t })}>
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>
        <TabsContent value="plans">
          <Plans />
        </TabsContent>
        <TabsContent value="refunds">
          <Refunds />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Plans() {
  const [userType, setUserType] = useState<UserType | undefined>();
  const [archived, setArchived] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | "new" | null>(null);
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["sub-plans", userType, archived], queryFn: () => subscriptionsApi.list({ userType, includeArchived: archived ? "true" : undefined }) });
  const ents = useQuery({ queryKey: ["entitlements"], queryFn: () => subscriptionsApi.entitlements(), staleTime: Infinity });
  const refresh = () => qc.invalidateQueries({ queryKey: ["sub-plans"] });
  const labels = Object.fromEntries((ents.data?.data ?? []).map((e) => [e.key, e.label]));

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <FilterSelect value={userType} onChange={(v) => setUserType(v as UserType | undefined)} options={USER_TYPES} allLabel="All user types" />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={archived} onCheckedChange={setArchived} /> Show archived
          </label>
          {can("finance:write") && (
            <Button className="ml-auto" size="sm" onClick={() => setEditing("new")}>
              <Plus className="mr-1 h-4 w-4" /> New plan
            </Button>
          )}
        </div>
        <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="No plans yet." onRetry={() => q.refetch()}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>For</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead className="text-right">Subscribers</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data?.data.map((p) => (
                  <TableRow key={p.planId}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        {p.planDetails.displayName}
                        {p.isFreeTier && <Badge variant="secondary">Free tier</Badge>}
                        {p.archivedAt && <StatusBadge status="CANCELLED" className="!bg-muted" />}
                      </div>
                      <div className="max-w-[280px] truncate text-xs text-muted-foreground">{p.description}</div>
                    </TableCell>
                    <TableCell className="capitalize">{p.userType}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.amount === 0 ? "Free" : `${formatNaira(p.amount * 100)} / ${p.planDetails.period}`}
                    </TableCell>
                    <TableCell className="text-xs">
                      {Object.keys(p.limits).length === 0
                        ? "No limits"
                        : Object.entries(p.limits).map(([k, v]) => (
                            <div key={k}>
                              {labels[k] ?? k}: {v === null ? "unlimited" : v}
                            </div>
                          ))}
                    </TableCell>
                    <TableCell className="text-right">{p.activeSubscribers}</TableCell>
                    <TableCell className="space-x-2 whitespace-nowrap text-right">
                      {can("finance:write") && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                            Edit
                          </Button>
                          {p.archivedAt ? (
                            <ActionDialog label="Restore" variant="ghost" title={`Sell “${p.planDetails.displayName}” again?`} confirmLabel="Restore" success="Plan restored" onConfirm={async () => { await subscriptionsApi.restore(p.planId); refresh(); }} />
                          ) : (
                            <ActionDialog
                              label="Archive"
                              variant="ghost"
                              title={`Stop selling “${p.planDetails.displayName}”?`}
                              description={`It disappears from the app. ${p.activeSubscribers} current subscriber(s) keep it and its limits until it ends.`}
                              fields={[{ name: "reason", label: "Reason", type: "reason", required: true }]}
                              confirmLabel="Archive"
                              success="Plan archived"
                              onConfirm={async (v) => { await subscriptionsApi.archive(p.planId, v.reason as string); refresh(); }}
                            />
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </QueryState>
        {editing && <PlanEditor plan={editing === "new" ? null : editing} entitlements={ents.data?.data ?? []} onClose={() => setEditing(null)} onSaved={refresh} />}
      </CardContent>
    </Card>
  );
}

type LimitMode = "none" | "unlimited" | "number";

function PlanEditor({ plan, entitlements, onClose, onSaved }: { plan: SubscriptionPlan | null; entitlements: Entitlement[]; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    user_type: plan?.userType ?? ("vendor" as UserType),
    name: plan?.planDetails.displayName ?? "",
    description: plan?.description ?? "",
    amount: plan ? String(plan.amount) : "",
    interval: plan?.interval ?? ("monthly" as Interval),
    features: (plan?.planDetails.features ?? []).join("\n"),
    highlights: (plan?.planDetails.highlights ?? []).join("\n"),
    is_free_tier: plan?.isFreeTier ?? false,
    sort_order: String(plan?.sortOrder ?? 0),
    applyToExistingSubscribers: false,
    reason: "",
  });
  const [limits, setLimits] = useState<Record<string, { mode: LimitMode; value: string }>>(() =>
    Object.fromEntries(entitlements.map((e) => {
      const v = plan?.limits[e.key];
      return [e.key, { mode: v === undefined ? "none" : v === null ? "unlimited" : "number", value: v ? String(v) : "" }];
    }))
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setError(null);
    const amount = Number(form.amount || 0);
    if (!form.name.trim() || form.name.trim().length < 2) return setError("Give the plan a name");
    if (!Number.isFinite(amount) || amount < 0) return setError("Price must be 0 or more");
    if (form.is_free_tier && amount !== 0) return setError("A free tier must cost ₦0");
    if (!form.is_free_tier && amount === 0 && !plan) return setError("Paid plans need a price. Tick “Free tier” for a free plan.");
    const lim: Record<string, number | null> = {};
    for (const [k, l] of Object.entries(limits)) {
      if (l.mode === "unlimited") lim[k] = null;
      if (l.mode === "number") {
        const n = Number(l.value);
        if (!Number.isInteger(n) || n < 0) return setError(`${entitlements.find((e) => e.key === k)?.label}: enter a whole number`);
        lim[k] = n;
      }
    }
    const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
    const body: PlanInput = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      amount,
      features: lines(form.features),
      highlights: lines(form.highlights),
      sort_order: Number(form.sort_order) || 0,
      limits: lim,
    };
    setBusy(true);
    try {
      if (plan) {
        await subscriptionsApi.update(plan.planId, { ...body, ...(amount !== plan.amount ? { applyToExistingSubscribers: form.applyToExistingSubscribers } : {}), ...(form.reason.trim() ? { reason: form.reason.trim() } : {}) });
      } else {
        await subscriptionsApi.create({ ...body, user_type: form.user_type, interval: form.interval, is_free_tier: form.is_free_tier });
      }
      toast({ title: plan ? "Plan updated" : "Plan created" });
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
          <DialogTitle>{plan ? `Edit ${plan.planDetails.displayName}` : "New subscription plan"}</DialogTitle>
          <DialogDescription>{plan ? "The billing interval and user type can’t change after creation (Paystack doesn’t allow it)." : "Paid plans are created in Paystack too. If Paystack refuses, nothing is saved."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={60} />
          </div>
          <div className="space-y-1.5">
            <Label>For</Label>
            <Select value={form.user_type} disabled={!!plan} onValueChange={(v) => set("user_type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {humanize(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Price (₦)</Label>
            <Input inputMode="decimal" value={form.amount} disabled={form.is_free_tier} onChange={(e) => set("amount", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Billed</Label>
            <Select value={form.interval} disabled={!!plan} onValueChange={(v) => set("interval", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {humanize(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} />
          </div>
          <div className="space-y-1.5">
            <Label>Features (one per line)</Label>
            <Textarea rows={4} value={form.features} onChange={(e) => set("features", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Highlights (one per line)</Label>
            <Textarea rows={4} value={form.highlights} onChange={(e) => set("highlights", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Display order</Label>
            <Input inputMode="numeric" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
          </div>
          {!plan && (
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <Checkbox
                checked={form.is_free_tier}
                onCheckedChange={(c) => {
                  set("is_free_tier", c === true);
                  if (c === true) set("amount", "0");
                }}
              />
              Free tier (limits for users of this type with no subscription)
            </label>
          )}
        </div>
        <div className="space-y-3 border-t pt-4">
          <div>
            <h3 className="text-sm font-medium">Limits</h3>
            <p className="text-xs text-muted-foreground">When a user reaches a limit they can’t add more until they upgrade. Lowering a limit never deletes anything.</p>
          </div>
          {entitlements.map((e) => {
            const l = limits[e.key] ?? { mode: "none", value: "" };
            return (
              <div key={e.key} className="grid items-center gap-2 sm:grid-cols-[1fr_170px_110px]">
                <div>
                  <div className="text-sm">{e.label}</div>
                  <div className="text-xs text-muted-foreground">{e.description}</div>
                </div>
                <Select value={l.mode} onValueChange={(m) => setLimits((s) => ({ ...s, [e.key]: { ...l, mode: m as LimitMode } }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not restricted</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="number">Up to…</SelectItem>
                  </SelectContent>
                </Select>
                <Input inputMode="numeric" disabled={l.mode !== "number"} value={l.value} onChange={(ev) => setLimits((s) => ({ ...s, [e.key]: { ...l, value: ev.target.value } }))} />
              </div>
            );
          })}
        </div>
        {plan && (
          <div className="space-y-3 border-t pt-4">
            {Number(form.amount) !== plan.amount && (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.applyToExistingSubscribers} onCheckedChange={(c) => set("applyToExistingSubscribers", c === true)} />
                Move the {plan.activeSubscribers} existing subscriber(s) to the new price at their next renewal
              </label>
            )}
            <div className="space-y-1.5">
              <Label>Reason for the change (audit log)</Label>
              <Input value={form.reason} onChange={(e) => set("reason", e.target.value)} maxLength={500} />
            </div>
          </div>
        )}
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {plan ? "Save changes" : "Create plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Refunds() {
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["refunds", status, page], queryFn: () => subscriptionsApi.refunds({ status, page, limit: 30 }), placeholderData: keepPreviousData });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subscription refunds</CardTitle>
        <CardDescription>Wrong-amount payments are refunded automatically (underpaid: in full; overpaid: the difference). Failed sends retry every 10 minutes, up to 5 times.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <FilterSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={["PENDING", "SENDING", "PROCESSING", "PROCESSED", "FAILED"]} allLabel="Any status" />
        </div>
        <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="No refunds.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Why</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data?.data.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">{formatDateTime(r.created_at)}</TableCell>
                  <TableCell className="max-w-[320px]">
                    {humanize(r.kind)}
                    <div className="text-xs text-muted-foreground">{r.reason}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNaira(r.amount_kobo)}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                    {r.last_error && <div className="mt-1 max-w-[220px] text-xs text-muted-foreground">{r.last_error}</div>}
                  </TableCell>
                  <TableCell className="text-right">
                    {can("finance:write") && r.status === "FAILED" && (
                      <ActionDialog label="Retry" variant="outline" title="Send this refund again?" confirmLabel="Retry" success="Refund resent" onConfirm={async () => { await subscriptionsApi.retryRefund(r.id); qc.invalidateQueries({ queryKey: ["refunds"] }); }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager page={page} totalPages={q.data?.meta?.totalPages} total={q.data?.meta?.total} onPage={setPage} />
        </QueryState>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense>
      <SubscriptionsInner />
    </Suspense>
  );
}
