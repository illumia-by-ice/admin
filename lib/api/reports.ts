import { http } from "./http";

export type GroupBy = "day" | "week" | "month";

export interface Overview {
  range: { from: string; to: string; groupBy: GroupBy; buckets: string[] };
  kpis: {
    collectedKobo: number;
    lateFeesCollectedKobo: number;
    plansStarted: number;
    financedKobo: number;
    markupBookedKobo: number;
    gmvKobo: number;
    moneyInKobo: number;
    moneyOutKobo: number;
    openPlans: number;
    outstandingKobo: number;
    overdueKobo: number;
    overduePlans: number;
    defaultedPlans: number;
    defaultRate: number;
    walletLiabilityKobo: number;
  };
  series: {
    collections: { bucket: string; WALLET: number; AUTO_DEBIT: number; ADMIN_MANUAL: number }[];
    plansStarted: { bucket: string; BNPL: number; SNBL: number; RNSL: number }[];
    financed: { bucket: string; BNPL: number; SNBL: number; RNSL: number }[];
    walletFlows: { bucket: string; moneyIn: number; moneyOut: number }[];
    gmv: { bucket: string; WALLET: number; BNPL: number; SNBL: number }[];
  };
  overdueAging: { label: string; items: number; kobo: number }[];
}

export const reportsApi = {
  overview: (q: { from?: string; to?: string; groupBy?: GroupBy }) => http.get<Overview>("/admin/reports/overview", q),
};
