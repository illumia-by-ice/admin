"use client";

import { Suspense } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { Pager } from "@/components/admin/pager";
import { ActionDialog } from "@/components/admin/action-dialog";
import { walletsApi } from "@/lib/api/wallets";
import { formatDateTime, formatNaira, fullName } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { useAdmin } from "@/lib/use-admin";
import { cn } from "@/lib/utils";

const QUEUES = [
  { label: "Awaiting approval", status: "PENDING_APPROVAL" },
  { label: "Manual payout", status: "MANUAL_PAYOUT" },
  { label: "Processing", status: "PROCESSING" },
  { label: "Failed", status: "FAILED" },
  { label: "All", status: undefined },
];

function Withdrawals() {
  const { values, set, page } = useUrlFilters<"status">();
  const status = "status" in values ? values.status : undefined;
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["withdrawals", status, page], queryFn: () => walletsApi.withdrawals({ status, page, limit: 30 }), placeholderData: keepPreviousData });
  const refresh = () => qc.invalidateQueries({ queryKey: ["withdrawals"] });

  return (
    <div>
      <PageHeader title="Withdrawals" description="Customer withdrawals to their bank. Large ones wait for approval; failed transfers return the money to the wallet automatically." />
      <div className="mb-4 flex flex-wrap gap-2">
        {QUEUES.map((x) => (
          <Button key={x.label} size="sm" variant={status === x.status ? "default" : "outline"} onClick={() => set({ status: x.status })}>
            {x.label}
          </Button>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="Nothing in this queue." onRetry={() => q.refetch()}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requested</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody className={cn(q.isFetching && "opacity-60")}>
                  {q.data?.data.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="whitespace-nowrap">{formatDateTime(w.created_at)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{fullName(w.user)}</div>
                        <div className="text-xs text-muted-foreground">{w.user?.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {w.bankAccount ? (
                          <>
                            {w.bankAccount.account_name}
                            <div className="text-xs text-muted-foreground">
                              {w.bankAccount.bank_name} {w.bankAccount.account_number}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(w.amount)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(w.fee)}</TableCell>
                      <TableCell>
                        <StatusBadge status={w.status} />
                        {w.failure_reason && <div className="mt-1 max-w-[220px] text-xs text-muted-foreground">{w.failure_reason}</div>}
                      </TableCell>
                      <TableCell className="space-x-2 whitespace-nowrap text-right">
                        {can("wallet:write") && w.status === "PENDING_APPROVAL" && (
                          <ActionDialog
                            label="Approve"
                            title={`Send ${formatNaira(w.amount)} to ${w.bankAccount?.account_name ?? "the customer"}?`}
                            description="The transfer starts now (or goes to manual payout if Paystack Transfers is off)."
                            fields={[{ name: "reason", label: "Note", type: "reason" }]}
                            confirmLabel="Approve"
                            success="Withdrawal approved"
                            onConfirm={async (v) => {
                              await walletsApi.approveWithdrawal(w.id, v.reason as string | undefined);
                              refresh();
                            }}
                          />
                        )}
                        {can("wallet:write") && w.status === "MANUAL_PAYOUT" && (
                          <ActionDialog
                            label="Mark paid"
                            title="Mark as paid?"
                            description={`Only after sending ${formatNaira(w.amount)} to ${w.bankAccount?.account_name} (${w.bankAccount?.bank_name} ${w.bankAccount?.account_number}) outside Paystack.`}
                            fields={[{ name: "reference", label: "Bank reference", type: "text", required: true, minLength: 3 }]}
                            confirmLabel="Mark paid"
                            success="Marked as paid"
                            onConfirm={async (v) => {
                              await walletsApi.markWithdrawalPaid(w.id, v.reference as string);
                              refresh();
                            }}
                          />
                        )}
                        {can("wallet:write") && (w.status === "PENDING_APPROVAL" || w.status === "MANUAL_PAYOUT") && (
                          <ActionDialog
                            label="Reject"
                            variant="outline"
                            title="Reject this withdrawal?"
                            description="The money goes back to the customer’s wallet and they’re told why."
                            fields={[{ name: "reason", label: "Reason", type: "reason", required: true }]}
                            confirmLabel="Reject"
                            success="Rejected; funds returned"
                            onConfirm={async (v) => {
                              await walletsApi.rejectWithdrawal(w.id, v.reason as string);
                              refresh();
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager page={page} totalPages={q.data?.meta?.totalPages} total={q.data?.meta?.total} onPage={(p) => set({ page: String(p) })} />
          </QueryState>
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Customer wallets: <Link href="/dashboard/wallets" className="underline">Wallets</Link>
      </p>
    </div>
  );
}

export default function WithdrawalsPage() {
  return (
    <Suspense>
      <Withdrawals />
    </Suspense>
  );
}
