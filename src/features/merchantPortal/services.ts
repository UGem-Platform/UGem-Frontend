import { api } from "../../lib/axios";
import type { ApiResponse, MerchantOrderSummary } from "@/shared/types";
import type { CreateApplicationPayload } from "./types";

export async function createApplication(payload: CreateApplicationPayload) {
  await api.post("/application", payload);
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
  const res = await api.put("/application/resubmit", {
    applicationId,
    type: "Merchant",
    note: "Gửi lại hồ sơ quán",
    ...payload,
  });

  return res.data;
}

export async function getMyApplications() {
  // Current backend contract does not provide a merchant-facing GET application list endpoint.
  // Once the backend adds a supported route, replace this implementation with a real fetch.
  console.warn(
    "Merchant application listing is not available in the current backend contract.",
  );
  return [];
}

export async function getMerchantOrders() {
  const res = await api.get<
    ApiResponse<MerchantOrderSummary[]> | MerchantOrderSummary[]
  >("/order");
  return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
}

export async function acceptOrder(_orderId: string) {
  throw new Error(
    "Backend hiện chưa public endpoint chấp nhận đơn hàng trong contract mới.",
  );
}

export async function rejectOrder(_orderId: string, _reason: string) {
  throw new Error(
    "Backend hiện chưa public endpoint từ chối đơn hàng trong contract mới.",
  );
}
