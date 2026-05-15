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

export type Staff = {
  id?: string;
  userId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  hiredAt?: string;
  createdAt?: string;
};

export type ReviewerApplication = {
  id?: string;
  status?: string;
  motivation?: string;
  experience?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  otherSocialUrl?: string;
  rejectionReason?: string;
  customerId?: string;
  createdAt?: string;
};

type StaffPageResult = {
  items?: Staff[];
  Items?: Staff[];
  totalItems?: number;
  TotalItems?: number;
  pageSize?: number;
  PageSize?: number;
  pageIndex?: number;
  PageIndex?: number;
};

type ReviewerApplicationPageResult = {
  items?: ReviewerApplication[];
  Items?: ReviewerApplication[];
};

export type CreateStaffPayload = {
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
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

function normalizeStaffRecord(raw: Record<string, unknown>): Staff {
  return {
    id: toStringValue(raw.id ?? raw.Id),
    userId: toStringValue(raw.userId ?? raw.UserId),
    name: toStringValue(raw.name ?? raw.Name),
    fullName: toStringValue(raw.fullName ?? raw.FullName),
    email: toStringValue(raw.email ?? raw.Email),
    role: toStringValue(raw.role ?? raw.Role),
    phoneNumber: toStringValue(raw.phoneNumber ?? raw.PhoneNumber),
    avatarUrl: toNullableString(raw.avatarUrl ?? raw.AvatarUrl),
    isActive: toBooleanValue(raw.isActive ?? raw.IsActive),
    hiredAt: toStringValue(raw.hiredAt ?? raw.HiredAt),
    createdAt: toStringValue(raw.createdAt ?? raw.CreatedAt),
  };
}

function toStringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function toNullableString(value: unknown) {
  if (value == null) return value as null | undefined;
  return toStringValue(value);
}

function toBooleanValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return undefined;
}

export async function getStaffList() {
  const res = await requestWithFallback(
    () =>
      api.get<
        ApiResponse<StaffPageResult | Staff[]> | StaffPageResult | Staff[]
      >("/admin/staff"),
    () =>
      api.get<
        ApiResponse<StaffPageResult | Staff[]> | StaffPageResult | Staff[]
      >("/admins/staff"),
  );

  const payload = unwrapData(res.data) ?? [];

  if (Array.isArray(payload)) {
    return payload.map((item) =>
      normalizeStaffRecord(item as Record<string, unknown>),
    );
  }

  const items = payload.items ?? payload.Items ?? [];
  return items.map((item) =>
    normalizeStaffRecord(item as Record<string, unknown>),
  );
}

export async function getStaffById(id: string) {
  const res = await requestWithFallback(
    () => api.get<ApiResponse<unknown> | unknown>(`/admin/staff/${id}`),
    () => api.get<ApiResponse<unknown> | unknown>(`/admins/staff/${id}`),
  );
  return unwrapData(res.data);
}

export async function createStaff(payload: CreateStaffPayload) {
  const res = await requestWithFallback(
    () => api.post<ApiResponse<null>>("/admin/staff", payload),
    () => api.post<ApiResponse<null>>("/admins/staff", payload),
  );
  return res.data;
}

export async function deleteStaff(staffId: string) {
  const res = await requestWithFallback(
    () => api.delete<ApiResponse<null>>(`/admin/staff/${staffId}`),
    () => api.delete<ApiResponse<null>>(`/admins/staff/${staffId}`),
  );
  return res.data;
}

export async function getReviewerApplications() {
  const res = await api.get<
    | ApiResponse<ReviewerApplicationPageResult | ReviewerApplication[]>
    | ReviewerApplicationPageResult
    | ReviewerApplication[]
  >("/staff", {
    params: {
      pageIndex: 1,
      pageSize: 100,
    },
  });

  const payload = unwrapData(res.data) ?? [];

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.items ?? payload.Items ?? [];
}

export async function acceptReviewerApplication(applicationId: string) {
  const res = await api.post<ApiResponse<null>>("/staff/accept", {
    applicationId,
  });
  return res.data;
}

export async function rejectReviewerApplication(
  applicationId: string,
  reason: string,
) {
  const res = await api.post<ApiResponse<null>>("/staff/reject", {
    applicationId,
    reason,
  });
  return res.data;
}
