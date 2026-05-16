import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function shouldFallback(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 404 || status === 405;
}

async function requestWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
) {
  try {
    return await primary();
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
  }

  return await fallback();
}

export type Admin = {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
};

function unwrapData<T>(payload: ApiResponse<T> | T | null | undefined) {
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

export async function getAdmins() {
  const { data } = await requestWithFallback(
    () => api.get<ApiResponse<Admin[]> | Admin[]>("/admin/staff"),
    () => api.get<ApiResponse<Admin[]> | Admin[]>("/admins/staff"),
  );
  return unwrapData(data) ?? [];
}

export async function getAdminById(id: string) {
  const { data } = await requestWithFallback(
    () => api.get<ApiResponse<Admin> | Admin>(`/admin/staff/${id}`),
    () => api.get<ApiResponse<Admin> | Admin>(`/admins/staff/${id}`),
  );
  return unwrapData(data);
}

export async function createAdmin(payload: unknown) {
  const { data } = await requestWithFallback(
    () => api.post<ApiResponse<null> | null>("/admin/staff", payload),
    () => api.post<ApiResponse<null> | null>("/admins/staff", payload),
  );
  return data;
}

export type AdminDashboard = {
  totalUsers: number;
  totalMerchants: number;
  totalRevenue: number;
  totalPlatformFee: number;
  totalReviewerFee: number;
  totalCompletedOrders: number;
  averageOrderValue: number;
  newUsersToday: number;
  pendingApplications: number;
  pendingReviewerApplications: number;
  totalOrders?: number;
};

export type AdminMerchantRevenue = {
  merchantId: string;
  merchantName: string;
  logoUrl?: string | null;
  completedOrders: number;
  totalRevenue: number;
  platformFee: number;
  reviewerFee: number;
  merchantReceive: number;
  averageOrderValue: number;
  lastOrderAt?: string | null;
  revenueGrowth: number;
};

const EMPTY_ADMIN_DASHBOARD: AdminDashboard = {
  totalUsers: 0,
  totalMerchants: 0,
  totalRevenue: 0,
  totalPlatformFee: 0,
  totalReviewerFee: 0,
  totalCompletedOrders: 0,
  averageOrderValue: 0,
  newUsersToday: 0,
  pendingApplications: 0,
  pendingReviewerApplications: 0,
};

export async function getAdminDashboard() {
  const { data } = await requestWithFallback(
    () =>
      api.get<ApiResponse<AdminDashboard> | AdminDashboard>("/admin/dashboard"),
    () =>
      api.get<ApiResponse<AdminDashboard> | AdminDashboard>(
        "/admins/dashboard",
      ),
  );

  return unwrapData(data) ?? EMPTY_ADMIN_DASHBOARD;
}

export async function getAdminMerchantRevenues(params?: {
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  const requestConfig = {
    params: {
      searchTerm: params?.searchTerm || undefined,
      pageIndex: params?.pageIndex ?? 1,
      pageSize: params?.pageSize ?? 10,
    },
  };

  const { data } = await requestWithFallback(
    () =>
      api.get<ApiResponse<AdminMerchantRevenue[]> | AdminMerchantRevenue[]>(
        "/admin/merchant-revenues",
        requestConfig,
      ),
    () =>
      api.get<ApiResponse<AdminMerchantRevenue[]> | AdminMerchantRevenue[]>(
        "/admins/merchant-revenues",
        requestConfig,
      ),
  );

  return unwrapData(data) ?? [];
}
