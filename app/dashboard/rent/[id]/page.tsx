"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { KV, Stat } from "@/components/admin/kv";
import { ActionDialog } from "@/components/admin/action-dialog";
import { rnslApi, type RentApplicationDetail } from "@/lib/api/rnsl";
import { formatBps, formatDate, formatDateTime, formatNaira, fullName, humanize } from "@/lib/format";
import { useAdmin } from "@/lib/use-admin";

const DOC_LABEL: Record<string, string> = { RENT_DOCUMENT: "Tenancy agreement / rent invoice", CONTRIBUTION_PROOF: "Proof of tenant’s payment", LANDLORD_ID: "Landlord ID", OTHER: "Other" };

export default function RentApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["rent-app", id], queryFn: () => rnslApi.get(id) });
  const app = q.data?.data;
  const run = (fn: () => Promise<unknown>) => async () => {
    try {
      return await fn();
    } finally {
      qc.invalidateQueries({ queryKey: ["rent-app", id] });
      qc.invalidateQueries({ queryKey: ["rent"] });
    }
  };

  return (
    <QueryState isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()}>
      {app && (
        <div className="space-y-6">
          <PageHeader
            back={{ href: "/dashboard/rent", label: "Rent top-ups" }}
            title={
              <span className="flex flex-wrap items-center gap-3">
                Rent application <StatusBadge status={app.status} />
              </span>
            }
            description={
              <>
                {fullName(app.user)} · {app.user?.email} · {app.user?.phone ?? "no phone"} · identity {humanize(app.user?.verification_status ?? "unverified")}
              </>
            }
            actions={can("finance:write") ? <Actions app={app} run={run} /> : null}
          />

          {app.status === "PAYOUT_FAILED" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>The payout to the landlord failed</AlertTitle>
              <AlertDescription>
                {app.payout_failure_reason ?? "No reason given"}. Retry it, pay the landlord by bank and mark it paid, or reject the application (the tenant’s contribution is released). Before any of these, the last transfer is checked with Paystack, so the landlord is never paid twice.
              </AlertDescription>
            </Alert>
          )}
          {app.status === "MANUAL_PAYOUT" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Approved: pay the landlord manually</AlertTitle>
              <AlertDescription>
                Paystack Transfers is off. Send {formatNaira(app.payout_kobo)} to {app.landlord_account_name} ({app.landlord_bank_name} {app.landlord_account_number}), then mark it paid with the bank reference.
              </AlertDescription>
            </Alert>
          )}
          {app.status === "PENDING_REVIEW" && app.missingDocuments.length > 0 && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Waiting for documents</AlertTitle>
              <AlertDescription>Missing: {app.missingDocuments.map((d) => DOC_LABEL[d]).join(", ")}. It can’t be approved until the tenant uploads them.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Rent" value={formatNaira(app.rent_kobo)} />
            <Stat label="Tenant pays" value={formatNaira(app.contribution_kobo)} hint={app.contribution_mode === "WALLET" ? `Held in wallet: ${humanize(app.contributionHold?.status ?? "—")}` : "Paid to the landlord directly"} />
            <Stat label="Our top-up" value={formatNaira(app.top_up_kobo)} />
            <Stat label="Landlord receives" value={formatNaira(app.payout_kobo)} hint={app.paid_at ? `Paid ${formatDate(app.paid_at)}` : undefined} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Landlord and property</CardTitle>
                <CardDescription>The account name was confirmed with Paystack when the tenant applied.</CardDescription>
              </CardHeader>
              <CardContent>
                <KV
                  items={[
                    ["Landlord", app.landlord_name],
                    ["Phone", app.landlord_phone],
                    ["Email", app.landlord_email ?? "—"],
                    ["Pays to", `${app.landlord_account_name} · ${app.landlord_bank_name} ${app.landlord_account_number}`],
                    ["Property", `${app.property_address}, ${app.city}, ${app.state}`],
                    ["Rent starts", formatDate(app.rent_start_date)],
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Repayment and payout</CardTitle>
              </CardHeader>
              <CardContent>
                <KV
                  items={[
                    ["Repayment total", formatNaira(app.plan.total_kobo)],
                    ["Interest", `${formatBps(app.plan.pricing.markupBps)} · ${formatNaira(app.plan.pricing.markupKobo)}`],
                    ["Schedule", `${app.plan.tenure} ${app.plan.frequency.toLowerCase()} payments`],
                    ["Plan", <Link key="p" className="text-primary underline" href={`/dashboard/plans/${app.plan_id}`}>{humanize(app.plan.status)}: view plan</Link>],
                    ["Payout attempts", app.payout_attempts || "—"],
                    ["Transfer", app.transfer_code ?? app.manual_reference ?? "—"],
                    ["Approved", formatDateTime(app.approved_at)],
                    ["Decision note", app.decision_reason ?? "—"],
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {app.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {app.documents.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{DOC_LABEL[d.kind]}</TableCell>
                        <TableCell>
                          {d.url ? (
                            <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">
                              {d.name ?? "Open"} <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(d.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </QueryState>
  );
}

function Actions({ app, run }: { app: RentApplicationDetail; run: (fn: () => Promise<unknown>) => () => Promise<unknown> }) {
  const reason = { name: "reason", label: "Reason", type: "reason" as const, required: true, hint: "Shown to the tenant." };
  const out = [];
  if (app.status === "PENDING_REVIEW") {
    out.push(
      <ActionDialog
        key="approve"
        label="Approve and pay landlord"
        disabled={app.missingDocuments.length > 0}
        title="Approve and pay the landlord?"
        description={`${formatNaira(app.payout_kobo)} will be sent to ${app.landlord_account_name} (${app.landlord_bank_name} ${app.landlord_account_number}). The tenant’s repayments start once the transfer succeeds.`}
        fields={[{ name: "reason", label: "Note", type: "reason" }]}
        confirmLabel="Approve and pay"
        success="Approved. Payout started."
        onConfirm={(v) => run(() => rnslApi.approve(app.id, v.reason as string | undefined))()}
      />
    );
  }
  if (app.status === "PAYOUT_FAILED") {
    out.push(<ActionDialog key="retry" label="Retry payout" title="Retry the transfer to the landlord?" description="A new transfer is sent. Fix the cause first (e.g. the landlord’s bank) if you can." fields={[{ name: "reason", label: "Note", type: "reason" }]} confirmLabel="Retry payout" success="Payout retried" onConfirm={(v) => run(() => rnslApi.retryPayout(app.id, v.reason as string | undefined))()} />);
  }
  if (app.status === "PAYOUT_FAILED" || app.status === "MANUAL_PAYOUT") {
    out.push(
      <ActionDialog
        key="paid"
        label="Mark as paid"
        variant="outline"
        title="Mark the landlord as paid?"
        description="Only after the money has actually reached the landlord outside Paystack. The tenant’s contribution is taken and repayments start."
        fields={[
          { name: "reference", label: "Bank reference", type: "text", required: true, minLength: 3 },
          { name: "reason", label: "Note", type: "reason" },
        ]}
        confirmLabel="Mark paid"
        success="Marked as paid"
        onConfirm={(v) => run(() => rnslApi.markPaid(app.id, v.reference as string, v.reason as string | undefined))()}
      />
    );
  }
  if (["PENDING_REVIEW", "PAYOUT_FAILED", "MANUAL_PAYOUT"].includes(app.status) && app.plan.status === "PENDING_APPROVAL") {
    out.push(<ActionDialog key="reject" label="Reject" destructive title="Reject this application?" description="The tenant’s held contribution is released back to their wallet." fields={[reason]} confirmLabel="Reject" success="Application rejected" onConfirm={(v) => run(() => rnslApi.reject(app.id, v.reason as string))()} />);
  }
  return <>{out}</>;
}
