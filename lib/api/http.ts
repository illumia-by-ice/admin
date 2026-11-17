import type { AxiosError } from "axios";
import api from "../axios-client";

/** The API's error envelope, as a thrown error: `message` is safe to show to an admin. */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: Record<string, unknown> | null
  ) {
    super(message);
  }
}

export interface Envelope<T> {
  data: T;
  meta: Record<string, any> | null;
  message: string;
}

type Params = Record<string, string | number | boolean | undefined | null>;

const clean = (p?: Params) => (p ? Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== "")) : undefined);

/** Calls the API asking for the standard envelope (`X-Response-Format: v2`). */
export async function request<T>(method: "get" | "post" | "put" | "patch" | "delete", url: string, opts: { body?: unknown; params?: Params; reason?: string } = {}): Promise<Envelope<T>> {
  try {
    const res = await api.request({
      method,
      url,
      data: opts.body,
      params: clean(opts.params),
      headers: { "X-Response-Format": "v2", ...(opts.reason ? { "X-Admin-Reason": opts.reason } : {}) },
    });
    return { data: res.data?.data as T, meta: res.data?.meta ?? null, message: res.data?.message ?? "" };
  } catch (e) {
    const err = e as AxiosError<{ message?: string; error?: { code?: string; details?: Record<string, unknown> } }>;
    if (err.response) {
      const body = err.response.data;
      throw new ApiError(body?.message || `Request failed (${err.response.status})`, body?.error?.code || "ERROR", err.response.status, body?.error?.details);
    }
    throw new ApiError("Couldn't reach the server. Check your connection.", "NETWORK_ERROR", 0);
  }
}

export const http = {
  get: <T>(url: string, params?: Params) => request<T>("get", url, { params }),
  post: <T>(url: string, body?: unknown, reason?: string) => request<T>("post", url, { body: body ?? {}, reason }),
  put: <T>(url: string, body?: unknown, reason?: string) => request<T>("put", url, { body, reason }),
  patch: <T>(url: string, body?: unknown, reason?: string) => request<T>("patch", url, { body, reason }),
  del: <T>(url: string, reason?: string) => request<T>("delete", url, { reason }),
};

export const errorMessage = (e: unknown) => (e instanceof ApiError || e instanceof Error ? e.message : "Something went wrong");
