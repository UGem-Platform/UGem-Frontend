import { api } from "@/lib/axios";
import type {
  ApiResponse,
  CreateFoodRequest,
  CreateFoodResponse,
  Food,
} from "@/shared/types";

type FoodListPayload = Food[] | { items?: Food[] };

function unwrapFoodList(
  payload: FoodListPayload | ApiResponse<FoodListPayload>,
) {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    const data = payload.data;
    return Array.isArray(data) ? data : (data.items ?? []);
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return "items" in payload && Array.isArray(payload.items)
    ? payload.items
    : [];
}

function unwrapFoodItem(payload: Food | ApiResponse<Food>) {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return payload.data;
  }

  return payload;
}

export async function createFood(payload: CreateFoodRequest) {
  const { data } = await api.post<
    CreateFoodResponse | ApiResponse<CreateFoodResponse>
  >("/food", payload);

  return unwrapFoodItem(
    data as CreateFoodResponse | ApiResponse<CreateFoodResponse>,
  );
}

export async function getFoods() {
  const { data } = await api.get<
    ApiResponse<FoodListPayload> | FoodListPayload
  >("/food");
  return unwrapFoodList(data as ApiResponse<FoodListPayload> | FoodListPayload);
}

export async function getFoodById(id: string) {
  const { data } = await api.get<ApiResponse<Food> | Food>(`/food/${id}`);
  return unwrapFoodItem(data as ApiResponse<Food> | Food);
}
