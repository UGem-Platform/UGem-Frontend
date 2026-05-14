import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types";

export type CreateMerchantOrderItem = {
  foodId: string;
  quantity: number;
  notes?: string | null;
};

export type CreateMerchantOrderRequest = {
  name: string;
  deliveryAddress?: string;
  notes?: string;
  paymentMethod?: string;
  foods: CreateMerchantOrderItem[];
};

export async function createMerchantOrder(payload: CreateMerchantOrderRequest) {
  const res = await api.post<ApiResponse<null>>("/orders/merchant", payload);
  return res.data;
}

export async function acceptMerchantOrder(orderId: string) {
  const res = await api.post<ApiResponse<null>>(`/orders/${orderId}/accept`);
  return res.data;
}

export async function rejectMerchantOrder(payload: {
  orderId: string;
  reason: string;
}) {
  const res = await api.post<ApiResponse<null>>("/orders/reject", payload);
  return res.data;
}
