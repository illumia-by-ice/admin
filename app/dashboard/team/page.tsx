"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { QueryState } from "@/components/admin/query-state";
import { ActionDialog } from "@/components/admin/action-dialog";
import { http } from "@/lib/api/http";
import { followupsApi } from "@/lib/api/followups";
import { fullName } from "@/lib/format";
import { ROLE_LABEL, useAdmin } from "@/lib/use-admin";

const ROLES = ["SALES", "CUSTOMER_SERVICE", "SUPPORT", "FINANCE", "SUPER_ADMIN"] as const;
const ROLE_HELP: Record<string, string> = {
  SALES: "Applications (approve, reject, assign), sales desk, orders and deliveries. Can't move money or change settings.",
  CUSTOMER_SERVICE: "Looks up customers, orders, plans and wallets (read-only money), sales desk, notes.",
  SUPPORT: "Users, content, orders, read-only finance.",
  FINANCE: "Plans, rent top-ups, wallets, withdrawals, applications, sales desk.",
  SUPER_ADMIN: "Everything, including settings and team accounts.",
};

/** Staff accounts and their roles. Only a super admin can add or change them. */
export default function TeamPage() {
  const qc = useQueryClient();
  const { admin } = useAdmin();
  const q = useQuery({ queryKey: ["staff"], queryFn: () => followupsApi.staff() });
  const isSuper = admin?.role === "SUPER_ADMIN";
  const roleField = { name: "role", label: "Role", type: "select" as const, required: true, options: ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] })) };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Admin portal accounts for sales, customer service and the rest of the team. Each role only sees and does what it needs."
        actions={
          isSuper ? (
            <ActionDialog
              label="Add team member"
              title="Add a team member"
              description="They'll get an email to set their password."
              fields={[
                { name: "first_name", label: "First name", type: "text", required: true },
                { name: "last_name", label: "Last name", type: "text", required: true },
                { name: "email", label: "Work email", type: "text", required: true },
                roleField,
              ]}
              confirmLabel="Add"
              success="Team member added"
              onConfirm={async (v) => {
                await http.post("/admin/users", { first_name: v.first_name, last_name: v.last_name, email: v.email, user_type: "admin", admin_role: v.role, reason: "Team member added" });
                qc.invalidateQueries({ queryKey: ["staff"] });
              }}
            />
          ) : null
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles</CardTitle>
          <CardDescription>What each role can do.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r} className="rounded-md border p-3 text-sm">
              <div className="font-medium">{ROLE_LABEL[r]}</div>
              <div className="text-muted-foreground">{ROLE_HELP[r]}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <QueryState isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data?.data.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{fullName(s)}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{ROLE_LABEL[s.admin_role ?? "SUPER_ADMIN"]}</TableCell>
                    <TableCell className="text-right">
                      {isSuper && s.id !== admin?.id ? (
                        <ActionDialog
                          label="Change role"
                          variant="outline"
                          title={`Change ${fullName(s)}'s role`}
                          fields={[roleField, { name: "reason", label: "Reason", type: "reason", required: true }]}
                          confirmLabel="Save"
                          success="Role changed"
                          onConfirm={async (v) => {
                            await http.put(`/admin/users/${s.id}`, { admin_role: v.role }, v.reason as string);
                            qc.invalidateQueries({ queryKey: ["staff"] });
                          }}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </QueryState>
        </CardContent>
      </Card>
    </div>
  );
}
