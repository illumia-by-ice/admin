import { http } from "./http";

export type FinanceProduct = "BNPL" | "SNBL" | "RNSL";
export type PlanStatus = "PENDING_APPROVAL" | "SAVING" | "ACTIVE" | "PRODUCT_RELEASED" | "DISBURSED" | "OVERDUE" | "DEFAULTED" | "COMPLETED" | "REJECTED" | "CANCELLED";
export const PRODUCT_LABEL: Record<FinanceProduct, string> = { BNPL: "Buy Now Pay Later", SNBL: "Save Now Buy Later", RNSL: "Rent Now Save Later" };
export const PLAN_STATUSES: PlanStatus[] = ["PENDING_APPROVAL", "SAVING", "ACTIVE", "PRODUCT_RELEASED", "DISBURSED", "OVERDUE", "DEFAULTED", "COMPLETED", "REJECTED", "CANCELLED"];

export interface PlanUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  verified?: boolean | null;
}

export interface PlanRow {
  id: string;
  user_id: string;
  type: FinanceProduct;
  status: PlanStatus;
  frequency: "WEEKLY" | "MONTHLY";
  tenure: number;
  principal_kobo: number;
  markup_bps: number;
  total_kobo: number;
  down_payment_kobo: number;
  amount_paid_kobo: number;
  late_fees_kobo: number;
  release_threshold_bps: number | null;
  product_id: string | null;
  order_id: string | null;
  rent_application_id: string | null;
  next_due_at: string | null;
  overdue_since: string | null;
  cancel_requested_at: string | null;
  cancel_request_reason: string | null;
  release_blocked_reason: string | null;
  released_at: string | null;
  decision_reason: string | null;
  approved_at: string | null;
  approved_by: string | null;
  start_date: string;
  created_at: string;
  completed_at: string | null;
  balanceKobo: number;
  user: PlanUser | null;
}

export interface ScheduleItem {
  id: string;
  seq: number;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  late_fee_kobo: number;
  late_fee_paid: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "WAIVED";
  paid_at: string | null;
  attempt_count: number;
}

export interface PlanPayment {
  id: string;
  amount_kobo: number;
  method: string;
  kind: string;
  reference: string;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
  allocations: { itemId: string; seq: number; lateFeeKobo: number; principalKobo: number }[];
}

export interface PlanEvent {
  id: string;
  event: string;
  from_status: string | null;
  to_status: string | null;
  actor_type: string;
  actor_id: string | null;
  reason: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface PlanDetail extends Omit<PlanRow, "balanceKobo"> {
  items: ScheduleItem[];
  payments: PlanPayment[];
  events: PlanEvent[];
  pricing: { principalKobo: number; markupBps: number; markupKobo: number };
  amounts: { nextKobo: number; payoffKobo: number };
  config_snapshot: Record<string, any>;
}

export interface PlanFilters {
  type?: FinanceProduct;
  status?: PlanStatus;
  userId?: string;
  overdue?: "true";
  cancelRequested?: "true";
  page?: number;
  limit?: number;
}

export const financeApi = {
  plans: (f: PlanFilters) => http.get<PlanRow[]>("/admin/finance/plans", { ...f }),
  plan: (id: string) => http.get<PlanDetail>(`/admin/finance/plans/${id}`),
  manualPayment: (id: string, body: { amount: number; note: string; reference?: string }) => http.post(`/admin/finance/plans/${id}/payments`, body),
  waiveLateFee: (id: string, itemId: string, reason: string) => http.post(`/admin/finance/plans/${id}/items/${itemId}/waive-late-fee`, { reason }),
  note: (id: string, note: string, followUp?: boolean) => http.post(`/admin/finance/plans/${id}/notes`, { note, followUp }),

  bnplApprove: (id: string, reason?: string) => http.post(`/admin/bnpl/plans/${id}/approve`, { reason }),
  bnplReject: (id: string, reason: string) => http.post<{ refundedKobo: number }>(`/admin/bnpl/plans/${id}/reject`, { reason }),
  bnplCancel: (id: string, reason: string) => http.post<{ refundedKobo: number }>(`/admin/bnpl/plans/${id}/cancel`, { reason }),

  snblCancel: (id: string, reason: string, waiveFee?: boolean) => http.post<{ paidKobo: number; feeKobo: number; refundedKobo: number }>(`/admin/snbl/plans/${id}/cancel`, { reason, waiveFee }),
  snblDeclineCancel: (id: string, reason: string) => http.post(`/admin/snbl/plans/${id}/cancel-request/decline`, { reason }),
  snblRelease: (id: string) => http.post(`/admin/snbl/plans/${id}/release`),

  settings: () => http.get<FinanceSettings>("/admin/finance/settings"),
  updateSettings: (patch: Partial<FinanceSettings>, reason?: string) => http.put<FinanceSettings>("/admin/finance/settings", patch, reason),
  overrides: () => http.get<Override[]>("/admin/finance/overrides"),
  setOverride: (body: { scope: "CATEGORY" | "PRODUCT"; scopeKey: string; product: FinanceProduct; config: Record<string, unknown>; reason?: string }) => http.put<Override>("/admin/finance/overrides", body),
  removeOverride: (id: string, reason?: string) => http.del(`/admin/finance/overrides/${id}`, reason),
  effective: (q: { product: FinanceProduct; productId?: string; category?: string }) =>
    http.get<{ product: FinanceProduct; category: string | null; settings: Record<string, unknown>; sources: Record<string, "global" | "category" | "product"> }>("/admin/finance/effective", q),
};

export interface Frequencies {
  WEEKLY: number[];
  MONTHLY: number[];
}

export interface FinanceSettings {
  bnpl: { enabled: boolean; frequencies: Frequencies; minAmount: number; maxAmount: number; markupBps: number; markupByTenure: Record<string, number>; downPaymentBps: number; autoApprove: boolean };
  snbl: {
    enabled: boolean;
    frequencies: Frequencies;
    minAmount: number;
    maxAmount: number;
    interestEnabled: boolean;
    interestBps: number;
    markupByTenure: Record<string, number>;
    releaseThresholdBps: number;
    thresholdMinBps: number;
    thresholdMaxBps: number;
    inactivityCancelDays: number;
    refundFeeBps: number;
  };
  rnsl: { enabled: boolean; frequencies: Frequencies; minContributionBps: number; maxTopUp: number; interestBps: number; markupByTenure: Record<string, number>; contributionMode: "WALLET" | "DIRECT_TO_LANDLORD" };
  shared: {
    graceDays: number;
    lateFee: { enabled: boolean; type: "FLAT" | "PERCENT"; value: number };
    reminderOffsetsDays: number[];
    defaultAfterDaysOverdue: number;
    maxActivePlans: number;
    maxFinancedAmount: number;
    autoApproveVerifiedUsers: boolean;
    maxAutoDebitRetries: number;
  };
}

export interface Override {
  id: string;
  scope: "CATEGORY" | "PRODUCT";
  scope_key: string;
  product: FinanceProduct;
  config: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
}
