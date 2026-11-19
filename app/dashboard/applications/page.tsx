"use client";

import { Suspense } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { Pager } from "@/components/admin/pager";
import { FilterSelect } from "@/components/admin/filter-select";
import { applicationsApi, APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/api/applications";
import { followupsApi } from "@/lib/api/followups";
import { formatDate, formatNaira } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { useAdmin } from "@/lib/use-admin";
import { cn } from "@/lib/utils";

const QUEUES: { label: string; status?: ApplicationStatus; mine?: boolean }[] = [
  { label: "To review", status: "PENDING_REVIEW" },
  { label: "Mine to review", status: "PENDING_REVIEW", mine: true },
  { label: "Approved, not started", status: "APPROVED" },
  { label: "Started", status: "STARTED" },
  { label: "All" },
];

const PRODUCT = { BNPL: "Buy Now Pay Later", SNBL: "Save Now Buy Later" } as const;

function ApplicationsList() {
  const { values, set, page } = useUrlFilters<"status" | "product" | "mine">();
  const { admin } = useAdmin();
  const status = values.status as ApplicationStatus | undefined;
  const filters = { status, financeProduct: values.product, assignedTo: values.mine === "1" ? admin?.id : undefined, page, limit: 30 };
  const q = useQuery({ queryKey: ["applications", filters], queryFn: () => applicationsApi.list(filters), placeholderData: keepPreviousData, enabled: values.mine !== "1" || !!admin });
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => followupsApi.staff(), staleTime: 5 * 60_000 });
  const name = (id: string | null) => {
    const s = staff.data?.data.find((x) => x.id === id);
    return s ? [s.first_name, s.last_name].filter(Boolean).join(" ") || s.email : "Unassigned";
  };
  const active = QUEUES.find((x) => x.status === status && !!x.mine === (values.mine === "1"));

  return (
    <div>
      <PageHeader title="Applications" description="Installment applications. Approve a Buy Now Pay Later or Save Now Buy Later application and the customer can start the plan. Every new one is also emailed to sales." />
      <div className="mb-4 flex flex-wrap gap-2">
        {QUEUES.map((x) => (
          <Button key={x.label} size="sm" variant={active?.label === x.label ? "default" : "outline"} onClick={() => set({ status: x.status, mine: x.mine ? "1" : undefined })}>
            {x.label}
          </Button>
        ))}
        <FilterSelect value={values.product} onChange={(v) => set({ product: v })} options={["BNPL", "SNBL"]} labels={PRODUCT} allLabel="Any plan type" className="w-[200px]" />
        <FilterSelect value={status} onChange={(v) => set({ status: v })} options={APPLICATION_STATUSES} allLabel="Any status" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="No applications here." onRetry={() => q.refetch()}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>For</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={cn(q.isFetching && "opacity-60")}>
                  {q.data?.data.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Link href={`/dashboard/applications/${a.id}`} className="block">
                          <div className="font-medium">{a.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {a.email} · {a.phone}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <div className="truncate">{a.marketplace?.title ?? a.property?.title ?? (a.type === "property" ? "Property" : "Marketplace item")}</div>
                        <div className="text-xs text-muted-foreground">{formatNaira(((a.marketplace?.price ?? a.property?.price ?? 0) as number) * 100)}</div>
                      </TableCell>
                      <TableCell>
                        {a.finance_product ? (
                          <>
                            {a.finance_product}
                            <div className="text-xs text-muted-foreground">
                              {a.tenure} × {a.frequency?.toLowerCase()}
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Enquiry</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                        {a.status === "APPROVED" && a.approved_until ? <div className="mt-1 text-xs text-muted-foreground">until {formatDate(a.approved_until)}</div> : null}
                      </TableCell>
                      <TableCell className="text-sm">{name(a.assigned_to)}</TableCell>
                      <TableCell>{formatDate(a.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager page={page} totalPages={q.data?.meta?.totalPages} total={q.data?.meta?.total} onPage={(p) => set({ page: String(p) })} />
          </QueryState>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense>
      <ApplicationsList />
    </Suspense>
  );
}
