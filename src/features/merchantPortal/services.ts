import { api } from "../../lib/axios";
import type { CreateApplicationPayload, MerchantApplication } from "./types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function createApplication(payload: CreateApplicationPayload) {
  await api.post("/Application", payload);
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
  const res = await api.put("/Application/resubmit", {
    applicationId,
    type: "Merchant",
    note: "Gửi lại hồ sơ quán",
    ...payload,
  });

  return res.data;
}

export async function getMyApplications() {
  const { data } = await api.get<ApiResponse<MerchantApplication[]>>(
    "/Application/user/applications",
  );

  return data.data ?? [];
}

export async function getMerchantOrders() {
  const res = await api.get("/Order");
  return res.data.data;
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
