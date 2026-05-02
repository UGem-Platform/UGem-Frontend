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
  const res = await api.post<ApiResponse<null>>("/orders", {
    name: payload.name,
    paymentMethod: "Cash",
    deliveryAddress: payload.deliveryAddress,
    notes: payload.notes || "",
    foods: payload.foods,
  });

  return res.data;
}

export async function getCustomerOrders() {
  const res = await api.get<
    ApiResponse<CustomerOrderSummary[]> | CustomerOrderSummary[]
  >("/orders/mine");
  return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
}

function unwrapApiResponse<T>(payload: T | ApiResponse<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return payload.data;
  }

  return payload as T;
}

export async function getCustomerOrderDetail(orderId: string) {
  const res = await api.get<
    | ApiResponse<
        | CustomerOrderDetailItem[]
        | {
            items?: CustomerOrderDetailItem[];
            foods?: CustomerOrderDetailItem[];
            orderItems?: CustomerOrderDetailItem[];
            details?: CustomerOrderDetailItem[];
          }
      >
    | CustomerOrderDetailItem[]
    | {
        items?: CustomerOrderDetailItem[];
        foods?: CustomerOrderDetailItem[];
        orderItems?: CustomerOrderDetailItem[];
        details?: CustomerOrderDetailItem[];
      }
  >(`/orders/${orderId}`);

  const payload = unwrapApiResponse(res.data) as
    | CustomerOrderDetailItem[]
    | {
        items?: CustomerOrderDetailItem[];
        foods?: CustomerOrderDetailItem[];
        orderItems?: CustomerOrderDetailItem[];
        details?: CustomerOrderDetailItem[];
      };

  if (Array.isArray(payload)) {
    return payload;
  }

  return (
    payload.items ??
    payload.foods ??
    payload.orderItems ??
    payload.details ??
    []
  );
}

export async function confirmReceived(orderId: string) {
  const res = await api.patch<ApiResponse<null>>(`/orders/${orderId}/status`, {
    status: "Completed",
  });

  return res.data;
}

export async function confirmNotReceived(orderId: string) {
  const res = await api.patch<ApiResponse<null>>(`/orders/${orderId}/status`, {
    status: "NotReceived",
  });

  return res.data;
}
