import { http } from "./http";

export type OrderStatus = "AWAITING_RELEASE" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export const ORDER_STATUSES: OrderStatus[] = ["AWAITING_RELEASE", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export interface OrderItem {
  id: string;
  product_id: string;
  title: string;
  image_src: string | null;
  unit_price_kobo: number;
  quantity: number;
  line_total_kobo: number;
}

export interface Delivery {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  note?: string;
}

export interface Order {
  id: string;
  user_id: string;
  seller_id: string;
  status: OrderStatus;
  payment_method: "WALLET" | "BNPL" | "SNBL";
  subtotal_kobo: number;
  commission_kobo: number;
  plan_id: string | null;
  payment_transaction_id: string | null;
  refund_transaction_id: string | null;
  payout_transaction_id: string | null;
  delivery: Delivery;
  tracking_info: string | null;
  cancel_reason: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  items: OrderItem[];
  events?: { id: string; event: string; from_status: string | null; to_status: string | null; actor_type: string; actor_id: string | null; reason: string | null; created_at: string }[];
}

export interface OrderSettings {
  autoConfirmDays: number;
  commissionBps: number;
  maxQuantityPerItem: number;
  maxCartItems: number;
  buyerCanCancelBeforeShipping: boolean;
}

export const ordersApi = {
  list: (q: { status?: OrderStatus; method?: string; userId?: string; sellerId?: string; page?: number; limit?: number }) => http.get<Order[]>("/admin/orders", q),
  get: (id: string) => http.get<Order>(`/admin/orders/${id}`),
  ship: (id: string, trackingInfo?: string) => http.post(`/admin/orders/${id}/ship`, { trackingInfo }),
  deliver: (id: string) => http.post(`/admin/orders/${id}/deliver`),
  cancel: (id: string, reason: string) => http.post(`/admin/orders/${id}/cancel`, { reason }),
  settings: () => http.get<OrderSettings>("/admin/orders/settings"),
  updateSettings: (patch: Partial<OrderSettings>, reason?: string) => http.put<OrderSettings>("/admin/orders/settings", patch, reason),
};
