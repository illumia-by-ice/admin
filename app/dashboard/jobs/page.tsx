"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { QueryState } from "@/components/admin/query-state";
import { ActionDialog } from "@/components/admin/action-dialog";
import { jobsApi, RUNNABLE_JOBS } from "@/lib/api/jobs";
import { formatDateTime } from "@/lib/format";
import { useAdmin } from "@/lib/use-admin";

export default function JobsPage() {
  const qc = useQueryClient();
  const { can } = useAdmin();
  const q = useQuery({ queryKey: ["jobs"], queryFn: () => jobsApi.status(), refetchInterval: 15_000 });
  const byName = new Map((q.data?.data ?? []).map((j) => [j.name, j]));
  const others = (q.data?.data ?? []).filter((j) => !RUNNABLE_JOBS.some((r) => r.name === j.name));

  return (
    <div>
      <PageHeader title="Scheduled jobs" description="Background work for installment plans (Lagos time). Each job runs on one server at a time; running one now is safe." />
      <QueryState isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()}>
        <div className="grid gap-4 lg:grid-cols-3">
          {RUNNABLE_JOBS.map((j) => {
            const s = byName.get(j.name);
            return (
              <Card key={j.name}>
                <CardHeader>
                  <CardTitle className="text-base">{j.label}</CardTitle>
                  <CardDescription>{j.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Last run: </span>
                    {s?.running ? <span className="font-medium text-sky-600">running now…</span> : formatDateTime(s?.lastFinishedAt)}
                  </div>
                  {s?.lastError && <div className="rounded bg-destructive/10 p-2 text-xs text-destructive">{s.lastError}</div>}
                  {s?.lastResult && <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(s.lastResult, null, 2)}</pre>}
                  {can("finance:write") && (
                    <ActionDialog
                      label="Run now"
                      variant="outline"
                      disabled={s?.running}
                      title={`Run “${j.label}” now?`}
                      description="It does exactly what the scheduled run does. Re-running is safe: nothing is charged or sent twice."
                      confirmLabel="Run"
                      success="Job finished"
                      onConfirm={async () => {
                        try {
                          return await jobsApi.run(j.name);
                        } finally {
                          qc.invalidateQueries({ queryKey: ["jobs"] });
                        }
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {others.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Other jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {others.map((j) => (
                <div key={j.name} className="flex justify-between gap-4">
                  <span className="font-mono text-xs">{j.name}</span>
                  <span className="text-muted-foreground">{j.lastError ? `failed: ${j.lastError}` : formatDateTime(j.lastFinishedAt)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </QueryState>
    </div>
  );
}
