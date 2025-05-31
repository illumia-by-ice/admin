// filepath: c:\Users\timil\Documents\PROJECTS\aje-admin\lib\api\auth.ts
import { AxiosResponse } from "axios";
import api from "../axios-client";

// Auth response interface
export interface AuthResponse {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const loginAdmin = async (credentials: LoginCredentials) => {
  try {
    const response: AxiosResponse<AuthResponse> = await api.post(
      "/admin/login",
      credentials
    );

    if (response.data && response.data.token) {
      localStorage.setItem("@aje-auth_token", response.data.token);
    }

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        throw new Error("Invalid email or password");
      } else if (status === 403) {
        throw new Error("You don't have permission to access the admin area");
      } else {
        throw new Error(data.message || "Authentication failed");
      }
    }

    throw new Error(
      "Login failed. Please check your connection and try again."
    );
  }
};

export const logoutAdmin = (): void => {
  localStorage.removeItem("@aje-auth_token");
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("@aje-auth_token");
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("@aje-auth_token");
};
