import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type StaffMerchant = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  logoUrl?: string;
  email?: string;
  rating?: number;
  underratedScore?: number;
  platformFeePercent?: number;
  openingHours?: string;
  reviewCount?: number;
};

export type PageResult<T> = {
  items: T[];
  totalItems: number;
  pageSize: number;
  pageIndex: number;
};

export type StaffMerchantListResponse =
  | PageResult<StaffMerchant>
  | StaffMerchant[];

function unwrapApiData<T>(payload: ApiResponse<T> | T | null | undefined) {
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

function unwrapMerchantList(
  payload: ApiResponse<StaffMerchantListResponse> | StaffMerchantListResponse,
) {
  const data = unwrapApiData(payload);

  if (Array.isArray(data)) {
    return {
      items: data,
      totalItems: data.length,
      pageSize: data.length,
      pageIndex: 1,
    } satisfies PageResult<StaffMerchant>;
  }

  return data;
}

export async function getStaffMerchantList(params?: {
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  const res = await api.get<ApiResponse<StaffMerchantListResponse>>(
    "/merchants/staff",
    {
      params: {
        searchTerm: params?.searchTerm || undefined,
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    },
  );

  return unwrapMerchantList(res.data);
}
