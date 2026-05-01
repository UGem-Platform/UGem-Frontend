import { api } from "@/lib/axios";
import type { Merchant, MerchantDetail } from "../types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type PageResult<T> = {
  items: T[];
  totalItems: number;
  pageSize: number;
  pageIndex: number;
};

type MerchantListResponse = Merchant[] | PageResult<Merchant>;

function unwrapMerchantList(payload: MerchantListResponse) {
  return Array.isArray(payload) ? payload : (payload.items ?? []);
}

export async function getNearbyMerchants(params: {
  latitude: number;
  longitude: number;
  keyword?: string;
}) {
  const res = await api.request<ApiResponse<MerchantListResponse>>({
    method: "get",
    url: "/Merchant/Merchants",
    params: {
      Latitude: params.latitude,
      Longitude: params.longitude,
      SearchTerm: params.keyword,
      PageIndex: 1,
      PageSize: 20,
    },
  });

  return unwrapMerchantList(res.data.data);
}

export async function getMerchantDetail(id: string) {
  const res = await api.get<ApiResponse<MerchantDetail>>(
    `/Merchant/Merchants/${id}`,
  );

  const merchant = res.data.data;

  return {
    ...merchant,
    foods: merchant.foods ?? merchant.menu ?? [],
    menu: merchant.menu ?? merchant.foods ?? [],
  };
}

/**
 * Map search endpoint per Swagger: GET /api/Merchant/Map/Merchants
 * The Swagger describes a request body for map queries; some servers accept
 * GET with body, so we send a request using axios.request to include `data`.
 */
export async function getMapMerchants(payload: unknown) {
  const res = await api.request<ApiResponse<MerchantListResponse>>({
    method: "get",
    url: "/Merchant/Map/Merchants",
    params: payload,
  });

  return unwrapMerchantList(res.data.data);
}

/**
 * Try GET /api/Merchant/Category/Merchants - category search
 */
export async function getMerchantsByCategory(payload: unknown) {
  const res = await api.request<ApiResponse<MerchantListResponse>>({
    method: "get",
    url: "/Merchant/Category/Merchants",
    params: payload,
  });

  return unwrapMerchantList(res.data.data);
}

/**
 * Optional: GET /api/Merchant/me if backend provides it (Swagger did not include
 * this but FE referenced it in comments). Try to call it if present.
 */
export async function getMerchantMe() {
  const res = await api.get<ApiResponse<MerchantDetail>>(`/Merchant/me`);
  return res.data.data;
}
