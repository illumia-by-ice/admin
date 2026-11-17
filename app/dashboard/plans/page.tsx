"use client";

import { Suspense } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { Pager } from "@/components/admin/pager";
import { FilterSelect } from "@/components/admin/filter-select";
import { financeApi, PLAN_STATUSES, PRODUCT_LABEL, type FinanceProduct, type PlanFilters, type PlanStatus } from "@/lib/api/finance";
import { formatDate, formatNaira, fullName } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { cn } from "@/lib/utils";

const PRESETS: { key: string; label: string; filters: Partial<Record<"type" | "status" | "overdue" | "cancelRequested", string>> }[] = [
  { key: "all", label: "All plans", filters: {} },
  { key: "approval", label: "Awaiting approval", filters: { type: "BNPL", status: "PENDING_APPROVAL" } },
  { key: "overdue", label: "Overdue / defaulted", filters: { overdue: "true" } },
  { key: "cancel", label: "Cancellation requests", filters: { type: "SNBL", cancelRequested: "true" } },
];

function PlansList() {
  const { values, set, page } = useUrlFilters<"type" | "status" | "overdue" | "cancelRequested" | "userId">();
  const filters: PlanFilters = {
    type: values.type as FinanceProduct | undefined,
    status: values.status as PlanStatus | undefined,
    overdue: values.overdue === "true" ? "true" : undefined,
    cancelRequested: values.cancelRequested === "true" ? "true" : undefined,
    userId: values.userId,
    page,
    limit: 30,
  };
  const q = useQuery({ queryKey: ["plans", filters], queryFn: () => financeApi.plans(filters), placeholderData: keepPreviousData });
  const active = PRESETS.find((p) => Object.entries({ type: undefined, status: undefined, overdue: undefined, cancelRequested: undefined, ...p.filters }).every(([k, v]) => values[k as keyof typeof values] === v))?.key;

  return (
    <div>
      <PageHeader title="Installment plans" description="Buy Now Pay Later, Save Now Buy Later and Rent Now Save Later plans across all customers." />
      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.key} size="sm" variant={active === p.key ? "default" : "outline"} onClick={() => set({ type: undefined, status: undefined, overdue: undefined, cancelRequested: undefined, ...p.filters })}>
            {p.label}
          </Button>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <FilterSelect value={values.type} onChange={(v) => set({ type: v })} options={["BNPL", "SNBL", "RNSL"]} labels={PRODUCT_LABEL} allLabel="All products" className="w-[200px]" />
            <FilterSelect value={values.status} onChange={(v) => set({ status: v, overdue: undefined })} options={PLAN_STATUSES} allLabel="All statuses" />
            <Input className="w-[260px]" placeholder="Customer ID" defaultValue={values.userId} onKeyDown={(e) => e.key === "Enter" && set({ userId: (e.target as HTMLInputElement).value.trim() || undefined })} />
          </div>
          <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="No plans match these filters." onRetry={() => q.refetch()}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Next due</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={cn(q.isFetching && "opacity-60")}>
                  {q.data?.data.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer">
                      <TableCell>
                        <Link href={`/dashboard/plans/${p.id}`} className="block">
                          <div className="font-medium">{fullName(p.user)}</div>
                          <div className="text-xs text-muted-foreground">{p.user?.email}</div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/plans/${p.id}`}>{p.type}</Link>
                        <div className="text-xs text-muted-foreground">
                          {p.tenure} × {p.frequency.toLowerCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={p.status} />
                          {p.cancel_requested_at && <span className="text-xs text-amber-600">Cancel requested</span>}
                          {p.release_blocked_reason && <span className="text-xs text-amber-600">Release on hold: KYC</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(p.total_kobo)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(p.amount_paid_kobo)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(p.balanceKobo)}</TableCell>
                      <TableCell className={cn(p.status === "OVERDUE" || p.status === "DEFAULTED" ? "text-destructive" : "")}>{formatDate(p.next_due_at)}</TableCell>
                      <TableCell>{formatDate(p.created_at)}</TableCell>
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

export default function PlansPage() {
  return (
    <Suspense>
      <PlansList />
    </Suspense>
  );
}
