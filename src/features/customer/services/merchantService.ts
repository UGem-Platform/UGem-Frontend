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
type MerchantListApiPayload =
  | MerchantListResponse
  | ApiResponse<MerchantListResponse>;

function unwrapApiData<T>(payload: T | ApiResponse<T>) {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return payload.data;
  }

  return payload;
}

function unwrapMerchantList(payload: MerchantListApiPayload) {
  const data = unwrapApiData(payload);
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getNearbyMerchants(params: {
  latitude: number;
  longitude: number;
  keyword?: string;
}) {
  const res = await api.request<MerchantListApiPayload>({
    method: "get",
    url: "/merchant",
    params: {
      latitude: params.latitude,
      longitude: params.longitude,
      keyword: params.keyword,
      searchTerm: params.keyword,
      pageIndex: 1,
      pageSize: 20,
    },
  });

  return unwrapMerchantList(res.data);
}

export async function getMerchantDetail(id: string) {
  const res = await api.get<ApiResponse<MerchantDetail> | MerchantDetail>(
    `/merchant/${id}`,
  );

  const merchant = unwrapApiData(res.data);

  return {
    ...merchant,
    foods: merchant.foods ?? merchant.menu ?? [],
    menu: merchant.menu ?? merchant.foods ?? [],
  };
}

/**
 * The current backend contract only exposes GET /api/merchant, so map search
 * reuses the same resource with query params.
 */
export async function getMapMerchants(payload: unknown) {
  const res = await api.request<MerchantListApiPayload>({
    method: "get",
    url: "/merchant",
    params: payload,
  });

  return unwrapMerchantList(res.data);
}

export async function getMerchantsByCategory(payload: unknown) {
  const res = await api.request<MerchantListApiPayload>({
    method: "get",
    url: "/merchant",
    params: payload,
  });

  return unwrapMerchantList(res.data);
}

export async function getMerchantMe() {
  throw new Error(
    "Backend contract hiện tại chưa public endpoint lấy merchant hiện tại.",
  );
}
