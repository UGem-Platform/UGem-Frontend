import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

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
    discount: 0,
    finalPrice: payload.finalPrice,
    reviewerFee: 0,
    platformFee: 0,
    status: "Pending",
    paymentMethod: "COD",
    orderedAt: new Date().toISOString(),
    notes: payload.notes || "",
    deliveryAddress: payload.deliveryAddress,
    foods: payload.foods,
  });

  return res.data;
}

export async function getCustomerOrders() {
  const res = await api.get<ApiResponse<[]>>("/Order/list");
  return res.data.data;
}

export async function getCustomerOrderDetail(orderId: string) {
  const res = await api.get<ApiResponse<[]>>("/Order/detail", {
    params: { orderId },
  });

  return res.data.data;
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
