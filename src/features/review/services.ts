import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function shouldFallback(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 404 || status === 405;
}

export type ReviewDetail = {
  id?: string;
  reviewId?: string;
  orderDetailId?: string;
  detailContent?: string;
  rating?: number;
  createdAt?: string;
};

export type Review = {
  id?: string;
  userId?: string;
  orderId?: string;
  oderId?: string;
  merchantId?: string;
  title?: string;
  name?: string;
  comment?: string;
  content?: string;
  description?: string;
  rating?: number;
  imageUrl?: string | null;
  createdAt?: string;
  customerName?: string | null;
  CustomerName?: string | null;
  customerAvatarUrl?: string | null;
  CustomerAvatarUrl?: string | null;
  reviewDetails?: ReviewDetail[];
};

export type CreateMerchantReviewPayload = {
  merchantId: string;
  orderId: string;
  rating: number;
  content?: string;
  imageUrl?: string;
  reviewDetails?: {
    orderDetailId: string;
    detailContent?: string;
    rating: number;
  }[];
};

export type UpdateMerchantReviewPayload = {
  reviewId: string;
  rating?: number;
  content?: string;
  imageUrl?: string;
  reviewDetails?: {
    reviewDetailId: string;
    detailContent?: string;
    rating?: number;
  }[];
};

export type ReviewerApplicationPayload = {
  motivation: string;
  experience?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  otherSocialUrl?: string;
};

export type UpdateReviewerApplicationPayload =
  Partial<ReviewerApplicationPayload> & {
    reviewerApplicationId: string;
  };

export async function getReviewsByMerchantId(merchantId: string) {
  const res = await api.get<ApiResponse<Review[]>>("/reviews/merchant", {
    params: {
      merchantId,
    },
  });

  return res.data.data ?? [];
}

export async function getReviews(params?: { merchantId?: string }) {
  if (!params?.merchantId) {
    return [];
  }

  return getReviewsByMerchantId(params.merchantId);
}

export async function getReviewDetailsByMerchant(reviewId: string) {
  const res = await api.get<ApiResponse<ReviewDetail[]>>(
    "/reviews/merchant/review-details",
    {
      params: {
        reviewId,
      },
    },
  );

  return res.data.data ?? [];
}

export async function getReviewById(id: string) {
  return getReviewDetailsByMerchant(id);
}

export async function createMerchantReview(
  payload: CreateMerchantReviewPayload,
) {
  const res = await api.post<ApiResponse<null>>("/reviews/merchant", payload);
  return res.data;
}

export async function createReview(payload: CreateMerchantReviewPayload) {
  return createMerchantReview(payload);
}

export async function updateMerchantReview(
  payload: UpdateMerchantReviewPayload,
) {
  const res = await api.put<ApiResponse<null>>("/reviews/merchant", payload);
  return res.data;
}

export async function createReviewerApplication(
  payload: ReviewerApplicationPayload,
) {
  try {
    const res = await api.post<ApiResponse<null>>(
      "/reviewer-application",
      payload,
    );
    return res.data;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
  }

  const res = await api.post<ApiResponse<null>>(
    "/reviewer-applications",
    payload,
  );
  return res.data;
}

export type ReviewerApplication = {
  id?: string;
  motivation?: string;
  experience?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  otherSocialUrl?: string;
  status?: string;
  rejectionReason?: string;
  customerId?: string;
  createdAt?: string;
};

export async function getMyReviewerApplication() {
  try {
    const res = await api.get<ApiResponse<ReviewerApplication>>(
      "/reviewer-application",
    );
    return res.data.data ?? null;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
  }

  const res = await api.get<ApiResponse<ReviewerApplication>>(
    "/reviewer-applications",
  );
  return res.data.data ?? null;
}

export async function updateReviewerApplication(
  payload: UpdateReviewerApplicationPayload,
) {
  try {
    const res = await api.patch<ApiResponse<null>>(
      "/reviewer-application",
      payload,
    );
    return res.data;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
  }

  const res = await api.patch<ApiResponse<null>>(
    "/reviewer-applications",
    payload,
  );
  return res.data;
}
