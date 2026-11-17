"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { QueryState } from "@/components/admin/query-state";
import { KV } from "@/components/admin/kv";
import { ActionDialog } from "@/components/admin/action-dialog";
import { ordersApi } from "@/lib/api/orders";
import { formatDateTime, formatNaira, humanize } from "@/lib/format";
import { useAdmin } from "@/lib/use-admin";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["order", id], queryFn: () => ordersApi.get(id) });
  const o = q.data?.data;
  const run = (fn: () => Promise<unknown>) => async () => {
    const r = await fn();
    qc.invalidateQueries({ queryKey: ["order", id] });
    qc.invalidateQueries({ queryKey: ["orders"] });
    return r;
  };
  const financed = o && o.payment_method !== "WALLET";

  return (
    <QueryState isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()}>
      {o && (
        <div className="space-y-6">
          <PageHeader
            back={{ href: "/dashboard/orders", label: "Orders" }}
            title={
              <span className="flex flex-wrap items-center gap-3">
                Order <span className="font-mono text-lg">{o.id.slice(0, 8)}</span> <StatusBadge status={o.status} />
              </span>
            }
            description={`${humanize(o.payment_method)} · placed ${formatDateTime(o.created_at)}`}
            actions={
              can("orders:write") ? (
                <>
                  {o.status === "PROCESSING" && (
                    <ActionDialog key="ship" label="Mark shipped" title="Mark this order as shipped?" fields={[{ name: "trackingInfo", label: "Tracking info", type: "text" }]} confirmLabel="Mark shipped" success="Marked as shipped" onConfirm={(v) => run(() => ordersApi.ship(o.id, v.trackingInfo as string | undefined))()} />
                  )}
                  {o.status === "SHIPPED" && (
                    <ActionDialog key="deliver" label="Mark delivered" title="Mark as delivered?" description={`The seller is paid ${formatNaira(o.subtotal_kobo - o.commission_kobo)} now. Do this only once delivery is confirmed.`} confirmLabel="Mark delivered" success="Delivered; the seller has been paid" onConfirm={run(() => ordersApi.deliver(o.id))} />
                  )}
                  {(o.status === "PROCESSING" || o.status === "SHIPPED") && !financed && (
                    <ActionDialog key="cancel" label="Cancel order" destructive title="Cancel and refund this order?" description={`${formatNaira(o.subtotal_kobo)} goes back to the buyer’s wallet.`} fields={[{ name: "reason", label: "Reason", type: "reason", required: true }]} confirmLabel="Cancel order" success="Order cancelled and refunded" onConfirm={(v) => run(() => ordersApi.cancel(o.id, v.reason as string))()} />
                  )}
                  {financed && o.plan_id && o.status !== "DELIVERED" && o.status !== "CANCELLED" && (
                    <Link href={`/dashboard/plans/${o.plan_id}`} className="inline-flex h-9 items-center rounded-md border px-3 text-sm">
                      Cancel through the plan
                    </Link>
                  )}
                </>
              ) : null
            }
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <KV
                  items={[
                    ["Name", o.delivery.fullName],
                    ["Phone", o.delivery.phone],
                    ["Address", `${o.delivery.address}, ${o.delivery.city}, ${o.delivery.state}`],
                    ["Note", o.delivery.note ?? "—"],
                    ["Tracking", o.tracking_info ?? "—"],
                    ["Shipped", formatDateTime(o.shipped_at)],
                    ["Delivered", formatDateTime(o.delivered_at)],
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Money</CardTitle>
              </CardHeader>
              <CardContent>
                <KV
                  items={[
                    ["Subtotal", formatNaira(o.subtotal_kobo)],
                    ["Commission", formatNaira(o.commission_kobo)],
                    ["Seller receives", formatNaira(o.subtotal_kobo - o.commission_kobo)],
                    ["Seller paid", o.payout_transaction_id ? "Yes" : "Not yet"],
                    ["Refunded", o.refund_transaction_id ? "Yes" : "No"],
                    ["Plan", o.plan_id ? <Link key="p" href={`/dashboard/plans/${o.plan_id}`} className="text-primary underline">View plan</Link> : "—"],
                    ["Buyer", <span key="b" className="font-mono text-xs">{o.user_id}</span>],
                    ["Seller", <span key="s" className="font-mono text-xs">{o.seller_id}</span>],
                    ["Cancel reason", o.cancel_reason ?? "—"],
                  ]}
                />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {o.items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="flex items-center gap-3">
                        {i.image_src && <img src={i.image_src} alt="" className="h-10 w-10 rounded object-cover" />}
                        {i.title}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(i.unit_price_kobo)}</TableCell>
                      <TableCell className="text-right">{i.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(i.line_total_kobo)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {o.events && o.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">History</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {[...o.events].reverse().map((e) => (
                    <li key={e.id} className="border-l-2 pl-3 text-sm">
                      <div className="font-medium">{e.to_status ? `${humanize(e.from_status)} → ${humanize(e.to_status)}` : humanize(e.event)}</div>
                      {e.reason && <div className="text-muted-foreground">{e.reason}</div>}
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(e.created_at)} · {humanize(e.actor_type)}
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </QueryState>
  );
}
