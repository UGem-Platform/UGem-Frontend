import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

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
  const { data } = await api.get<ApiResponse<Admin[]> | Admin[]>("/admins");
  return unwrapData(data) ?? [];
}

export async function getAdminById(id: string) {
  const { data } = await api.get<ApiResponse<Admin> | Admin>(`/admins/${id}`);
  return unwrapData(data);
}

export async function createAdmin(payload: unknown) {
  const { data } = await api.post<ApiResponse<null> | null>(
    "/admins",
    payload,
  );
  return data;
}
