import { api } from "@/lib/axios";
import type { CreateFoodPayload, CreateFoodResponse, Food } from "../types";
import { getMyMerchantDetail } from "../services";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function createFood(payload: CreateFoodPayload) {
  const { data } = await api.post<CreateFoodResponse>("/foods", payload);
  return data;
}

export async function getFoods() {
  try {
    const { data } = await api.get<ApiResponse<Food[]> | Food[]>("/foods");
    const foods = Array.isArray(data) ? data : (data.data ?? []);

    if (foods.length > 0) {
      return foods;
    }
  } catch {
    // The current backend exposes GET /foods but returns an empty response.
  }

  const merchant = await getMyMerchantDetail();
  return (merchant?.menu ?? merchant?.foods ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl,
    categoryDetail: item.categoryDetail,
    isAvailable: true,
  }));
}

export async function getFoodById(id: string) {
  const { data } = await api.get<ApiResponse<Food> | Food>(`/foods/${id}`);

  return "data" in data ? data.data : data;
}

export async function deleteFood(id: string) {
  const { data } = await api.delete<ApiResponse<null>>(`/foods/${id}`);
  return data;
}
