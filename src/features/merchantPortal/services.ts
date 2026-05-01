import { api } from "../../lib/axios";
import type { ApiResponse, MerchantOrderSummary } from "@/shared/types";
import type { CreateApplicationPayload, MerchantApplication } from "./types";

export async function createApplication(payload: CreateApplicationPayload) {
  const { data } = await api.post<ApiResponse<null>>("/Application", payload);

  return data;
}

export async function resubmitApplication(
  applicationId: string,
  payload: CreateApplicationPayload,
) {
  const { data } = await api.put<ApiResponse<null>>("/Application/resubmit", {
    applicationId,
    type: "Merchant",
    note: "Gửi lại hồ sơ quán",
    ...payload,
  });

  return data;
}
export async function createMerchantApplication(
  payload: CreateApplicationPayload,
) {
  const { data } = await api.post<ApiResponse<null>>("/Application", payload);
  return data;
}

export async function getMyApplications() {
  const { data } = await api.get<ApiResponse<MerchantApplication[]>>(
    "/Application/user/applications",
  );

  return data.data ?? [];
}
export async function getMerchantOrders() {
  const res = await api.get<ApiResponse<MerchantOrderSummary[]>>("/Order");
  return res.data.data ?? [];
}

export async function acceptOrder(orderId: string) {
  const res = await api.post<ApiResponse<null>>("/Order/accept", null, {
    params: { orderId },
  });

  return res.data;
}

export async function rejectOrder(orderId: string, reason: string) {
  const res = await api.post<ApiResponse<null>>("/Order/reject", {
    orderId,
    reason,
  });

  return res.data;
}
