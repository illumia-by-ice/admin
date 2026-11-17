"use client";

import { use, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { KV, Stat } from "@/components/admin/kv";
import { ActionDialog } from "@/components/admin/action-dialog";
import { FilterSelect } from "@/components/admin/filter-select";
import { walletsApi, type WalletTransaction } from "@/lib/api/wallets";
import { formatDateTime, formatNaira, fullName, humanize } from "@/lib/format";
import { useAdmin } from "@/lib/use-admin";
import { cn } from "@/lib/utils";

export default function WalletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const { can } = useAdmin();
  const [status, setStatus] = useState<string | undefined>();
  const [open, setOpen] = useState<WalletTransaction | null>(null);
  const q = useQuery({ queryKey: ["wallet", id], queryFn: () => walletsApi.get(id) });
  const txs = useInfiniteQuery({
    queryKey: ["wallet-tx", id, status],
    queryFn: ({ pageParam }) => walletsApi.transactions(id, { cursor: pageParam, status, limit: 50 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta?.nextCursor ?? undefined,
  });
  const w = q.data?.data;
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["wallet", id] });
    qc.invalidateQueries({ queryKey: ["wallet-tx", id] });
    qc.invalidateQueries({ queryKey: ["wallets"] });
  };
  const rows = txs.data?.pages.flatMap((p) => p.data) ?? [];
  const reason = { name: "reason", label: "Reason", type: "reason" as const, required: true, hint: "Kept in the audit log." };

  return (
    <QueryState isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()}>
      {w && (
        <div className="space-y-6">
          <PageHeader
            back={{ href: "/dashboard/wallets", label: "Wallets" }}
            title={
              <span className="flex flex-wrap items-center gap-3">
                {fullName(w.user)} <StatusBadge status={w.status} />
              </span>
            }
            description={
              <>
                {w.user?.email} · {w.user?.user_type} · identity {humanize(w.user?.verification_status ?? "unverified")}
                {w.status_reason ? ` · frozen: ${w.status_reason}` : ""}
              </>
            }
            actions={
              can("wallet:write") && w.status !== "CLOSED" ? (
                <>
                  <ActionDialog
                    label="Credit / debit"
                    title="Manual adjustment"
                    description="Large adjustments wait for a second admin’s approval."
                    fields={[
                      { name: "type", label: "Type", type: "select", required: true, options: [{ value: "CREDIT", label: "Credit (add money)" }, { value: "DEBIT", label: "Debit (take money)" }] },
                      { name: "amount", label: "Amount (₦)", type: "amount", required: true },
                      reason,
                    ]}
                    confirmLabel="Submit"
                    success={(r: any) => r?.message ?? "Adjustment submitted"}
                    onConfirm={async (v) => {
                      const type = v.type as "CREDIT" | "DEBIT";
                      const r = await walletsApi.adjust(w.id, { type, amount: v.amount as number, reason: v.reason as string });
                      refresh();
                      return r;
                    }}
                  />
                  {w.status === "ACTIVE" ? (
                    <ActionDialog label="Freeze" destructive title="Freeze this wallet?" description="The customer can’t spend or withdraw. Scheduled installments may still be collected (wallet setting)." fields={[reason]} confirmLabel="Freeze" success="Wallet frozen" onConfirm={async (v) => { await walletsApi.freeze(w.id, v.reason as string); refresh(); }} />
                  ) : (
                    <ActionDialog label="Unfreeze" title="Unfreeze this wallet?" fields={[reason]} confirmLabel="Unfreeze" success="Wallet active again" onConfirm={async (v) => { await walletsApi.unfreeze(w.id, v.reason as string); refresh(); }} />
                  )}
                </>
              ) : null
            }
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Balance" value={formatNaira(w.ledger_balance)} />
            <Stat label="Available" value={formatNaira(w.available_balance)} />
            <Stat label="On hold" value={formatNaira(w.ledger_balance - w.available_balance)} hint={`${w.holds.length} active hold${w.holds.length === 1 ? "" : "s"}`} />
            <Stat label="Currency" value={w.currency} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Holds</CardTitle>
                <CardDescription>Money set aside: withdrawals in progress, rent contributions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {w.holds.length === 0 ? <p className="text-muted-foreground">None</p> : w.holds.map((h) => <div key={h.id} className="flex justify-between gap-2"><span>{humanize(h.purpose)}</span><span className="tabular-nums">{formatNaira(h.amount)}</span></div>)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Saved cards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {w.cards.length === 0 ? <p className="text-muted-foreground">None</p> : w.cards.map((c) => (
                  <div key={c.id} className="flex justify-between gap-2">
                    <span>{humanize(c.brand ?? "card")} •••• {c.last4} {c.is_default ? "(default)" : ""}</span>
                    <span className="text-xs text-muted-foreground">{c.auto_debit_enabled ? "auto-debit on" : "auto-debit off"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bank details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <KV items={[["Funding account", w.dedicatedAccount ? `${w.dedicatedAccount.bank_name} ${w.dedicatedAccount.account_number}` : "—"]]} />
                {w.bankAccounts.map((b) => <div key={b.id}>{b.account_name} · {b.bank_name} {b.account_number}</div>)}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Transactions</CardTitle>
              <FilterSelect value={status} onChange={setStatus} options={["PENDING", "SUCCESS", "FAILED", "REVERSED"]} allLabel="Any status" />
            </CardHeader>
            <CardContent>
              <QueryState isLoading={txs.isLoading} error={txs.error} isEmpty={rows.length === 0} empty="No transactions.">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance after</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="whitespace-nowrap">{formatDateTime(t.created_at)}</TableCell>
                          <TableCell className="max-w-[260px]">
                            <button className="text-left hover:underline" onClick={() => setOpen(t)}>
                              {t.narration}
                            </button>
                            <div className="truncate font-mono text-[11px] text-muted-foreground">{t.reference}</div>
                          </TableCell>
                          <TableCell className="text-xs">{humanize(t.category)}</TableCell>
                          <TableCell className={cn("text-right tabular-nums", t.type === "CREDIT" ? "text-emerald-700 dark:text-emerald-400" : "")}>
                            {t.type === "CREDIT" ? "+" : "−"}
                            {formatNaira(t.amount)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatNaira(t.balance_after)}</TableCell>
                          <TableCell>
                            <StatusBadge status={t.status} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {can("wallet:write") && t.status === "PENDING" && t.category === "FUNDING_CARD" && (
                              <ActionDialog label="Re-check" variant="outline" title="Re-check this top-up with Paystack?" description="Settles it if Paystack confirms the payment." confirmLabel="Re-check" success="Checked with Paystack" onConfirm={async () => { await walletsApi.reverify(t.reference); refresh(); }} />
                            )}
                            {can("wallet:write") && t.status === "SUCCESS" && !t.reversal_of && (
                              <ActionDialog label="Reverse" variant="ghost" title="Reverse this transaction?" description="Adds an opposite entry. The original is never edited. Use only to correct a mistake." fields={[reason]} confirmLabel="Reverse" destructive success="Reversed" onConfirm={async (v) => { await walletsApi.reverse(t.id, v.reason as string); refresh(); }} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {txs.hasNextPage && (
                  <div className="pt-4 text-center">
                    <Button variant="outline" size="sm" onClick={() => txs.fetchNextPage()} disabled={txs.isFetchingNextPage}>
                      {txs.isFetchingNextPage ? "Loading…" : "Load more"}
                    </Button>
                  </div>
                )}
              </QueryState>
            </CardContent>
          </Card>

          <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{open?.narration}</DialogTitle>
              </DialogHeader>
              {open && (
                <div className="space-y-4">
                  <KV
                    items={[
                      ["Amount", `${open.type === "CREDIT" ? "+" : "−"}${formatNaira(open.amount)}`],
                      ["Status", humanize(open.status)],
                      ["Balance before → after", `${formatNaira(open.balance_before)} → ${formatNaira(open.balance_after)}`],
                      ["Category", humanize(open.category)],
                      ["Reference", <span key="r" className="font-mono text-xs">{open.reference}</span>],
                      ["Paystack reference", <span key="e" className="font-mono text-xs">{open.external_reference ?? "—"}</span>],
                      ["When", formatDateTime(open.created_at)],
                    ]}
                  />
                  {open.metadata && <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(open.metadata, null, 2)}</pre>}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </QueryState>
  );
}
