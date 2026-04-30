import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getStaffList() {
  const res = await api.get<ApiResponse<unknown[]>>("/Staff");
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
