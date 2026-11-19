"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "./api/http";

export type Permission =
  | "users:read"
  | "users:write"
  | "content:write"
  | "finance:read"
  | "finance:write"
  | "wallet:read"
  | "wallet:write"
  | "orders:read"
  | "orders:write"
  | "applications:read"
  | "applications:write"
  | "followups:write"
  | "plans:notes"
  | "settings:write"
  | "audit:read";

export const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Super admin", FINANCE: "Finance", SUPPORT: "Support", SALES: "Sales", CUSTOMER_SERVICE: "Customer service" };

export interface AdminProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "SUPER_ADMIN" | "FINANCE" | "SUPPORT" | "SALES" | "CUSTOMER_SERVICE";
  permissions: Permission[];
}

/** The signed-in admin. `can()` hides actions their role can't take (the API enforces it regardless). */
export function useAdmin() {
  const q = useQuery({ queryKey: ["admin-me"], queryFn: async () => (await http.get<AdminProfile>("/admin/me")).data, staleTime: 5 * 60_000 });
  return { admin: q.data, isLoading: q.isLoading, can: (p: Permission) => Boolean(q.data?.permissions.includes(p)) };
}
