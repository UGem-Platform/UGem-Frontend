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
  const res = await api.get<ApiResponse<Review[]>>("/reviews");
  return res.data.data ?? [];
}

export async function getReviewById(id: string) {
  const res = await api.get<ApiResponse<unknown>>(`/reviews/${id}`);
  return res.data.data;
}

export async function createReview(payload: unknown) {
  const res = await api.post<ApiResponse<null>>("/reviews", payload);
  return res.data;
}
