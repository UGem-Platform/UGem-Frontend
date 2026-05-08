import { api } from "../../lib/axios";
import { getCurrentUser } from "@/features/auth";
import type { ApiResponse, MerchantOrderSummary } from "@/shared/types";
import type { MerchantDetail } from "@/features/customer/types";
import type { CreateApplicationPayload, MerchantApplication } from "./types";

const APPLICATION_TYPE = "Merchant";

function unwrapApiResponse<T>(payload: T | ApiResponse<T>) {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return payload.data;
  }

  return payload as T;
}

function appendString(formData: FormData, key: string, value?: string | null) {
  formData.append(key, value?.trim() ?? "");
}

function appendNumber(formData: FormData, key: string, value: number) {
  formData.append(key, Number.isFinite(value) ? String(value) : "0");
}

function mapPayloadToFormData(payload: CreateApplicationPayload) {
  const formData = new FormData();

  appendString(formData, "Name", payload.name);
  appendString(formData, "Description", payload.description);
  appendString(formData, "Email", payload.email);
  appendString(formData, "Phone", payload.phone);
  appendString(formData, "LogoUrl", payload.logoUrl);
  appendString(formData, "OpeningHours", payload.openingHours);
  appendString(formData, "Address", payload.address);
  appendNumber(formData, "Latitude", payload.latitude);
  appendNumber(formData, "Longitude", payload.longitude);

  payload.menu.forEach((menuItem, index) => {
    const prefix = `Menu[${index}]`;
    appendString(formData, `${prefix}.Name`, menuItem.name);
    appendString(formData, `${prefix}.Description`, menuItem.description);
    appendNumber(formData, `${prefix}.Price`, menuItem.price);
    appendString(formData, `${prefix}.ImageUrl`, menuItem.imageUrl);
    appendString(formData, `${prefix}.Category`, menuItem.category);
  });

  return formData;
}

function mapPayloadToJsonRequest(payload: CreateApplicationPayload) {
  return {
    type: APPLICATION_TYPE,
    name: payload.name,
    description: payload.description,
    email: payload.email,
    phone: payload.phone,
    logoUrl: payload.logoUrl || "",
    openingHours: payload.openingHours,
    address: payload.address,
    latitude: payload.latitude,
    longitude: payload.longitude,
    menu: payload.menu.map((m) => ({
      name: m.name,
      description: m.description,
      price: m.price,
      imageUrl: m.imageUrl || "",
      category: m.category || "",
    })),
  };
}

export async function createApplication(payload: CreateApplicationPayload) {
  const requestBody = mapPayloadToFormData(payload);
  const res = await api.post<ApiResponse<null>>("/applications", requestBody);
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
  const requestBody = mapPayloadToJsonRequest(payload);
  const res = await api.put<ApiResponse<null>>(
    `/applications/${applicationId}`,
    requestBody,
  );

  return res.data;
}

export async function getMyApplications() {
  const res =
    await api.get<ApiResponse<MerchantApplication[]>>("/applications/mine");
  return res.data.data ?? [];
}

export function getCurrentMerchantId() {
  return getCurrentUser()?.MerchantId ?? null;
}

export async function getMyMerchantDetail() {
  const merchantId = getCurrentMerchantId();

  if (!merchantId) {
    return null;
  }

  const res = await api.get<ApiResponse<MerchantDetail> | MerchantDetail>(
    `/merchants/${merchantId}`,
  );

  const merchant = unwrapApiResponse(res.data);

  return {
    ...merchant,
    foods: merchant.foods ?? merchant.menu ?? [],
    menu: merchant.menu ?? merchant.foods ?? [],
  };
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

export async function getMerchantCheckInQr(orderId: string) {
  const res = await api.get<Blob>(`/merchants/generate-qr/${orderId}`, {
    responseType: "blob",
  });

  return URL.createObjectURL(res.data);
}

export type UpdateMerchantPayload = {
  merchantName?: string;
  merchantDescription?: string;
  restaurantType?: string;
  mainDishType?: string;
  priceRange?: string;
  email?: string;
  phone?: string;
  address?: string;
  openingHours?: string;
};

export async function updateMerchant(payload: UpdateMerchantPayload) {
  const res = await api.put<ApiResponse<string | null>>("/merchants", payload);
  return res.data;
}
