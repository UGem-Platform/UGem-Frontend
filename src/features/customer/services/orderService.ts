import { api } from "@/lib/axios";
import type {
  ApiResponse,
  CustomerOrderDetailItem,
  CustomerOrderSummary,
} from "@/shared/types";

export type CreateOrderItem = {
  foodId: string;
  quantity: number;
};

export async function createOrder(payload: {
  name: string;
  deliveryAddress: string;
  notes?: string;
  finalPrice: number;
  foods: CreateOrderItem[];
}) {
  const res = await api.post<ApiResponse<null>>("/Order/customer/orders", {
    name: payload.name,
    deliveryAddress: payload.deliveryAddress,
    notes: payload.notes || "",
    finalPrice: payload.finalPrice,
    foods: payload.foods,
  });

  return res.data;
}

export async function getCustomerOrders() {
  const res = await api.get<ApiResponse<CustomerOrderSummary[]>>("/Order/list");
  return res.data.data ?? [];
}

export async function getCustomerOrderDetail(orderId: string) {
  const res = await api.get<ApiResponse<CustomerOrderDetailItem[]>>(
    "/Order/detail",
    {
      params: { orderId },
    },
  );

  return res.data.data ?? [];
}

export async function confirmReceived(orderId: string) {
  const res = await api.put<ApiResponse<null>>("/Customer/confirm-received", {
    orderId,
  });

  return res.data;
}

export async function confirmNotReceived(orderId: string) {
  const res = await api.put<ApiResponse<null>>(
    "/Customer/confirm-not-received",
    {
      orderId,
    },
  );

  return res.data;
}
