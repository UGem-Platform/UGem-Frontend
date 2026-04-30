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

export async function getNearbyMerchants(params: {
  latitude: number;
  longitude: number;
  keyword?: string;
}) {
  try {
    const res = await api.get<ApiResponse<PageResult<Merchant>>>(
      "/Merchant/Merchants",
      {
        params: {
          Latitude: params.latitude,
          Longitude: params.longitude,
          SearchTerm: params.keyword,
          PageIndex: 1,
          PageSize: 20,
        },
      },
    );
    return res.data.data.items;
  } catch (error) {
    console.warn(
      "Lỗi gọi API getNearbyMerchants (Backend có thể đang tắt). Sử dụng dữ liệu giả lập (mock data) để test Map.",
    );

    // Dữ liệu giả lập xung quanh vị trí user
    return [
      {
        id: "mock-1",
        merchantName: "Quán Bún Bò Huế Ảo",
        name: "Quán Bún Bò Huế Ảo",
        address: "123 Đường Demo, Phường 1",
        latitude: params.latitude + 0.005,
        longitude: params.longitude + 0.005,
        distance: 0.8,
        rating: 4.8,
        status: "Open",
      },
      {
        id: "mock-2",
        merchantName: "Cơm Tấm Sườn Bì Giả Lập",
        name: "Cơm Tấm Sườn Bì Giả Lập",
        address: "456 Phố Test, Phường 2",
        latitude: params.latitude - 0.003,
        longitude: params.longitude + 0.008,
        distance: 1.2,
        rating: 4.2,
        status: "Open",
      },
      {
        id: "mock-3",
        merchantName: "Trà Sữa Khủng Long",
        name: "Trà Sữa Khủng Long",
        address: "789 Đại lộ Mock, Phường 3",
        latitude: params.latitude + 0.007,
        longitude: params.longitude - 0.004,
        distance: 1.5,
        rating: 4.5,
        status: "Open",
      },
    ] as unknown as Merchant[];
  }
}

export async function getMerchantDetail(id: string) {
  const res = await api.get<ApiResponse<MerchantDetail>>(
    `/Merchant/Merchants/${id}`,
  );

  return res.data.data;
}

/**
 * Map search endpoint per Swagger: GET /api/Merchant/Map/Merchants
 * The Swagger describes a request body for map queries; some servers accept
 * GET with body, so we send a request using axios.request to include `data`.
 */
export async function getMapMerchants(payload: unknown) {
  const res = await api.request<ApiResponse<Merchant[]>>({
    method: "get",
    url: "/Merchant/Map/Merchants",
    // include body as data (backend may expect a MapRequest JSON)
    data: payload,
  });

  return res.data.data ?? [];
}

/**
 * Try GET /api/Merchant/Category/Merchants - category search
 */
export async function getMerchantsByCategory(payload: unknown) {
  const res = await api.request<ApiResponse<Merchant[]>>({
    method: "get",
    url: "/Merchant/Category/Merchants",
    data: payload,
  });

  return res.data.data ?? [];
}

/**
 * Optional: GET /api/Merchant/me if backend provides it (Swagger did not include
 * this but FE referenced it in comments). Try to call it if present.
 */
export async function getMerchantMe() {
  const res = await api.get<ApiResponse<MerchantDetail>>(`/Merchant/me`);
  return res.data.data;
}
