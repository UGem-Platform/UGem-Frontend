import axios from "axios";
import { api } from "../../lib/axios";
import type { ApiResponse, MerchantOrderSummary } from "@/shared/types";
import type { CreateApplicationPayload, MerchantApplication } from "./types";

const APPLICATION_POST_PATHS = ["/Application/merchant/applications/create"];

const APPLICATION_RESUBMIT_PATHS = ["/Application/resubmit"];

async function tryPostToApplicationEndpoint(payload: unknown) {
  for (const path of APPLICATION_POST_PATHS) {
    try {
      return await api.post(path, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    "Không tìm thấy endpoint gửi hồ sơ merchant trên backend. Vui lòng kiểm tra cấu hình backend hoặc liên hệ admin.",
  );
}

async function tryPutToResubmitEndpoint(payload: unknown) {
  for (const path of APPLICATION_RESUBMIT_PATHS) {
    try {
      return await api.put(path, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    "Không tìm thấy endpoint gửi lại hồ sơ merchant trên backend. Vui lòng kiểm tra cấu hình backend hoặc liên hệ admin.",
  );
}

export async function createApplication(payload: CreateApplicationPayload) {
  const requestBody = {
    type: "Merchant",
    ...payload,
  };
  await tryPostToApplicationEndpoint(requestBody);
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
  const res = await tryPutToResubmitEndpoint({
    applicationId,
    type: "Merchant",
    note: "Gửi lại hồ sơ quán",
    ...payload,
  });

  return res.data;
}

export async function getMyApplications() {
  const res = await api.get<ApiResponse<MerchantApplication[]>>(
    "/Application/merchant/applications",
  );
  return res.data.data ?? [];
}

export async function getMerchantOrders() {
  const res = await api.get<
    ApiResponse<MerchantOrderSummary[]> | MerchantOrderSummary[]
  >("/Order/list");
  return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
}

export async function acceptOrder(orderId: string) {
  const res = await api.post(`/Order/${orderId}/accept`);
  return res.data;
}

export async function rejectOrder(orderId: string, reason: string) {
  const res = await api.post(`/Order/${orderId}/reject`, {
    note: reason,
  });
  return res.data;
}
