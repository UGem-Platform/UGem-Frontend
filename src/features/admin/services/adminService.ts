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
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
  pendingApplications: number;
  pendingReviewerApplications: number;
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

  return (
    unwrapData(data) ?? {
      totalUsers: 0,
      totalMerchants: 0,
      totalOrders: 0,
      totalRevenue: 0,
      newUsersToday: 0,
      pendingApplications: 0,
      pendingReviewerApplications: 0,
    }
  );
}
