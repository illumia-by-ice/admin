import { http } from "./http";

export interface WalletUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
  verified?: boolean | null;
  verification_status?: string | null;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  ledger_balance: number;
  available_balance: number;
  status: "ACTIVE" | "FROZEN" | "CLOSED";
  status_reason: string | null;
  created_at: string;
  updated_at: string;
  user: WalletUser | null;
}

export interface WalletDetail extends Wallet {
  holds: { id: string; amount: number; purpose: string; reference: string; created_at: string }[];
  cards: { id: string; last4: string; brand: string | null; bank: string | null; exp_month: string | null; exp_year: string | null; is_default: boolean; auto_debit_enabled: boolean }[];
  dedicatedAccount: { account_number: string; account_name: string; bank_name: string; status?: string } | null;
  bankAccounts: { id: string; bank_name: string; account_number: string; account_name: string }[];
}

export interface WalletTransaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  category: string;
  amount: number;
  balance_before: number | null;
  balance_after: number | null;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REVERSED";
  reference: string;
  external_reference: string | null;
  narration: string;
  metadata: Record<string, unknown> | null;
  reversal_of: string | null;
  created_at: string;
}

export interface Adjustment {
  id: string;
  wallet_id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  reason: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  requested_by: string;
  decided_by: string | null;
  decision_note: string | null;
  created_at: string;
}

export interface Reconciliation {
  checkedAt: string;
  walletsChecked: number;
  totalLiabilityKobo: number;
  totalHeldKobo: number;
  mismatches: { walletId: string; userId: string; ledgerBalanceKobo: number; computedFromEntriesKobo: number; availableBalanceKobo: number; activeHoldsKobo: number }[];
}

export interface PaystackEvent {
  id: string;
  event: string;
  reference: string | null;
  status: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
  processed_at: string | null;
  payload: Record<string, unknown>;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  fee: number;
  status: "PENDING_APPROVAL" | "PROCESSING" | "MANUAL_PAYOUT" | "SUCCESS" | "FAILED" | "REJECTED" | "REVERSED";
  transfer_code: string | null;
  failure_reason: string | null;
  decision_reason: string | null;
  manual_reference: string | null;
  created_at: string;
  completed_at: string | null;
  user: WalletUser | null;
  bankAccount: { bank_name: string; account_number: string; account_name: string } | null;
}

export type WalletSettings = Record<string, number | boolean | string>;

export const walletsApi = {
  list: (q: { search?: string; status?: string; page?: number; limit?: number }) => http.get<Wallet[]>("/admin/wallets", q),
  get: (id: string) => http.get<WalletDetail>(`/admin/wallets/${id}`),
  transactions: (id: string, q: { cursor?: string; status?: string; limit?: number }) => http.get<WalletTransaction[]>(`/admin/wallets/${id}/transactions`, q),
  freeze: (id: string, reason: string) => http.post(`/admin/wallets/${id}/freeze`, { reason }),
  unfreeze: (id: string, reason: string) => http.post(`/admin/wallets/${id}/unfreeze`, { reason }),
  adjust: (id: string, body: { type: "CREDIT" | "DEBIT"; amount: number; reason: string }) => http.post(`/admin/wallets/${id}/adjustments`, body),
  adjustments: (status?: string) => http.get<Adjustment[]>("/admin/wallet-adjustments", { status }),
  approveAdjustment: (id: string, note?: string) => http.post(`/admin/wallet-adjustments/${id}/approve`, { note }),
  rejectAdjustment: (id: string, note: string) => http.post(`/admin/wallet-adjustments/${id}/reject`, { note }),
  reverse: (txId: string, reason: string) => http.post(`/admin/wallet-transactions/${txId}/reverse`, { reason }),
  reverify: (reference: string) => http.post(`/admin/wallet-transactions/${encodeURIComponent(reference)}/reverify`),
  reconciliation: () => http.get<Reconciliation>("/admin/wallets/reconciliation"),
  paystackEvents: (q: { event?: string; status?: string; reference?: string; page?: number; limit?: number }) => http.get<PaystackEvent[]>("/admin/paystack-events", q),
  withdrawals: (q: { status?: string; page?: number; limit?: number }) => http.get<Withdrawal[]>("/admin/withdrawals", q),
  approveWithdrawal: (id: string, reason?: string) => http.post(`/admin/withdrawals/${id}/approve`, { reason }),
  rejectWithdrawal: (id: string, reason: string) => http.post(`/admin/withdrawals/${id}/reject`, { reason }),
  markWithdrawalPaid: (id: string, reference: string, reason?: string) => http.post(`/admin/withdrawals/${id}/mark-paid`, { reference, reason }),
  settings: () => http.get<WalletSettings>("/admin/wallet/settings"),
  updateSettings: (patch: WalletSettings, reason?: string) => http.put<WalletSettings>("/admin/wallet/settings", { ...patch, ...(reason ? { reason } : {}) }),
};
