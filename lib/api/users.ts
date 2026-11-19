import { AxiosError, AxiosResponse } from "axios";
import api from "../axios-client";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  verified: boolean;
  verification_status: string;
  auth_provider: string;
  user_type: string;
  last_login: string;
  created_at: string;
  bio?: string;
  services?: string;
  address?: string;
  city?: string;
  available?: boolean;
  subscription_id?: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserParams {
  page?: number;
  limit?: number;
  search?: string;
  user_type?: string;
  verification_status?: string;
}

/**
 * Fetch users with pagination and filtering
 */
export const fetchUsers = async (params: UserParams = {}): Promise<PaginatedUsersResponse> => {
  try {
    const response: AxiosResponse<PaginatedUsersResponse> = await api.get("/admin/users", {
      params,
    });
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const { status, data } = axiosError.response as any;
      
      if (status === 401) {
        throw new Error("You are not authorized to access user data");
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    }
    
    throw new Error("Failed to fetch users. Please check your connection and try again.");
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/admin/users/${userId}`);
  } catch (error: any) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const { status, data } = axiosError.response as any;
      
      if (status === 401) {
        throw new Error("You are not authorized to delete this user");
      } else if (status === 404) {
        throw new Error("User not found");
      } else {
        throw new Error(data.message || "Failed to delete user");
      }
    }
    
    throw new Error("Failed to delete user. Please check your connection and try again.");
  }
};

/**
 * Add a new user (this will be implemented once API endpoint is ready)
 */
export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_type: string;
  password?: string;
  bio?:string;
}

/**
 * Update a user (this will be implemented once API endpoint is ready)
 */
export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  user_type?: string;
//   verified?: boolean;
  /** Shown in the edit modal; the dedicated verification flow applies decisions. */
  verification_status?: string;
  password?: string;
  bio?: string;
  services?: string;
  address?: string;
  city?: string;
  available?: boolean;
  subscription_id?: string;
}

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const { status, data } = axiosError.response as any;
      
      if (status === 401) {
        throw new Error("You are not authorized to create users");
      } else if (status === 422) {
        throw new Error(data.message || "Invalid user data provided");
      } else {
        throw new Error(data.message || "Failed to create user");
      }
    }
    
    throw new Error("Failed to create user. Please check your connection and try again.");
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (userId: string, userData: UpdateUserData): Promise<User> => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const { status, data } = axiosError.response as any;
      
      if (status === 401) {
        throw new Error("You are not authorized to update this user");
      } else if (status === 404) {
        throw new Error("User not found");
      } else if (status === 422) {
        throw new Error(data.message || "Invalid user data provided");
      } else {
        throw new Error(data.message || "Failed to update user");
      }
    }
    
    throw new Error("Failed to update user. Please check your connection and try again.");
  }
};

export interface VerificationDoc {
  id: string;
  src: string;
  name: string;
}

export interface VerificationUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  verification_status: "pending" | "verified" | "rejected";
  verification: {
    note?: string;
    ninDocs: VerificationDoc[];
    cacDocs: VerificationDoc[];
  } | null;
}

export interface VerificationRequestsResponse {
  data: VerificationUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getVerificationRequests = async (params: { page?: number; limit?: number; user_type?: string; status?: string; search?: string } = {}): Promise<VerificationRequestsResponse> => {
  // The API's status/user_type enums reject empty strings, so drop unset
  // filters instead of sending status=&user_type= (which 422s the list).
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  const response = await api.get("/admin/users/verification/requests", { params: clean });
  return response.data;
};

export const updateUserVerification = async (userId: string, data: { status: "pending" | "verified" | "rejected"; adminNotes?: string }): Promise<VerificationUser> => {
  const response = await api.put(`/admin/users/${userId}/verification`, data);
  return response.data;
};
