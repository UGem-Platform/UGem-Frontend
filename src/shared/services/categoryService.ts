import { api } from "@/lib/axios";
import type { ApiResponse, Category } from "@/shared/types";

export async function getCategories() {
  const { data } = await api.get<ApiResponse<Category[]>>("/categories");
  return data.data ?? [];
}

export async function getChildCategories(parentId: string) {
  const { data } = await api.get<ApiResponse<Category[]>>(
    `/categories/${parentId}/children`,
  );

  return data.data ?? [];
}
