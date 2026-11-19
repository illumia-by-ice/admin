"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { KV } from "@/components/admin/kv";
import { ActionDialog } from "@/components/admin/action-dialog";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api/http";
import { applicationsApi } from "@/lib/api/applications";
import { followupsApi, entityHref, FOLLOWUP_KIND_LABEL } from "@/lib/api/followups";
import { formatBps, formatDate, formatDateTime, formatNaira, humanize } from "@/lib/format";
import { useAdmin } from "@/lib/use-admin";

export default function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const { can } = useAdmin();
  const { toast } = useToast();
  const q = useQuery({ queryKey: ["application", id], queryFn: () => applicationsApi.get(id) });
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => followupsApi.staff(), staleTime: 5 * 60_000 });
  const followups = useQuery({ queryKey: ["followups", "entity", id], queryFn: () => followupsApi.list({ entityId: id, limit: 20 }) });
  const a = q.data?.data;
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["application", id] });
    qc.invalidateQueries({ queryKey: ["applications"] });
    qc.invalidateQueries({ queryKey: ["followups"] });
  };
  const quote = a?.quote && !("error" in a.quote) ? a.quote : null;

  return (
    <QueryState isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()}>
      {a && (
        <div className="space-y-6">
          <PageHeader
            back={{ href: "/dashboard/applications", label: "Applications" }}
            title={
              <span className="flex flex-wrap items-center gap-3">
                {a.full_name} <StatusBadge status={a.status} />
              </span>
            }
            description={`${a.finance_product ? (a.finance_product === "BNPL" ? "Buy Now Pay Later" : "Save Now Buy Later") : humanize(a.type)} application · received ${formatDateTime(a.created_at)}`}
            actions={
              can("applications:write") && a.status === "PENDING_REVIEW" ? (
                <>
                  <ActionDialog
                    label="Approve"
                    title="Approve this application?"
                    description={a.finance_product ? "The customer is notified and can start the plan in the app within the approval window (default 14 days)." : "The customer is notified that their application is approved."}
                    fields={[{ name: "reason", label: "Note", type: "reason" }]}
                    confirmLabel="Approve"
                    success="Approved"
                    onConfirm={async (v) => {
                      await applicationsApi.approve(id, v.reason as string | undefined);
                      refresh();
                    }}
                  />
                  <ActionDialog
                    label="Reject"
                    destructive
                    title="Reject this application?"
                    fields={[{ name: "reason", label: "Reason", type: "reason", required: true, hint: "Shown to the customer." }]}
                    confirmLabel="Reject"
                    success="Rejected"
                    onConfirm={async (v) => {
                      await applicationsApi.reject(id, v.reason as string);
                      refresh();
                    }}
                  />
                </>
              ) : can("applications:write") && a.status === "APPROVED" ? (
                <ActionDialog
                  label="Withdraw approval"
                  variant="outline"
                  title="Withdraw the approval?"
                  description="The customer won't be able to start the plan."
                  fields={[{ name: "reason", label: "Reason", type: "reason", required: true }]}
                  confirmLabel="Withdraw"
                  destructive
                  success="Approval withdrawn"
                  onConfirm={async (v) => {
                    await applicationsApi.reject(id, v.reason as string);
                    refresh();
                  }}
                />
              ) : null
            }
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Plan requested</CardTitle>
                {a.status === "APPROVED" && a.approved_until ? <CardDescription>The customer can start it until {formatDate(a.approved_until)}.</CardDescription> : null}
              </CardHeader>
              <CardContent>
                <KV
                  items={[
                    ["Item", a.marketplace ? a.marketplace.title : a.property?.title ?? (a.is_external_property ? a.external_property_location : "—")],
                    ["Price", a.marketplace ? formatNaira(a.marketplace.price * 100) : a.property ? formatNaira(a.property.price * 100) : "—"],
                    ["Terms", a.finance_product ? `${a.tenure} ${a.frequency?.toLowerCase()} payments · quantity ${a.quantity ?? 1}` : "Enquiry (no plan chosen)"],
                    ...(quote
                      ? ([
                          ["Total to repay", formatNaira(quote.totalKobo)],
                          [a.finance_product === "SNBL" ? "Down payment (item released)" : "First payment", formatNaira(a.finance_product === "SNBL" ? quote.downPaymentKobo : quote.perInstallmentKobo)],
                          ["Each payment", formatNaira(quote.perInstallmentKobo)],
                          ["Markup (admins only)", formatBps(quote.markupBps)],
                          ...(a.finance_product === "BNPL" && quote.releaseThresholdBps ? ([["Delivered after paying", `${formatBps(quote.releaseThresholdBps)}, with no missed payment`]] as [string, string][]) : []),
                        ] as [string, string][])
                      : a.quote && "error" in a.quote
                        ? ([["Current quote", a.quote.error]] as [string, string][])
                        : []),
                    ["Plan", a.plan ? <Link key="p" className="text-primary underline" href={`/dashboard/plans/${a.plan.id}`}>{humanize(a.plan.status)} · {formatNaira(a.plan.amount_paid_kobo)} of {formatNaira(a.plan.total_kobo)} paid</Link> : "Not started"],
                    ["Decision", a.decision_reason ? `${a.decision_reason} (${formatDateTime(a.reviewed_at)})` : "—"],
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Owner</CardTitle>
                <CardDescription>The team member following this up. Their follow-ups and reminders come to them.</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={a.assigned_to ?? "none"}
                  disabled={!can("applications:write")}
                  onValueChange={async (v) => {
                    try {
                      await applicationsApi.assign(id, v === "none" ? null : v);
                      toast({ title: "Owner updated" });
                      refresh();
                    } catch (e) {
                      toast({ title: "Couldn't assign", description: errorMessage(e), variant: "destructive" });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {staff.data?.data.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {[s.first_name, s.last_name].filter(Boolean).join(" ") || s.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Applicant</CardTitle>
              </CardHeader>
              <CardContent>
                <KV
                  items={[
                    ["Name", a.full_name],
                    ["Phone", a.phone],
                    ["Email", a.email],
                    ["Date of birth", formatDate(a.date_of_birth)],
                    ["Address", [a.residential_address, a.state].filter(Boolean).join(", ") || "—"],
                    ["Identity in app", a.user ? `${humanize(a.user.verification_status ?? "unverified")}` : "—"],
                    ["BVN", a.bvn ?? "—"],
                    ["NIN", a.nin ?? "—"],
                    ["ID type", a.id_type ?? "—"],
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Employment and guarantor</CardTitle>
              </CardHeader>
              <CardContent>
                <KV
                  items={[
                    ["Employment", a.employment_status ?? "—"],
                    ["Employer", a.employer_name ?? "—"],
                    ["Job title", a.job_title ?? "—"],
                    ["Monthly income", a.monthly_income ?? "—"],
                    ["Time in job", a.employment_length ?? "—"],
                    ["Guarantor", a.guarantor_name ? `${a.guarantor_name} (${a.guarantor_relationship ?? "—"})` : "—"],
                    ["Guarantor phone", a.guarantor_phone ?? "—"],
                    ["Guarantor employer", a.guarantor_employer ?? "—"],
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {a.files.length === 0 ? (
                  <p className="text-muted-foreground">No documents uploaded.</p>
                ) : (
                  a.files.map((f) => (
                    <a key={f.id} href={f.src} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary underline">
                      {f.name ?? "Document"} <ExternalLink className="h-3 w-3" />
                    </a>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Follow-ups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {followups.data?.data.length ? (
                  followups.data.data.map((f) => (
                    <div key={f.id} className="flex items-start justify-between gap-3 border-l-2 pl-3">
                      <div>
                        <div className="font-medium">{f.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {FOLLOWUP_KIND_LABEL[f.kind]} · due {formatDate(f.due_at)}
                        </div>
                      </div>
                      <StatusBadge status={f.status === "OPEN" ? "PENDING" : f.status === "DONE" ? "COMPLETED" : "CANCELLED"} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">None.</p>
                )}
                {entityHref({ entity_type: "InstallmentApplication", entity_id: id }) ? (
                  <Link href="/dashboard/sales-desk" className="text-primary underline">
                    Open the sales desk
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  );
}
