import { http } from "./http";

export type UserType = "buyer" | "agent" | "vendor" | "artisan";
export type Interval = "weekly" | "monthly" | "quarterly" | "biannually" | "annually";

export interface SubscriptionPlan {
  id: string;
  planId: string;
  name: string;
  fullName: string;
  userType: UserType;
  amount: number;
  description: string | null;
  interval: Interval;
  isActive: boolean;
  isFreeTier: boolean;
  archivedAt: string | null;
  sortOrder: number;
  limits: Record<string, number | null>;
  planDetails: { displayName: string; price: number; period: string; description: string; features: string[]; highlights?: string[] };
  activeSubscribers: number;
}

export interface Entitlement {
  key: string;
  label: string;
  description: string;
}

export interface PlanInput {
  user_type?: UserType;
  name?: string;
  description?: string | null;
  features?: string[];
  highlights?: string[];
  amount?: number;
  interval?: Interval;
  is_free_tier?: boolean;
  sort_order?: number;
  limits?: Record<string, number | null>;
  applyToExistingSubscribers?: boolean;
  reason?: string;
}

export interface Refund {
  id: string;
  transaction_id: string;
  kind: "UNDERPAYMENT" | "OVERPAYMENT" | "CURRENCY_MISMATCH" | "ADMIN";
  amount_kobo: number;
  currency: string;
  reason: string;
  status: "PENDING" | "SENDING" | "PROCESSING" | "PROCESSED" | "FAILED";
  attempts: number;
  last_error: string | null;
  processed_at: string | null;
  created_at: string;
}

export const subscriptionsApi = {
  entitlements: () => http.get<Entitlement[]>("/admin/subscription-plans/entitlements"),
  list: (q: { userType?: UserType; includeArchived?: "true" }) => http.get<SubscriptionPlan[]>("/admin/subscription-plans", q),
  create: (body: PlanInput) => http.post<SubscriptionPlan>("/admin/subscription-plans", body),
  update: (planId: string, body: PlanInput) => http.patch<SubscriptionPlan>(`/admin/subscription-plans/${planId}`, body),
  archive: (planId: string, reason: string) => http.post(`/admin/subscription-plans/${planId}/archive`, { reason }),
  restore: (planId: string, reason?: string) => http.post(`/admin/subscription-plans/${planId}/restore`, { reason }),
  refunds: (q: { status?: string; page?: number; limit?: number }) => http.get<Refund[]>("/admin/refunds", q),
  retryRefund: (id: string) => http.post(`/admin/refunds/${id}/retry`),
};
