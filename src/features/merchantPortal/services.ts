import { api } from "../../lib/axios";
import { getCurrentUser } from "@/features/auth";
import type { ApiResponse, MerchantOrderSummary } from "@/shared/types";
import type { MerchantDetail } from "@/features/customer/types";
import type { CreateApplicationPayload, MerchantApplication } from "./types";
import {
  acceptMerchantOrder,
  rejectMerchantOrder,
} from "@/shared/services/merchantOrderService";
import { generateCheckInQr } from "@/shared/services/checkInService";

const APPLICATION_TYPE = "Merchant";

function getOpeningHours(record: Record<string, unknown>) {
  const candidates = [
    record.openingHours,
    record.OpeningHours,
    record.openHours,
    record.OpenHours,
    record.openHour,
    record.OpenHour,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return undefined;
}

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

function shouldFallback(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 404 || status === 405;
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
  appendString(formData, "RestaurantType", payload.restaurantType);
  appendString(formData, "MainDishType", payload.mainDishType);
  appendString(formData, "PriceRange", payload.priceRange);
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
    restaurantType: payload.restaurantType || "",
    mainDishType: payload.mainDishType || "",
    priceRange: payload.priceRange || "",
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
  const record = merchant as Record<string, unknown>;

  return {
    ...merchant,
    openingHours: getOpeningHours(record),
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

export async function getMerchantOrderDetail(orderId: string) {
  const res = await api.get<ApiResponse<unknown> | unknown>(
    `/orders/${orderId}/merchant`,
  );

  const payload = (res.data ?? res) as unknown;
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: unknown }).data;
  }

  return payload;
}

export async function acceptOrder(orderId: string) {
  try {
    return await acceptMerchantOrder(orderId);
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
  }

  const res = await api.patch(`/orders/${orderId}/status`, {
    status: "Accepted",
  });
  return res.data;
}

export async function rejectOrder(orderId: string, reason: string) {
  try {
    return await rejectMerchantOrder({ orderId, reason });
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
  }

  const res = await api.patch(`/orders/${orderId}/status`, {
    status: "Rejected",
    reason,
  });
  return res.data;
}

export async function confirmCashPayment(orderId: string) {
  const res = await api.patch(`/orders/${orderId}/cash/confirm`);
  return res.data;
}

export async function getMerchantCheckInQr(
  orderId: string,
  _billAlreadyConfirmed = false,
) {
  const blob = await generateCheckInQr({ orderId });
  return URL.createObjectURL(blob);
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

export async function updateBill(
  orderId: string,
  payload: {
    discount?: number;
    items?: { foodId: string; quantity?: number; unitPrice?: number }[];
  },
) {
  const body = { orderId, ...(payload ?? {}) };
  const res = await api.patch<ApiResponse<unknown> | unknown>(
    "/orders/bill",
    body,
  );
  return res.data;
}
