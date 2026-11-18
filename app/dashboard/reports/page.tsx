"use client";

import { Suspense } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { QueryState } from "@/components/admin/query-state";
import { Stat } from "@/components/admin/kv";
import { FilterSelect } from "@/components/admin/filter-select";
import { ReportChart, compactNaira } from "@/components/admin/report-chart";
import { reportsApi, type GroupBy } from "@/lib/api/reports";
import { formatNaira } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { cn } from "@/lib/utils";

const RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "12m", label: "12 months", days: 365 },
];

const naira = (k: number) => formatNaira(k);
const nairaCsv = (k: number) => (k / 100).toFixed(2);
const count = (n: number) => n.toLocaleString("en-NG");

function bucketLabel(groupBy: GroupBy) {
  return (iso: string) => {
    const d = new Date(`${iso}T12:00:00Z`);
    if (groupBy === "month") return d.toLocaleDateString("en-NG", { month: "short", year: "numeric", timeZone: "UTC" });
    const day = d.toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "UTC" });
    return groupBy === "week" ? `w/c ${day}` : day;
  };
}

function Reports() {
  const { values, set } = useUrlFilters<"range" | "groupBy">();
  const range = RANGES.find((r) => r.key === values.range) ?? RANGES[1];
  // Rounded to the minute so the query key is stable between renders.
  const to = new Date(Math.floor(Date.now() / 60_000) * 60_000);
  const from = new Date(to.getTime() - (range.days - 1) * 86_400_000);
  const groupBy = values.groupBy as GroupBy | undefined;
  const q = useQuery({
    queryKey: ["reports", range.key, groupBy],
    queryFn: () => reportsApi.overview({ from: from.toISOString(), to: to.toISOString(), groupBy }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
  const r = q.data?.data;
  const fmtX = bucketLabel(r?.range.groupBy ?? "day");
  const tag = `${range.key}-${r?.range.groupBy ?? "day"}`;

  return (
    <div>
      <PageHeader title="Reports" description="Collections, plans, wallet money and orders over time, plus where overdue money stands today." />
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {RANGES.map((x) => (
          <Button key={x.key} size="sm" variant={range.key === x.key ? "default" : "outline"} onClick={() => set({ range: x.key === "30d" ? undefined : x.key, groupBy: undefined })}>
            {x.label}
          </Button>
        ))}
        <FilterSelect value={groupBy} onChange={(v) => set({ groupBy: v })} options={["day", "week", "month"]} labels={{ day: "By day", week: "By week", month: "By month" }} allLabel="Automatic grouping" className="w-[190px]" />
      </div>
      <QueryState isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()}>
        {r && (
          <div className={cn("space-y-6", q.isFetching && "opacity-70 transition-opacity")}>
            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">In this period</h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Installments collected" value={formatNaira(r.kpis.collectedKobo)} hint={`incl. ${formatNaira(r.kpis.lateFeesCollectedKobo)} late fees`} />
                <Stat label="Plans started" value={count(r.kpis.plansStarted)} hint={`${formatNaira(r.kpis.financedKobo)} to be repaid`} />
                <Stat label="Markup and interest booked" value={formatNaira(r.kpis.markupBookedKobo)} hint="On plans started in this period" />
                <Stat label="Marketplace sales" value={formatNaira(r.kpis.gmvKobo)} hint="Orders not cancelled" />
              </div>
            </section>
            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">Right now</h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Still to be repaid" value={formatNaira(r.kpis.outstandingKobo)} hint={`${count(r.kpis.openPlans)} open plans`} />
                <Stat label="Overdue" value={formatNaira(r.kpis.overdueKobo)} hint={`${count(r.kpis.overduePlans)} plans overdue`} />
                <Stat label="In default" value={count(r.kpis.defaultedPlans)} hint={`${(r.kpis.defaultRate * 100).toFixed(1)}% of repaying and finished plans`} />
                <Stat label="Held in wallets" value={formatNaira(r.kpis.walletLiabilityKobo)} hint="Owed to customers" />
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <ReportChart
                title="Installments collected"
                description="By how the payment was made."
                data={r.series.collections}
                formatX={fmtX}
                series={[
                  { key: "WALLET", label: "Paid in app" },
                  { key: "AUTO_DEBIT", label: "Auto-debit" },
                  { key: "ADMIN_MANUAL", label: "Recorded offline" },
                ]}
                format={naira}
                axisFormat={compactNaira}
                csvFormat={nairaCsv}
                filename={`collections-${tag}.csv`}
              />
              <ReportChart
                title="Plans started"
                description="Number of new plans, including any later rejected or cancelled."
                data={r.series.plansStarted}
                formatX={fmtX}
                series={[
                  { key: "BNPL", label: "Buy Now Pay Later" },
                  { key: "SNBL", label: "Save Now Buy Later" },
                  { key: "RNSL", label: "Rent Now Save Later" },
                ]}
                format={count}
                axisFormat={count}
                filename={`plans-started-${tag}.csv`}
              />
              <ReportChart
                title="Amount financed"
                description="What customers agreed to repay on plans that went ahead."
                data={r.series.financed}
                formatX={fmtX}
                series={[
                  { key: "BNPL", label: "Buy Now Pay Later" },
                  { key: "SNBL", label: "Save Now Buy Later" },
                  { key: "RNSL", label: "Rent Now Save Later" },
                ]}
                format={naira}
                axisFormat={compactNaira}
                csvFormat={nairaCsv}
                filename={`financed-${tag}.csv`}
              />
              <ReportChart
                title="Wallet money in and out"
                description="Top-ups (card and bank transfer) against withdrawals to banks."
                data={r.series.walletFlows}
                formatX={fmtX}
                kind="line"
                series={[
                  { key: "moneyIn", label: "Top-ups" },
                  { key: "moneyOut", label: "Withdrawals" },
                ]}
                format={naira}
                axisFormat={compactNaira}
                csvFormat={nairaCsv}
                filename={`wallet-flows-${tag}.csv`}
              />
              <ReportChart
                title="Marketplace sales"
                description="Order value by how it was paid."
                data={r.series.gmv}
                formatX={fmtX}
                series={[
                  { key: "WALLET", label: "Wallet" },
                  { key: "BNPL", label: "Buy Now Pay Later" },
                  { key: "SNBL", label: "Save Now Buy Later" },
                ]}
                format={naira}
                axisFormat={compactNaira}
                csvFormat={nairaCsv}
                filename={`sales-${tag}.csv`}
              />
              <ReportChart
                title="Overdue money by age"
                description="Unpaid overdue installments today (incl. late fees), by days past due."
                data={r.overdueAging}
                xKey="label"
                xLabel="Days past due"
                series={[{ key: "kobo", label: "Overdue" }]}
                format={naira}
                axisFormat={compactNaira}
                csvFormat={nairaCsv}
                filename="overdue-aging.csv"
              />
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense>
      <Reports />
    </Suspense>
  );
}
