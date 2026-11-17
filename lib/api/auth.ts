import api, { REFRESH_KEY, TOKEN_KEY, clearSession, saveSession } from "../axios-client";

export interface LoginCredentials {
  email: string;
  password: string;
}

/** Signs in with a refresh-token session (the access token is short-lived and renewed automatically). */
export const loginAdmin = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post("/admin/login", credentials, { headers: { "X-Client-Auth": "refresh" } });
    const body = response.data?.data ?? response.data;
    if (body?.token) saveSession({ token: body.token, refreshToken: body.refreshToken });
    return body;
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) throw new Error("Invalid email or password");
      if (status === 403) throw new Error("You don't have permission to access the admin area");
      if (status === 429) throw new Error("Too many attempts. Wait a minute and try again.");
      throw new Error(data?.message || "Authentication failed");
    }
    throw new Error("Login failed. Please check your connection and try again.");
  }
};

/** Ends the session on the server too (revokes the refresh token), then locally. */
export const logoutAdmin = (): void => {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (refreshToken) api.post("/auth/logout", { refreshToken }).catch(() => undefined);
  clearSession();
};

export const isAuthenticated = (): boolean => !!localStorage.getItem(TOKEN_KEY);

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);
