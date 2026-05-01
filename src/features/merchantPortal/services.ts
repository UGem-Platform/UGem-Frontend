import axios from "axios";
import { api } from "../../lib/axios";
import type { ApiResponse, MerchantOrderSummary } from "@/shared/types";
import type { CreateApplicationPayload, MerchantApplication } from "./types";

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
  const endpoints = [
    { url: "/application", params: { type: "Merchant" } },
    { url: "/application" },
    { url: "/application/merchant" },
    { url: "/merchant/applications" },
  ];

  for (const endpoint of endpoints) {
    try {
      const { data } = await api.get<
        ApiResponse<MerchantApplication[]> | MerchantApplication[]
      >(endpoint.url, {
        params: endpoint.params,
      });

      const responseData = data ?? [];
      return Array.isArray(responseData)
        ? responseData
        : (responseData.data ?? []);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  return [];
}

export async function getMerchantOrders() {
  const res = await api.get<
    ApiResponse<MerchantOrderSummary[]> | MerchantOrderSummary[]
  >("/order");
  return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
}

export async function acceptOrder(orderId: string) {
  void orderId;
  throw new Error(
    "Backend hiện chưa public endpoint chấp nhận đơn hàng trong contract mới.",
  );
}

export async function rejectOrder(orderId: string, reason: string) {
  void orderId;
  void reason;
  throw new Error(
    "Backend hiện chưa public endpoint từ chối đơn hàng trong contract mới.",
  );
}
