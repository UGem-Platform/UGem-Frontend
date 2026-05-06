import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types";

export type UserProfile = {
  id?: string;
  userId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  role?: string;
};

export async function getUserProfile() {
  const { data } = await api.get<ApiResponse<UserProfile>>("/user/profile");
  return data.data;
}

export async function updateUserProfile(payload: {
  fullName?: string;
  avatarUrl?: string;
}) {
  const { data } = await api.patch<ApiResponse<null>>("/user/profile", {
    fullName: payload.fullName,
    avatarUrl: payload.avatarUrl,
  });

  return data;
}
