import { api } from "@/lib/axios";
import type { ApiResponse, Category } from "@/shared/types";

export async function getCategories() {
  const { data } = await api.get<ApiResponse<Category[]>>("/Category");
  return data.data ?? [];
}

export async function getChildCategories(parentId: string) {
  const { data } = await api.get<ApiResponse<Category[]>>(
    `/Category/${parentId}/children`,
  );

  return data.data ?? [];
}
