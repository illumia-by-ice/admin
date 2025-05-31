"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { DashboardResponse, fetchDashboardData } from "@/lib/api/dashboard";
import { isAuthenticated } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

interface DashboardContextProps {
  dashboardData: DashboardResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);
  
  const {
    data: dashboardData,
    isLoading,
    isError,
    error: queryError,
    refetch: reactQueryRefetch,
  }: UseQueryResult<DashboardResponse, Error> = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        throw new Error("Not authenticated");
      }
      return fetchDashboardData();
    },
    retry: 1,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Handle errors
  useEffect(() => {
    if (queryError) {
      setError(queryError);
      if (queryError.message.includes("not authorized") || queryError.message.includes("Not authenticated")) {
        router.push("/login");
      }
    }
  }, [queryError, router]);

  const refetch = async (): Promise<void> => {
    try {
      await reactQueryRefetch();
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        isLoading,
        isError,
        error,
        refetch,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
