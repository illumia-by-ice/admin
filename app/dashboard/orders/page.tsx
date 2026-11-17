"use client";

import { Suspense } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { Pager } from "@/components/admin/pager";
import { FilterSelect } from "@/components/admin/filter-select";
import { SettingsForm } from "@/components/admin/settings-form";
import { ordersApi, ORDER_STATUSES, type OrderStatus } from "@/lib/api/orders";
import { formatDate, formatNaira } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { useAdmin } from "@/lib/use-admin";
import { cn } from "@/lib/utils";

function OrdersList() {
  const { values, set, page } = useUrlFilters<"status" | "method" | "tab">();
  const filters = { status: values.status as OrderStatus | undefined, method: values.method, page, limit: 30 };
  const q = useQuery({ queryKey: ["orders", filters], queryFn: () => ordersApi.list(filters), placeholderData: keepPreviousData });

  return (
    <div>
      <PageHeader title="Orders" description="Marketplace orders. Wallet orders are paid at checkout; BNPL/SNBL orders wait until their plan releases the item." />
      <Tabs value={values.tab ?? "orders"} onValueChange={(t) => set({ tab: t === "orders" ? undefined : t })}>
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <FilterSelect value={values.status} onChange={(v) => set({ status: v })} options={ORDER_STATUSES} allLabel="All statuses" />
                <FilterSelect value={values.method} onChange={(v) => set({ method: v })} options={["WALLET", "BNPL", "SNBL"]} labels={{ WALLET: "Wallet", BNPL: "BNPL", SNBL: "SNBL" }} allLabel="Any payment" />
              </div>
              <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="No orders match." onRetry={() => q.refetch()}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Placed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className={cn(q.isFetching && "opacity-60")}>
                      {q.data?.data.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell>
                            <Link href={`/dashboard/orders/${o.id}`} className="font-mono text-xs text-primary underline">
                              {o.id.slice(0, 8)}
                            </Link>
                            <div className="text-xs text-muted-foreground">{o.delivery?.fullName}</div>
                          </TableCell>
                          <TableCell className="max-w-[280px] truncate">{o.items.map((i) => `${i.quantity} × ${i.title}`).join(", ")}</TableCell>
                          <TableCell>{o.payment_method}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatNaira(o.subtotal_kobo)}</TableCell>
                          <TableCell>
                            <StatusBadge status={o.status} />
                          </TableCell>
                          <TableCell>{formatDate(o.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Pager page={page} totalPages={q.data?.meta?.totalPages} total={q.data?.meta?.total} onPage={(p) => set({ page: String(p) })} />
              </QueryState>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <OrderSettingsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrderSettingsCard() {
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["order-settings"], queryFn: () => ordersApi.settings() });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order settings</CardTitle>
        <CardDescription>Apply from now on.</CardDescription>
      </CardHeader>
      <CardContent>
        <QueryState isLoading={q.isLoading} error={q.error}>
          {q.data && (
            <SettingsForm
              value={q.data.data}
              disabled={!can("settings:write")}
              onSave={async (patch, reason) => {
                await ordersApi.updateSettings(patch, reason);
                await qc.invalidateQueries({ queryKey: ["order-settings"] });
              }}
              fields={[
                { key: "autoConfirmDays", label: "Auto-confirm delivery after", type: "number", unit: "days", hint: "Shipped orders count as delivered (and the seller is paid) if the buyer doesn’t complain within this time." },
                { key: "commissionBps", label: "Commission", type: "number", unit: "percent", hint: "Kept from the seller’s payout." },
                { key: "maxQuantityPerItem", label: "Max quantity per item", type: "number", unit: "count" },
                { key: "maxCartItems", label: "Max items in a cart", type: "number", unit: "count" },
                { key: "buyerCanCancelBeforeShipping", label: "Buyers can cancel before shipping", type: "boolean" },
              ]}
            />
          )}
        </QueryState>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  );
}
