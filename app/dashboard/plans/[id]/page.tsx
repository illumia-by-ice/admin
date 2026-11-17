"use client";

import { use, type ReactNode } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { KV, Stat } from "@/components/admin/kv";
import { ActionDialog } from "@/components/admin/action-dialog";
import { financeApi, PRODUCT_LABEL, type PlanDetail } from "@/lib/api/finance";
import { formatBps, formatDate, formatDateTime, formatNaira, fullName, humanize } from "@/lib/format";
import { useAdmin } from "@/lib/use-admin";

const PAYABLE = ["PENDING_APPROVAL", "SAVING", "ACTIVE", "PRODUCT_RELEASED", "OVERDUE", "DEFAULTED"];

export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["plan", id], queryFn: () => financeApi.plan(id) });
  const plan = q.data?.data;
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["plan", id] });
    qc.invalidateQueries({ queryKey: ["plans"] });
  };
  const act = (fn: () => Promise<unknown>) => async () => {
    const r = await fn();
    refresh();
    return r;
  };

  return (
    <QueryState isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()}>
      {plan && (
        <div className="space-y-6">
          <PageHeader
            back={{ href: "/dashboard/plans", label: "Installment plans" }}
            title={
              <span className="flex flex-wrap items-center gap-3">
                {PRODUCT_LABEL[plan.type]} <StatusBadge status={plan.status} />
              </span>
            }
            description={
              <>
                {fullName(plan.user)} · {plan.user?.email} · {plan.user?.phone ?? "no phone"} · <span className="font-mono text-xs">{plan.id}</span>
              </>
            }
            actions={can("finance:write") ? <PlanActions plan={plan} act={act} /> : null}
          />

          {plan.cancel_requested_at && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>The customer asked to cancel on {formatDateTime(plan.cancel_requested_at)}</AlertTitle>
              <AlertDescription>“{plan.cancel_request_reason}”. Approve with “Cancel plan” (the plan’s cancellation fee applies unless you waive it), or decline.</AlertDescription>
            </Alert>
          )}
          {plan.release_blocked_reason && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Release on hold: {humanize(plan.release_blocked_reason)}</AlertTitle>
              <AlertDescription>The customer has reached the release point but isn’t verified. Approving their verification releases the item automatically.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Stat label="Total to pay" value={formatNaira(plan.total_kobo)} />
            <Stat label="Paid" value={formatNaira(plan.amount_paid_kobo)} />
            <Stat label="Outstanding" value={formatNaira(plan.amounts.payoffKobo)} hint="incl. unpaid late fees" />
            <Stat label="Next payment" value={formatNaira(plan.amounts.nextKobo)} hint={formatDate(plan.next_due_at)} />
            <Stat label="Late fees charged" value={formatNaira(plan.late_fees_kobo)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Terms</CardTitle>
                <CardDescription>Fixed when the plan started. Admins only: customers never see the markup.</CardDescription>
              </CardHeader>
              <CardContent>
                <KV
                  items={[
                    [plan.type === "RNSL" ? "Top-up (before interest)" : "Base price", formatNaira(plan.pricing.principalKobo)],
                    [plan.type === "BNPL" ? "Markup" : "Interest", `${formatBps(plan.pricing.markupBps)} · ${formatNaira(plan.pricing.markupKobo)}`],
                    ["Schedule", `${plan.tenure} ${plan.frequency.toLowerCase()} payments`],
                    ["Down payment", formatNaira(plan.down_payment_kobo)],
                    ...(plan.release_threshold_bps !== null ? ([["Release point", `${formatBps(plan.release_threshold_bps)} of the total`]] as [string, string][]) : []),
                    ["Grace / late fee", `${plan.config_snapshot?.shared?.graceDays ?? "—"} days · ${lateFeeLabel(plan)}`],
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <KV
                  items={[
                    ["Created", formatDateTime(plan.created_at)],
                    ["Approved", plan.approved_at ? formatDateTime(plan.approved_at) : "—"],
                    ...(plan.type === "SNBL" ? ([["Item released", formatDateTime(plan.released_at)]] as [string, string][]) : []),
                    ["Overdue since", formatDate(plan.overdue_since)],
                    ["Completed", formatDateTime(plan.completed_at)],
                    ["Decision note", plan.decision_reason ?? "—"],
                    ...(plan.order_id ? ([["Order", <Link key="o" className="text-primary underline" href={`/dashboard/orders/${plan.order_id}`}>View order</Link>]] as [string, ReactNode][]) : []),
                    ...(plan.rent_application_id ? ([["Rent application", <Link key="r" className="text-primary underline" href={`/dashboard/rent/${plan.rent_application_id}`}>View application</Link>]] as [string, ReactNode][]) : []),
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Unpaid late fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auto-debit tries</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.items.map((i) => {
                    const feeOwed = i.late_fee_kobo - i.late_fee_paid;
                    return (
                      <TableRow key={i.id}>
                        <TableCell>{i.seq === 0 ? "Down payment" : i.seq}</TableCell>
                        <TableCell>{formatDate(i.due_date)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNaira(i.amount_due)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNaira(i.amount_paid)}</TableCell>
                        <TableCell className="text-right tabular-nums">{feeOwed > 0 ? formatNaira(feeOwed) : "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={i.status} />
                        </TableCell>
                        <TableCell>{i.attempt_count || "—"}</TableCell>
                        <TableCell className="text-right">
                          {feeOwed > 0 && can("finance:write") && (
                            <ActionDialog
                              label="Waive fee"
                              variant="outline"
                              title={`Waive the ${formatNaira(feeOwed)} late fee on installment ${i.seq}?`}
                              fields={[{ name: "reason", label: "Reason", type: "reason", required: true }]}
                              confirmLabel="Waive late fee"
                              success="Late fee waived"
                              onConfirm={(vals) => act(() => financeApi.waiveLateFee(plan.id, i.id, String(vals.reason)))()}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {plan.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payments yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>How</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            {formatDateTime(p.created_at)}
                            {p.note && <div className="text-xs text-muted-foreground">{p.note}</div>}
                          </TableCell>
                          <TableCell>
                            {humanize(p.method)} · {humanize(p.kind)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatNaira(p.amount_kobo)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">History</CardTitle>
                <CardDescription>Every status change and admin action, with who did it.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {[...plan.events].reverse().map((e) => (
                    <li key={e.id} className="border-l-2 pl-3 text-sm">
                      <div className="font-medium">
                        {e.event === "status_changed" ? `${humanize(e.from_status)} → ${humanize(e.to_status)}` : humanize(e.event)}
                        {e.event === "payment" && e.data?.amountKobo ? ` · ${formatNaira(e.data.amountKobo as number)}` : ""}
                      </div>
                      {e.reason && <div className="text-muted-foreground">{e.reason}</div>}
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(e.created_at)} · {humanize(e.actor_type)}
                        {e.actor_id ? ` ${e.actor_id.slice(0, 8)}` : ""}
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  );
}

function lateFeeLabel(plan: PlanDetail) {
  const f = plan.config_snapshot?.shared?.lateFee;
  if (!f?.enabled) return "no late fee";
  return f.type === "FLAT" ? `${formatNaira(f.value * 100)} per late installment` : `${f.value}% per late installment`;
}

function PlanActions({ plan, act }: { plan: PlanDetail; act: (fn: () => Promise<unknown>) => () => Promise<unknown> }) {
  const reason = { name: "reason", label: "Reason", type: "reason" as const, required: true, hint: "Shown to the customer and kept in the audit trail." };
  const actions: ReactNode[] = [];
  // Runs the API call with the dialog's values, then refreshes the plan.
  const capture = (fn: (vals: Record<string, any>) => Promise<unknown>) => (vals: Record<string, unknown>) => act(() => fn(vals))();

  if (plan.type === "BNPL") {
    if (plan.status === "PENDING_APPROVAL") {
      actions.push(
        <ActionDialog
          key="approve"
          label="Approve"
          title="Approve this plan?"
          description="Due dates start from today, and the order is released to the seller to ship."
          fields={[{ name: "reason", label: "Note", type: "reason" }]}
          confirmLabel="Approve"
          success="Plan approved; the seller can ship"
          onConfirm={capture((x) => financeApi.bnplApprove(plan.id, x.reason))}
        />,
        <ActionDialog key="reject" label="Reject" destructive title="Reject this plan?" description="Anything the customer paid goes back to their wallet and the order is cancelled." fields={[reason]} confirmLabel="Reject plan" success="Plan rejected and refunded" onConfirm={capture((x) => financeApi.bnplReject(plan.id, x.reason))} />
      );
    }
    if (["PENDING_APPROVAL", "ACTIVE", "OVERDUE"].includes(plan.status)) {
      actions.push(
        <ActionDialog key="cancel" label="Cancel plan" variant="outline" title="Cancel this plan?" description="Only possible until the item ships. Everything paid is refunded to the customer’s wallet." fields={[reason]} confirmLabel="Cancel plan" destructive success="Plan cancelled and refunded" onConfirm={capture((x) => financeApi.bnplCancel(plan.id, x.reason))} />
      );
    }
  }

  if (plan.type === "SNBL") {
    if (plan.status === "SAVING" && plan.release_blocked_reason) {
      actions.push(<ActionDialog key="release" label="Retry release" variant="outline" title="Retry releasing the item?" description="Works once the customer is verified." success="Item released" onConfirm={capture(() => financeApi.snblRelease(plan.id))} />);
    }
    if (plan.cancel_requested_at) {
      actions.push(<ActionDialog key="decline" label="Decline request" variant="outline" title="Decline the cancellation request?" fields={[reason]} confirmLabel="Decline" success="Request declined" onConfirm={capture((x) => financeApi.snblDeclineCancel(plan.id, x.reason))} />);
    }
    if (["SAVING", "PRODUCT_RELEASED", "OVERDUE", "DEFAULTED"].includes(plan.status)) {
      actions.push(
        <ActionDialog
          key="cancel"
          label="Cancel plan"
          destructive
          title="Cancel this savings plan?"
          description={plan.status === "SAVING" ? "Everything saved goes back to the wallet, minus the plan’s cancellation fee unless you waive it." : "The item has been released: this is only possible until it ships, and the refund is in full."}
          fields={[reason, ...(plan.status === "SAVING" ? [{ name: "waiveFee", label: "Waive the cancellation fee", type: "checkbox" as const }] : [])]}
          confirmLabel="Cancel plan"
          success={(r: any) => `Plan cancelled. ${formatNaira(r?.data?.refundedKobo)} refunded${r?.data?.feeKobo ? ` (fee ${formatNaira(r.data.feeKobo)})` : ""}.`}
          onConfirm={capture((x) => financeApi.snblCancel(plan.id, x.reason, Boolean(x.waiveFee)))}
        />
      );
    }
  }

  if (PAYABLE.includes(plan.status) && plan.status !== "PENDING_APPROVAL") {
    actions.push(
      <ActionDialog
        key="pay"
        label="Record offline payment"
        variant="outline"
        title="Record a payment received outside the app"
        description="For a bank transfer or cash. It’s credited to the customer’s wallet and applied to this plan straight away (late fees first, oldest installment first)."
        fields={[
          { name: "amount", label: "Amount (₦)", type: "amount", required: true, hint: `Outstanding: ${formatNaira(plan.amounts.payoffKobo)}` },
          { name: "reference", label: "Bank reference", type: "text", minLength: 3 },
          { name: "note", label: "Note", type: "reason", required: true },
        ]}
        confirmLabel="Record payment"
        success="Payment recorded"
        onConfirm={capture((x) => financeApi.manualPayment(plan.id, { amount: x.amount, note: x.note, reference: x.reference }))}
      />
    );
  }

  actions.push(
    <ActionDialog
      key="note"
      label="Add note"
      variant="ghost"
      title="Add a note to this plan"
      fields={[
        { name: "note", label: "Note", type: "reason", required: true },
        { name: "followUp", label: "Flag for follow-up", type: "checkbox" },
      ]}
      confirmLabel="Save note"
      success="Note added"
      onConfirm={capture((x) => financeApi.note(plan.id, x.note, Boolean(x.followUp)))}
    />
  );
  return <>{actions}</>;
}
