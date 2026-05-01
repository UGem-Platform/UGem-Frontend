import { api } from "../../lib/axios";
import type { ApiResponse, MerchantOrderSummary } from "@/shared/types";
import type { CreateApplicationPayload, MerchantApplication } from "./types";

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
  try {
    const { data } = await api.get<ApiResponse<MerchantApplication[]>>(
      "/Application/merchant/applications",
    );
    return data.data ?? [];
  } catch (error: unknown) {
    // Fallback nếu endpoint chưa có trên backend
    if (error instanceof Error && error.message.includes("404")) {
      console.warn(
        "[MERCHANT] Endpoint /merchant/applications không tồn tại, fallback sang /user/applications",
      );
      const { data } = await api.get<ApiResponse<MerchantApplication[]>>(
        "/Application/user/applications",
      );
      return data.data ?? [];
    }
    throw error;
  }
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
