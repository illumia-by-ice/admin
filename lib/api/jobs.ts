import { http } from "./http";

export interface JobStatus {
  name: string;
  running: boolean;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastResult: Record<string, unknown> | null;
  lastError: string | null;
}

export const RUNNABLE_JOBS = [
  { name: "finance-daily", label: "Daily collections", description: "Auto-debit due installments, mark overdue (late fees), mark defaults. Runs 07:00 and 15:00." },
  { name: "finance-reminders", label: "Payment reminders", description: "Upcoming-payment reminders and savings inactivity warnings. Runs 09:00." },
  { name: "snbl-inactivity", label: "Idle savings plans", description: "Cancel and refund savings plans with no recent payment. Runs 03:00." },
] as const;

export const jobsApi = {
  status: () => http.get<JobStatus[]>("/admin/jobs"),
  run: (name: string) => http.post<Record<string, unknown>>(`/admin/jobs/${name}/run`),
};
