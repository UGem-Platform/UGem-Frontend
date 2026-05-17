import { api } from "@/lib/axios";
import type { CreateFoodPayload, CreateFoodResponse, Food } from "../types";
import { getMyApplications, getMyMerchantDetail } from "../services";
import {
  getMapMerchants,
  getMerchantDetail,
} from "@/features/customer/services/merchantService";
import type { MerchantDetail } from "@/features/customer/types";

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

  const merchant = await getMyMerchantDetail() ?? await resolveMerchantFromApprovedApplication();
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

function normalizeText(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

async function resolveMerchantFromApprovedApplication(): Promise<MerchantDetail | null> {
  const applications = await getMyApplications();
  const approvedApplication = applications.find((application) =>
    ["approved", "accepted", "accept"].includes(
      application.status.toLowerCase(),
    ),
  );

  if (!approvedApplication) return null;

  const merchants = await getMapMerchants({
    MinLongitude: -180,
    MaxLongitude: 180,
    MinLatitude: -90,
    MaxLatitude: 90,
    ZoomLevel: 20,
  });

  const applicationName = normalizeText(approvedApplication.name);
  const applicationAddress = normalizeText(approvedApplication.address);

  const matchedMerchant = merchants.find((merchant) => {
    const merchantName = normalizeText(merchant.name);
    const merchantAddress = normalizeText(merchant.address);

    return (
      merchantName === applicationName ||
      (applicationName && merchantName.includes(applicationName)) ||
      (applicationAddress && merchantAddress === applicationAddress)
    );
  });

  return matchedMerchant ? getMerchantDetail(matchedMerchant.id) : null;
}

export async function getFoodById(id: string) {
  const { data } = await api.get<ApiResponse<Food> | Food>(`/foods/${id}`);

  return "data" in data ? data.data : data;
}

export async function deleteFood(id: string) {
  const { data } = await api.delete<ApiResponse<null>>(`/foods/${id}`);
  return data;
}
