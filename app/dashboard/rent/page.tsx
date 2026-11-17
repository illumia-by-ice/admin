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
import { rnslApi, RENT_STATUSES, type RentStatus } from "@/lib/api/rnsl";
import { formatDate, formatNaira, fullName } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { cn } from "@/lib/utils";

const QUEUES: { label: string; status?: RentStatus }[] = [
  { label: "To review", status: "PENDING_REVIEW" },
  { label: "Payout failed", status: "PAYOUT_FAILED" },
  { label: "Manual payout", status: "MANUAL_PAYOUT" },
  { label: "All" },
];

function RentList() {
  const { values, set, page } = useUrlFilters<"status">();
  const status = values.status as RentStatus | undefined;
  const q = useQuery({ queryKey: ["rent", status, page], queryFn: () => rnslApi.list({ status, page, limit: 30 }), placeholderData: keepPreviousData });

  return (
    <div>
      <PageHeader title="Rent top-ups" description="Rent Now Save Later applications: review documents, pay landlords, and handle failed payouts." />
      <div className="mb-4 flex flex-wrap gap-2">
        {QUEUES.map((x) => (
          <Button key={x.label} size="sm" variant={status === x.status ? "default" : "outline"} onClick={() => set({ status: x.status })}>
            {x.label}
          </Button>
        ))}
        <FilterSelect value={status} onChange={(v) => set({ status: v })} options={RENT_STATUSES} allLabel="Any status" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="No applications here." onRetry={() => q.refetch()}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Rent</TableHead>
                    <TableHead className="text-right">Tenant pays</TableHead>
                    <TableHead className="text-right">Top-up</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={cn(q.isFetching && "opacity-60")}>
                  {q.data?.data.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Link href={`/dashboard/rent/${a.id}`} className="block">
                          <div className="font-medium">{fullName(a.user)}</div>
                          <div className="text-xs text-muted-foreground">{a.user?.email}</div>
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <Link href={`/dashboard/rent/${a.id}`} className="block truncate">
                          {a.property_address}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {a.city}, {a.state}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(a.rent_kobo)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(a.contribution_kobo)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(a.top_up_kobo)}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                      <TableCell>{formatDate(a.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager page={page} totalPages={q.data?.meta ? Math.ceil(q.data.meta.total / q.data.meta.limit) : 1} total={q.data?.meta?.total} onPage={(p) => set({ page: String(p) })} />
          </QueryState>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RentPage() {
  return (
    <Suspense>
      <RentList />
    </Suspense>
  );
}
