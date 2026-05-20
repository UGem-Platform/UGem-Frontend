import { api } from "@/lib/axios";
import { API_V1_BASE_URL } from "@/lib/env";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AffiliateLink = {
  affiliateLinkId: string;
  linkCode: string;
  url: string;
  clickCount: number;
  isActive: boolean;
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

export type CreateAffiliateLinkPayload = {
  merchantId: string;
};

export async function createAffiliateLink(
  payload: CreateAffiliateLinkPayload,
) {
  const { data } = await api.post<ApiResponse<AffiliateLink>>(
    "/affiliate-links",
    payload,
  );

  return unwrapData(data);
}

export function getAffiliateTrackUrl(linkCode: string) {
  const baseUrl =
    API_V1_BASE_URL.startsWith("http") || typeof window === "undefined"
      ? API_V1_BASE_URL
      : `${window.location.origin}${API_V1_BASE_URL}`;

  return `${baseUrl}/affiliate-links/${encodeURIComponent(
    linkCode,
  )}/track`;
}
