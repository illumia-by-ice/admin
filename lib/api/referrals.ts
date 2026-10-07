import api from "../axios-client";

export interface ReferralSettings {
  id: string;
  cashback_percent: number;
  enabled: boolean;
}

export interface AdminReferral {
  id: string;
  commission_amount: number;
  currency: string;
  created_at: string;
  referrer: { first_name: string; last_name: string; email: string };
  referee: { first_name: string; last_name: string; email: string };
}

export const getReferralAdminData = async () => {
  const response = await api.get<{ data: { settings: ReferralSettings; referrals: AdminReferral[] } }>("/admin/referrals");
  return response.data.data;
};

export const updateReferralSettings = async (data: { cashbackPercent: number; enabled: boolean }) => {
  const response = await api.put("/admin/referrals/settings", data);
  return response.data;
};
