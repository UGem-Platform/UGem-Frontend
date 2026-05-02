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

function unwrapApiData<T>(payload: T | ApiResponse<T>): T {
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

function unwrapMerchantList(payload: MerchantListApiPayload) {
  const data = unwrapApiData(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === "object" && data !== null && "items" in data) {
    return data.items ?? [];
  }

  return [];
}

export async function getNearbyMerchants(params: {
  latitude: number;
  longitude: number;
  keyword?: string;
}) {
  const res = await api.request<MerchantListApiPayload>({
    method: "get",
    url: "/merchants",
    params: {
      searchTerm: params.keyword,
      pageIndex: 1,
      pageSize: 20,
    },
  });

  return unwrapMerchantList(res.data);
}

export async function getMerchantDetail(id: string) {
  const res = await api.get<ApiResponse<MerchantDetail> | MerchantDetail>(
    `/merchants/${id}`,
  );

  const merchant = unwrapApiData(res.data);

  return {
    ...merchant,
    foods: merchant.foods ?? merchant.menu ?? [],
    menu: merchant.menu ?? merchant.foods ?? [],
  };
}

/**
 * Use the merchant map endpoint from the backend contract.
 */
export async function getMapMerchants(payload: unknown) {
  const res = await api.request<MerchantListApiPayload>({
    method: "get",
    url: "/merchants/map",
    params: payload,
  });

  return unwrapMerchantList(res.data);
}

export async function getMerchantsByCategory(payload: unknown) {
  const res = await api.request<MerchantListApiPayload>({
    method: "get",
    url: "/merchants/by-category",
    params: payload,
  });

  return unwrapMerchantList(res.data);
}

export async function getMerchantMe() {
  throw new Error(
    "Backend contract hiện tại chưa public endpoint lấy merchant hiện tại.",
  );
}
