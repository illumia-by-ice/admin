import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const TOKEN_KEY = "@aje-auth_token";
export const REFRESH_KEY = "@aje-refresh_token";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.illumiacityempire.com";

const storage = {
  get: (k: string) => (typeof window === "undefined" ? null : window.localStorage.getItem(k)),
  set: (k: string, v: string) => window.localStorage.setItem(k, v),
  remove: (k: string) => window.localStorage.removeItem(k),
};

export const saveSession = (s: { token: string; refreshToken?: string }) => {
  storage.set(TOKEN_KEY, s.token);
  if (s.refreshToken) storage.set(REFRESH_KEY, s.refreshToken);
};

export const clearSession = () => {
  storage.remove(TOKEN_KEY);
  storage.remove(REFRESH_KEY);
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = storage.get(TOKEN_KEY);
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

/**
 * Access tokens are short-lived. On a 401 the refresh token is exchanged once
 * (parallel requests wait for the same refresh) and the request is retried.
 * If that fails the session is over: back to the login page.
 */
let refreshing: Promise<string | null> | null = null;

const refreshSession = async (): Promise<string | null> => {
  const refreshToken = storage.get(REFRESH_KEY);
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken }, { headers: { "X-Client-Auth": "refresh" }, timeout: 15_000 });
    const body = res.data?.data ?? res.data;
    if (!body?.token) return null;
    saveSession({ token: body.token, refreshToken: body.refreshToken });
    return body.token as string;
  } catch {
    return null;
  }
};

const endSession = () => {
  clearSession();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login?expired=1";
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = original?.url ?? "";
    const isAuthCall = url.includes("/admin/login") || url.includes("/auth/refresh");
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      refreshing ??= refreshSession().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      if (token) {
        original.headers["Authorization"] = `Bearer ${token}`;
        return api(original);
      }
      endSession();
    }
    return Promise.reject(error);
  }
);

export default api;
