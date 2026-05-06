import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AffiliateLink = {
  id?: string;
  name?: string;
  url?: string;
  description?: string;
  status?: string;
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

export async function createAffiliateLink(payload: unknown) {
  const { data } = await api.post<ApiResponse<null>>(
    "/affiliate-links",
    payload,
  );
  return data;
}

export async function getAffiliateLinks() {
  const res = await api.get<ApiResponse<AffiliateLink[]> | AffiliateLink[]>(
    "/affiliate-links",
  );
  return unwrapData(res.data) ?? [];
}

export async function getAffiliateLinkById(id: string) {
  const res = await api.get<ApiResponse<unknown> | unknown>(
    `/affiliate-links/${id}`,
  );
  return unwrapData(res.data);
}
