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

export async function getStaffList() {
  const res = await api.get<ApiResponse<Staff[]>>("/Staff");
  return res.data.data ?? [];
}

export async function getStaffById(id: string) {
  const res = await api.get<ApiResponse<unknown>>(`/Staff/${id}`);
  return res.data.data;
}

export async function createStaff(payload: unknown) {
  const res = await api.post<ApiResponse<null>>("/Staff", payload);
  return res.data;
}
