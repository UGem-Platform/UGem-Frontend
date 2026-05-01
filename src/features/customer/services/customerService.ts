import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types";
import type { CustomerProfile } from "../types";

export async function getCustomerProfile() {
  const { data } =
    await api.get<ApiResponse<CustomerProfile | CustomerProfile[]>>(
      "/Customer/profile",
    );

  return Array.isArray(data.data) ? (data.data[0] ?? null) : data.data;
}

export async function confirmOrderReceived(_orderId: string) {
  throw new Error(
    "Backend hiện chưa public endpoint xác nhận nhận hàng trong contract mới.",
  );
}

export async function confirmOrderNotReceived(_orderId: string) {
  throw new Error(
    "Backend hiện chưa public endpoint báo chưa nhận hàng trong contract mới.",
  );
}
