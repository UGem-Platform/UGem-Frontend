import { api } from "../../lib/axios";
import type { ApiResponse, MerchantOrderSummary } from "@/shared/types";
import type { CreateApplicationPayload, MerchantApplication } from "./types";

export async function createApplication(payload: CreateApplicationPayload) {
  const res = await api.post<ApiResponse<null>>("/applications", payload);
  return res.data;
}

export async function createMerchantApplication(
  payload: CreateApplicationPayload,
) {
  return createApplication(payload);
}

export async function resubmitApplication(
  applicationId: string,
  payload: CreateApplicationPayload,
) {
  const res = await api.put<ApiResponse<null>>(
    `/applications/${applicationId}`,
    payload,
  );

  return res.data;
}

export async function getMyApplications() {
  const res =
    await api.get<ApiResponse<MerchantApplication[]>>("/applications/mine");
  return res.data.data ?? [];
}

export async function getMerchantOrders() {
  const res = await api.get<
    ApiResponse<MerchantOrderSummary[]> | MerchantOrderSummary[]
  >("/orders");
  return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
}

export async function acceptOrder(orderId: string) {
  const res = await api.patch(`/orders/${orderId}/status`, {
    status: "Accepted",
  });
  return res.data;
}

export async function rejectOrder(orderId: string, reason: string) {
  const res = await api.patch(`/orders/${orderId}/status`, {
    status: "Rejected",
    reason,
  });
  return res.data;
}
