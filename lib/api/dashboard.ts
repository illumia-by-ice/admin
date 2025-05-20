import { AxiosError, AxiosResponse } from "axios";
import api from "../axios-client";

// Dashboard data response interface
export interface DashboardResponse {
  counts: {
    users: number;
    properties: number;
    products: number;
    verifications: number;
    pendingVerifications: number;
    reviews: number;
    files: number;
    transactions: number;
    advertisements: number;
  };
  recentUsers: User[];
  recentVerifications: Verification[];
  recentTransactions: Transaction[];
  recentAds: Advertisement[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  avatarUrl?: string;
}

export interface Verification {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  user: {
    name: string;
    email: string;
  };
  documentType: string;
  created_at: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  type: string;
  userId: string;
 
  created_at: string;
}

export interface Advertisement {
  id: string;
  title: string;
  status: 'active' | 'inactive' | 'scheduled';
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
  created_at: string;
}

/**
 * Fetch dashboard data
 * @returns DashboardResponse with counts and recent data
 */
export const fetchDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const response: AxiosResponse<DashboardResponse> = await api.get("/admin/dashboard");
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const { status, data } = axiosError.response as any;
      
      if (status === 401 || status === 403) {
        throw new Error("You are not authorized to access this data");
      } else {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }
    }
    
    throw new Error("Failed to fetch dashboard data. Please check your connection and try again.");
  }
};
