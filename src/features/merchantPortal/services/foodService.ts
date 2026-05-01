import { api } from "@/lib/axios";
import type { CreateFoodPayload, CreateFoodResponse, Food } from "../types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function createFood(payload: CreateFoodPayload) {
  const { data } = await api.post<CreateFoodResponse>("/food", payload);
  return data;
}

export async function getFoods() {
  const { data } = await api.get<ApiResponse<Food[]> | Food[]>("/food");

  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function getFoodById(id: string) {
  const { data } = await api.get<ApiResponse<Food> | Food>(`/food/${id}`);

  return "data" in data ? data.data : data;
}
