"use client";

import { Suspense } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { QueryState } from "@/components/admin/query-state";
import { Pager } from "@/components/admin/pager";
import { FilterSelect } from "@/components/admin/filter-select";
import { ActionDialog } from "@/components/admin/action-dialog";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api/http";
import { entityHref, FOLLOWUP_KIND_LABEL, followupsApi, type FollowUpKind } from "@/lib/api/followups";
import { formatDate, fullName } from "@/lib/format";
import { useUrlFilters } from "@/lib/use-url-filters";
import { cn } from "@/lib/utils";

const VIEWS = [
  { key: "mine-today", label: "My follow-ups due", filters: { assignedTo: "me", due: "today", status: "OPEN" } },
  { key: "mine", label: "All mine", filters: { assignedTo: "me", status: "OPEN" } },
  { key: "unassigned", label: "Unassigned", filters: { assignedTo: "unassigned", status: "OPEN" } },
  { key: "overdue", label: "Overdue (everyone)", filters: { due: "overdue", status: "OPEN" } },
  { key: "open", label: "All open", filters: { status: "OPEN" } },
  { key: "closed", label: "Closed", filters: { status: "DONE" } },
] as const;

function SalesDesk() {
  const { values, set, page } = useUrlFilters<"view" | "kind">();
  const view = VIEWS.find((v) => v.key === values.view) ?? VIEWS[0];
  const filters = { ...view.filters, kind: values.kind, page, limit: 50 };
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useQuery({ queryKey: ["followups", filters], queryFn: () => followupsApi.list(filters), placeholderData: keepPreviousData, refetchInterval: 60_000 });
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => followupsApi.staff(), staleTime: 5 * 60_000 });
  const refresh = () => qc.invalidateQueries({ queryKey: ["followups"] });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <PageHeader
        title="Sales desk"
        description="Follow-ups for the sales and customer service team: new applications, approved plans not started, missed payments, payments due with a short wallet, and items ready for delivery. Each owner gets a morning email of what's due."
        actions={
          <ActionDialog
            label="Add follow-up"
            title="Add a follow-up"
            fields={[
              { name: "title", label: "What needs doing", type: "text", required: true, minLength: 3 },
              { name: "due", label: "Due (YYYY-MM-DD)", type: "text", required: true, placeholder: new Date().toISOString().slice(0, 10) },
              { name: "notes", label: "Notes", type: "reason" },
            ]}
            confirmLabel="Add"
            success="Follow-up added"
            onConfirm={async (v) => {
              const due = new Date(`${v.due}T09:00:00+01:00`);
              if (Number.isNaN(due.getTime())) throw new Error("Use the date format YYYY-MM-DD");
              await followupsApi.create({ title: v.title as string, dueAt: due.toISOString(), notes: v.notes as string | undefined });
              refresh();
            }}
          />
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <Button key={v.key} size="sm" variant={view.key === v.key ? "default" : "outline"} onClick={() => set({ view: v.key === "mine-today" ? undefined : v.key })}>
            {v.label}
          </Button>
        ))}
        <FilterSelect value={values.kind} onChange={(v) => set({ kind: v })} options={Object.keys(FOLLOWUP_KIND_LABEL) as FollowUpKind[]} labels={FOLLOWUP_KIND_LABEL} allLabel="Any kind" className="w-[220px]" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <QueryState isLoading={q.isLoading} error={q.error} isEmpty={q.data?.data.length === 0} empty="Nothing here. Nice work." onRetry={() => q.refetch()}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody className={cn(q.isFetching && "opacity-60")}>
                  {q.data?.data.map((f) => {
                    const href = entityHref(f);
                    const late = f.status === "OPEN" && new Date(f.due_at) < today;
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="max-w-[320px]">
                          <div className="font-medium">{href ? <Link href={href} className="hover:underline">{f.title}</Link> : f.title}</div>
                          <div className="text-xs text-muted-foreground">{FOLLOWUP_KIND_LABEL[f.kind]}</div>
                          {f.notes ? <div className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">{f.notes}</div> : null}
                        </TableCell>
                        <TableCell className="text-sm">
                          {f.customer ? (
                            <>
                              {fullName(f.customer)}
                              <div className="text-xs text-muted-foreground">{f.customer.phone ?? f.customer.email}</div>
                            </>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className={cn("whitespace-nowrap", late && "font-medium text-destructive")}>{formatDate(f.due_at)}</TableCell>
                        <TableCell>
                          <Select
                            value={f.assigned_to ?? "none"}
                            disabled={f.status !== "OPEN"}
                            onValueChange={async (v) => {
                              try {
                                await followupsApi.update(f.id, { assignedTo: v === "none" ? null : v });
                                refresh();
                              } catch (e) {
                                toast({ title: "Couldn't reassign", description: errorMessage(e), variant: "destructive" });
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-[170px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Unassigned</SelectItem>
                              {staff.data?.data.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {fullName(s)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="space-x-2 whitespace-nowrap text-right">
                          {f.status === "OPEN" ? (
                            <>
                              <ActionDialog label="Done" title="What happened?" fields={[{ name: "note", label: "Outcome", type: "reason", required: true, placeholder: "e.g. Called, customer will pay Friday" }]} confirmLabel="Mark done" success="Marked as done" onConfirm={async (v) => { await followupsApi.done(f.id, v.note as string); refresh(); }} />
                              <ActionDialog label="Dismiss" variant="ghost" title="Dismiss this follow-up?" fields={[{ name: "note", label: "Why", type: "reason", required: true }]} confirmLabel="Dismiss" success="Dismissed" onConfirm={async (v) => { await followupsApi.dismiss(f.id, v.note as string); refresh(); }} />
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">{f.status === "DONE" ? "Done" : "Dismissed"} {formatDate(f.completed_at)}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

export default function SalesDeskPage() {
  return (
    <Suspense>
      <SalesDesk />
    </Suspense>
  );
}
