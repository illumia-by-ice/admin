import { http } from "./http";
import type { PlanDetail, PlanUser } from "./finance";

export type RentStatus = "PENDING_REVIEW" | "PAYOUT_PROCESSING" | "MANUAL_PAYOUT" | "PAYOUT_FAILED" | "PAID" | "REJECTED" | "CANCELLED";
export const RENT_STATUSES: RentStatus[] = ["PENDING_REVIEW", "PAYOUT_PROCESSING", "MANUAL_PAYOUT", "PAYOUT_FAILED", "PAID", "REJECTED", "CANCELLED"];

export interface RentApplication {
  id: string;
  user_id: string;
  plan_id: string;
  status: RentStatus;
  contribution_mode: "WALLET" | "DIRECT_TO_LANDLORD";
  rent_kobo: number;
  contribution_kobo: number;
  top_up_kobo: number;
  payout_kobo: number;
  hold_id: string | null;
  property_address: string;
  city: string;
  state: string;
  property_id: string | null;
  rent_start_date: string | null;
  landlord_name: string;
  landlord_phone: string;
  landlord_email: string | null;
  landlord_bank_name: string;
  landlord_bank_code: string;
  landlord_account_number: string;
  landlord_account_name: string;
  payout_reference: string | null;
  payout_attempts: number;
  transfer_code: string | null;
  manual_reference: string | null;
  payout_failure_reason: string | null;
  reviewed_by: string | null;
  decision_reason: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  user?: PlanUser | null;
}

export interface RentDocument {
  id: string;
  kind: "RENT_DOCUMENT" | "CONTRIBUTION_PROOF" | "LANDLORD_ID" | "OTHER";
  name: string | null;
  url: string | null;
  createdAt: string;
}

export interface RentApplicationDetail extends RentApplication {
  documents: RentDocument[];
  missingDocuments: RentDocument["kind"][];
  contributionHold: { status: string; amount: number } | null;
  plan: PlanDetail;
  user: PlanUser & { verification_status?: string | null };
}

export const rnslApi = {
  list: (q: { status?: RentStatus; userId?: string; page?: number; limit?: number }) => http.get<RentApplication[]>("/admin/rnsl/applications", q),
  get: (id: string) => http.get<RentApplicationDetail>(`/admin/rnsl/applications/${id}`),
  approve: (id: string, reason?: string) => http.post<RentApplicationDetail>(`/admin/rnsl/applications/${id}/approve`, { reason }),
  reject: (id: string, reason: string) => http.post(`/admin/rnsl/applications/${id}/reject`, { reason }),
  retryPayout: (id: string, reason?: string) => http.post<RentApplicationDetail>(`/admin/rnsl/applications/${id}/retry-payout`, { reason }),
  markPaid: (id: string, reference: string, reason?: string) => http.post<RentApplicationDetail>(`/admin/rnsl/applications/${id}/mark-paid`, { reference, reason }),
};
