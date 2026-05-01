import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types";
import type { CustomerProfile } from "../types";

export async function getCustomerProfile() {
  const { data } =
    await api.get<ApiResponse<CustomerProfile>>("/Customer/profile");
  return data.data;
}

export async function confirmOrderReceived(orderId: string) {
  const { data } = await api.put<ApiResponse<null>>(
    "/Customer/confirm-received",
    {
      orderId,
    },
  );

  return data;
}

export async function confirmOrderNotReceived(orderId: string) {
  const { data } = await api.put<ApiResponse<null>>(
    "/Customer/confirm-not-received",
    {
      orderId,
    },
  );

  return data;
}
