import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Review = {
  id?: string;
  title?: string;
  name?: string;
  comment?: string;
  description?: string;
  rating?: number;
  createdAt?: string;
};

export async function getReviews() {
  const res = await api.get<ApiResponse<Review[]>>("/Review");
  return res.data.data ?? [];
}

export async function getReviewById(id: string) {
  const res = await api.get<ApiResponse<unknown>>(`/Review/${id}`);
  return res.data.data;
}

export async function createReview(payload: unknown) {
  const res = await api.post<ApiResponse<null>>("/Review", payload);
  return res.data;
}
