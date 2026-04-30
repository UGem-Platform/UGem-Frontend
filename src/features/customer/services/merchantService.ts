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
}

export async function getMerchantDetail(id: string) {
  const res = await api.get<ApiResponse<MerchantDetail>>(
    `/Merchant/Merchants/${id}`,
  );

  return res.data.data;
}
