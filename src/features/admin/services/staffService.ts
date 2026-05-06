import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Staff = {
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

export async function getStaffList() {
  const res = await api.get<ApiResponse<Staff[]> | Staff[]>("/staff");
  return unwrapData(res.data) ?? [];
}

export async function getStaffById(id: string) {
  const res = await api.get<ApiResponse<unknown> | unknown>(`/staff/${id}`);
  return unwrapData(res.data);
}

export async function createStaff(payload: unknown) {
  const res = await api.post<ApiResponse<null>>("/staff", payload);
  return res.data;
}
