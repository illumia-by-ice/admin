import { http } from "./http";

export type FollowUpKind = "APPLICATION_REVIEW" | "START_REMINDER" | "PAYMENT_DUE" | "PAYMENT_MISSED" | "DELIVERY_READY" | "CUSTOM";
export const FOLLOWUP_KIND_LABEL: Record<FollowUpKind, string> = {
  APPLICATION_REVIEW: "Review application",
  START_REMINDER: "Approved, not started",
  PAYMENT_DUE: "Payment due, wallet short",
  PAYMENT_MISSED: "Missed payment",
  DELIVERY_READY: "Ready for delivery",
  CUSTOM: "Task",
};

export interface Person {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone?: string | null;
}

export interface FollowUp {
  id: string;
  kind: FollowUpKind;
  status: "OPEN" | "DONE" | "DISMISSED";
  title: string;
  due_at: string;
  entity_type: string | null;
  entity_id: string | null;
  customer_id: string | null;
  assigned_to: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  customer: Person | null;
  assignee: Person | null;
}

export interface StaffMember extends Person {
  admin_role: string | null;
}

export const followupsApi = {
  list: (q: { status?: string; assignedTo?: string; kind?: string; due?: string; customerId?: string; entityId?: string; page?: number; limit?: number }) => http.get<FollowUp[]>("/admin/followups", q),
  staff: () => http.get<StaffMember[]>("/admin/followups/staff"),
  create: (body: { title: string; dueAt: string; notes?: string; assignedTo?: string | null; entityType?: string; entityId?: string; customerId?: string }) => http.post<FollowUp>("/admin/followups", body),
  update: (id: string, body: { assignedTo?: string | null; dueAt?: string; notes?: string }) => http.patch<FollowUp>(`/admin/followups/${id}`, body),
  done: (id: string, note: string) => http.post<FollowUp>(`/admin/followups/${id}/done`, { note }),
  dismiss: (id: string, note: string) => http.post<FollowUp>(`/admin/followups/${id}/dismiss`, { note }),
};

/** Where a follow-up's record lives in the admin portal. */
export const entityHref = (f: Pick<FollowUp, "entity_type" | "entity_id">) =>
  !f.entity_id ? null
  : f.entity_type === "InstallmentApplication" ? `/dashboard/applications/${f.entity_id}`
  : f.entity_type === "InstallmentPlan" ? `/dashboard/plans/${f.entity_id}`
  : f.entity_type === "Order" ? `/dashboard/orders/${f.entity_id}`
  : f.entity_type === "RentApplication" ? `/dashboard/rent/${f.entity_id}`
  : null;
