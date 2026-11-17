"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { Pager } from "@/components/admin/pager";
import { FilterSelect } from "@/components/admin/filter-select";
import { Stat } from "@/components/admin/kv";
import { ActionDialog } from "@/components/admin/action-dialog";
import { SettingsForm } from "@/components/admin/settings-form";
import { walletsApi, type PaystackEvent } from "@/lib/api/wallets";
import { formatDate, formatDateTime, formatNaira, fullName } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { useAdmin } from "@/lib/use-admin";
import { cn } from "@/lib/utils";

function WalletsPageInner() {
  const { values, set } = useUrlFilters<"tab" | "search" | "status">();
  const { can } = useAdmin();
  return (
    <div>
      <PageHeader title="Wallets" description="Customer wallets, manual adjustments, the ledger check and Paystack activity." />
      <Tabs value={values.tab ?? "wallets"} onValueChange={(t) => set({ tab: t === "wallets" ? undefined : t, search: undefined, status: undefined })}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="paystack">Paystack events</TabsTrigger>
          {can("wallet:read") && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>
        <TabsContent value="wallets">
          <WalletList />
        </TabsContent>
        <TabsContent value="adjustments">
          <Adjustments />
        </TabsContent>
        <TabsContent value="reconciliation">
          <ReconciliationCard />
        </TabsContent>
        <TabsContent value="paystack">
          <PaystackEvents />
        </TabsContent>
        <TabsContent value="settings">
          <WalletSettingsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WalletList() {
  const { values, set, page } = useUrlFilters<"search" | "status">();
  const filters = { search: values.search, status: values.status, page, limit: 30 };
  const q = useQuery({ queryKey: ["wallets", filters], queryFn: () => walletsApi.list(filters), placeholderData: keepPreviousData });
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Input className="w-[280px]" placeholder="Search name, email or user ID, then Enter" defaultValue={values.search} onKeyDown={(e) => e.key === "Enter" && set({ search: (e.target as HTMLInputElement).value.trim() || undefined })} />
          <FilterSelect value={values.status} onChange={(v) => set({ status: v })} options={["ACTIVE", "FROZEN", "CLOSED"]} allLabel="Any status" />
        </div>
        <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="No wallets found." onRetry={() => q.refetch()}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={cn(q.isFetching && "opacity-60")}>
                {q.data?.data.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <Link href={`/dashboard/wallets/${w.id}`} className="block">
                        <div className="font-medium">{fullName(w.user)}</div>
                        <div className="text-xs text-muted-foreground">
                          {w.user?.email} · {w.user?.user_type}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatNaira(w.ledger_balance)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNaira(w.available_balance)}</TableCell>
                    <TableCell>
                      <StatusBadge status={w.status} />
                    </TableCell>
                    <TableCell>{formatDate(w.updated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pager page={page} totalPages={q.data?.meta?.totalPages} total={q.data?.meta?.total} onPage={(p) => set({ page: String(p) })} />
        </QueryState>
      </CardContent>
    </Card>
  );
}

function Adjustments() {
  const [status, setStatus] = useState<string | undefined>("PENDING_APPROVAL");
  const qc = useQueryClient();
  const { can, admin } = useAdmin();
  const q = useQuery({ queryKey: ["adjustments", status], queryFn: () => walletsApi.adjustments(status) });
  const refresh = () => qc.invalidateQueries({ queryKey: ["adjustments"] });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Manual credits and debits</CardTitle>
        <CardDescription>Adjustments above the approval threshold need a second admin. You can’t approve your own.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <FilterSelect value={status} onChange={setStatus} options={["PENDING_APPROVAL", "APPROVED", "REJECTED"]} allLabel="All" />
        </div>
        <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="Nothing waiting for approval.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requested</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data?.data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{formatDateTime(a.created_at)}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/wallets/${a.wallet_id}`} className="font-mono text-xs text-primary underline">
                      {a.wallet_id.slice(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>{a.type === "CREDIT" ? "Credit" : "Debit"}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNaira(a.amount)}</TableCell>
                  <TableCell className="max-w-[260px]">{a.reason}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="space-x-2 whitespace-nowrap text-right">
                    {a.status === "PENDING_APPROVAL" && can("wallet:write") && (
                      <>
                        <ActionDialog
                          label="Approve"
                          disabled={a.requested_by === admin?.id}
                          title={`Approve this ${a.type.toLowerCase()} of ${formatNaira(a.amount)}?`}
                          description={`Reason given: “${a.reason}”. It’s applied to the wallet immediately.`}
                          fields={[{ name: "note", label: "Note", type: "reason" }]}
                          confirmLabel="Approve and apply"
                          success="Adjustment applied"
                          onConfirm={async (v) => {
                            await walletsApi.approveAdjustment(a.id, v.note as string | undefined);
                            refresh();
                          }}
                        />
                        <ActionDialog
                          label="Reject"
                          variant="outline"
                          title="Reject this adjustment?"
                          fields={[{ name: "note", label: "Reason", type: "reason", required: true }]}
                          confirmLabel="Reject"
                          success="Adjustment rejected"
                          onConfirm={async (v) => {
                            await walletsApi.rejectAdjustment(a.id, v.note as string);
                            refresh();
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
  );
}

function ReconciliationCard() {
  const q = useQuery({ queryKey: ["reconciliation"], queryFn: () => walletsApi.reconciliation() });
  const r = q.data?.data;
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Ledger check</CardTitle>
          <CardDescription>Every wallet’s balance against the sum of its entries. Also runs nightly at 02:30.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => q.refetch()} disabled={q.isFetching}>
          {q.isFetching ? "Checking…" : "Run now"}
        </Button>
      </CardHeader>
      <CardContent>
        <QueryState isLoading={q.isLoading} error={q.error}>
          {r && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Wallets checked" value={r.walletsChecked.toLocaleString()} />
                <Stat label="Owed to customers" value={formatNaira(r.totalLiabilityKobo)} hint="Total of all wallet balances" />
                <Stat label="On hold" value={formatNaira(r.totalHeldKobo)} hint="Withdrawals, rent contributions" />
                <Stat label="Mismatches" value={r.mismatches.length} />
              </div>
              {r.mismatches.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Every wallet matches its ledger ({formatDateTime(r.checkedAt)}).
                </p>
              ) : (
                <>
                  <p className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" /> These wallets don’t match their entries. Investigate before making changes.
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wallet</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">From entries</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                        <TableHead className="text-right">Holds</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.mismatches.map((m) => (
                        <TableRow key={m.walletId}>
                          <TableCell>
                            <Link href={`/dashboard/wallets/${m.walletId}`} className="font-mono text-xs text-primary underline">
                              {m.walletId.slice(0, 8)}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatNaira(m.ledgerBalanceKobo)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatNaira(m.computedFromEntriesKobo)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatNaira(m.availableBalanceKobo)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatNaira(m.activeHoldsKobo)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </div>
          )}
        </QueryState>
      </CardContent>
    </Card>
  );
}

function PaystackEvents() {
  const [filters, setFilters] = useState<{ event?: string; status?: string; reference?: string; page: number }>({ page: 1 });
  const [open, setOpen] = useState<PaystackEvent | null>(null);
  const q = useQuery({ queryKey: ["paystack-events", filters], queryFn: () => walletsApi.paystackEvents({ ...filters, limit: 30 }), placeholderData: keepPreviousData });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Paystack webhooks</CardTitle>
        <CardDescription>Every webhook received, stored before processing. Failed ones are retried automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <FilterSelect value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v, page: 1 }))} options={["RECEIVED", "PROCESSING", "PROCESSED", "FAILED", "IGNORED"]} allLabel="Any status" />
          <Input className="w-[220px]" placeholder="Event, e.g. charge.success" onKeyDown={(e) => e.key === "Enter" && setFilters((f) => ({ ...f, event: (e.target as HTMLInputElement).value.trim() || undefined, page: 1 }))} />
          <Input className="w-[220px]" placeholder="Reference" onKeyDown={(e) => e.key === "Enter" && setFilters((f) => ({ ...f, reference: (e.target as HTMLInputElement).value.trim() || undefined, page: 1 }))} />
        </div>
        <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="No events.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Received</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data?.data.map((e) => (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => setOpen(e)}>
                  <TableCell>{formatDateTime(e.created_at)}</TableCell>
                  <TableCell className="font-mono text-xs">{e.event}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs">{e.reference ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">{e.last_error ?? ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager page={filters.page} totalPages={q.data?.meta?.totalPages} total={q.data?.meta?.total} onPage={(p) => setFilters((f) => ({ ...f, page: p }))} />
        </QueryState>
        <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm">{open?.event}</DialogTitle>
            </DialogHeader>
            <pre className="max-h-[60vh] overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(open?.payload, null, 2)}</pre>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function WalletSettingsCard() {
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["wallet-settings"], queryFn: () => walletsApi.settings() });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Wallet settings</CardTitle>
        <CardDescription>Limits, fees and safety rules. They apply from now on.</CardDescription>
      </CardHeader>
      <CardContent>
        <QueryState isLoading={q.isLoading} error={q.error}>
          {q.data && (
            <SettingsForm
              value={q.data.data}
              disabled={!can("settings:write")}
              onSave={async (patch, reason) => {
                await walletsApi.updateSettings(patch as Record<string, number | boolean | string>, reason);
                await qc.invalidateQueries({ queryKey: ["wallet-settings"] });
              }}
              fields={[
                { key: "fundingMin", label: "Minimum top-up", type: "number", unit: "naira" },
                { key: "fundingMax", label: "Maximum top-up", type: "number", unit: "naira" },
                { key: "fundingDailyLimit", label: "Daily top-up limit", type: "number", unit: "naira" },
                { key: "fundingFeeBearer", label: "Card fee paid by", type: "select", options: [{ value: "BUSINESS", label: "The business" }, { value: "USER", label: "The customer" }] },
                { key: "withdrawalsEnabled", label: "Withdrawals enabled", type: "boolean" },
                { key: "withdrawalFee", label: "Withdrawal fee", type: "number", unit: "naira" },
                { key: "withdrawalMin", label: "Minimum withdrawal", type: "number", unit: "naira" },
                { key: "withdrawalMax", label: "Maximum withdrawal", type: "number", unit: "naira" },
                { key: "withdrawalDailyLimit", label: "Daily withdrawal limit", type: "number", unit: "naira" },
                { key: "withdrawalApprovalThreshold", label: "Withdrawals above this need approval", type: "number", unit: "naira", hint: "0 = never" },
                { key: "pinRequiredAbove", label: "Transaction PIN required above", type: "number", unit: "naira" },
                { key: "adminAdjustmentApprovalThreshold", label: "Manual adjustments above this need a second admin", type: "number", unit: "naira" },
                { key: "partialDeduction", label: "Auto-debit takes part payments when the wallet is short", type: "boolean" },
                { key: "allowScheduledDebitsWhenFrozen", label: "Installments still collected from frozen wallets", type: "boolean" },
                { key: "dvaEnabled", label: "Bank-transfer funding (dedicated accounts)", type: "boolean", hint: "Needs Paystack dedicated accounts enabled on the account." },
                { key: "pendingFundingReverifyMinutes", label: "Re-check pending top-ups after (minutes)", type: "number", unit: "count" },
              ]}
            />
          )}
        </QueryState>
      </CardContent>
    </Card>
  );
}

export default function WalletsPage() {
  return (
    <Suspense>
      <WalletsPageInner />
    </Suspense>
  );
}
