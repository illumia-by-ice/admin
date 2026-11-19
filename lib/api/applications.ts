import { http } from "./http";

export type ApplicationStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED" | "STARTED";
export const APPLICATION_STATUSES: ApplicationStatus[] = ["PENDING_REVIEW", "APPROVED", "STARTED", "REJECTED", "CANCELLED"];

export interface ApplicationRow {
  id: string;
  user_id: string | null;
  type: "property" | "marketplace";
  status: ApplicationStatus;
  finance_product: "BNPL" | "SNBL" | null;
  frequency: "WEEKLY" | "MONTHLY" | null;
  tenure: number | null;
  quantity: number | null;
  full_name: string;
  phone: string;
  email: string;
  marketplace_id: string | null;
  property_id: string | null;
  assigned_to: string | null;
  approved_until: string | null;
  plan_id: string | null;
  created_at: string;
  marketplace: { title: string; price: number } | null;
  property: { title: string; price: number } | null;
}

export interface ApplicationDetail extends ApplicationRow {
  date_of_birth: string | null;
  residential_address: string | null;
  state: string | null;
  bvn: string | null;
  nin: string | null;
  id_type: string | null;
  employment_verification_required: boolean | null;
  employment_status: string | null;
  employer_name: string | null;
  job_title: string | null;
  monthly_income: string | null;
  employment_length: string | null;
  is_external_property: boolean | null;
  external_property_location: string | null;
  guarantor_name: string | null;
  guarantor_phone: string | null;
  guarantor_relationship: string | null;
  guarantor_employer: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  decision_reason: string | null;
  files: { id: string; src: string; name: string | null }[];
  user: { id: string; email: string; first_name: string | null; last_name: string | null; phone: string | null; verified: boolean | null; verification_status: string | null } | null;
  plan: { id: string; status: string; total_kobo: number; amount_paid_kobo: number; released_at: string | null } | null;
  quote: { totalKobo: number; downPaymentKobo: number; perInstallmentKobo: number; installments: number; releaseThresholdBps: number | null; markupBps: number } | { error: string } | null;
}

export const applicationsApi = {
  list: (q: { status?: ApplicationStatus; type?: string; financeProduct?: string; assignedTo?: string; page?: number; limit?: number }) => http.get<ApplicationRow[]>("/admin/applications", q),
  get: (id: string) => http.get<ApplicationDetail>(`/admin/applications/${id}`),
  approve: (id: string, reason?: string) => http.post<ApplicationDetail>(`/admin/applications/${id}/approve`, { reason }),
  reject: (id: string, reason: string) => http.post<ApplicationDetail>(`/admin/applications/${id}/reject`, { reason }),
  assign: (id: string, adminId: string | null) => http.post<ApplicationDetail>(`/admin/applications/${id}/assign`, { adminId }),
};
