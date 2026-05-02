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

export async function createAffiliateLink(payload: unknown) {
  const { data } = await api.post<ApiResponse<null>>(
    "/affiliate-links",
    payload,
  );
  return data;
}

export async function getAffiliateLinks() {
  const res = await api.get<ApiResponse<AffiliateLink[]>>("/affiliate-links");
  return res.data.data ?? [];
}

export async function getAffiliateLinkById(id: string) {
  const res = await api.get<ApiResponse<unknown>>(`/affiliate-links/${id}`);
  return res.data.data;
}
