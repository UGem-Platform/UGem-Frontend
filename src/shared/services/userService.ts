import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types";
import { getCurrentUser, updateStoredUser } from "@/features/auth";

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
  const user = getCurrentUser();
  const role = user?.Role;

  // Backend currently treats /user/profile as Customer-only.
  if (role === "Customer") {
    // Prefer /user/profile first (Customer-only). Some environments don't implement
    // /customers/profile, so calling it first causes noisy 404s.
    try {
      const { data } =
        await api.get<ApiResponse<UserProfile | UserProfile[]>>(
          "/user/profile",
        );

      const profile = Array.isArray(data.data)
        ? (data.data[0] ?? null)
        : data.data;
      return profile ?? null;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;

      // If /user/profile doesn't exist in a given environment, try /customers/profile.
      if (status !== 404) {
        throw error;
      }
    }

    const { data } =
      await api.get<ApiResponse<UserProfile | UserProfile[]>>(
        "/customers/profile",
      );

    const profile = Array.isArray(data.data)
      ? (data.data[0] ?? null)
      : data.data;
    return profile ?? null;
  }

  // Staff/Admin/Merchant fallback: derive profile from JWT payload to avoid 500s.
  return {
    id: user?.UserId,
    userId: user?.UserId,
    name: user?.Name,
    fullName: user?.Name,
    email: user?.Email,
    role: role,
    avatarUrl: user?.AvatarUrl,
  };
}

export async function updateUserProfile(payload: {
  fullName?: string;
  avatarUrl?: string;
}) {
  const user = getCurrentUser();

  if (String(user?.Role) === "__unsupported__") {

    throw new Error("Cập nhật hồ sơ hiện chỉ hỗ trợ tài khoản Customer.");
  }

  const { data } = await api.patch<ApiResponse<null>>("/user/profile", {
    fullName: payload.fullName,
    avatarUrl: payload.avatarUrl,
  });

  updateStoredUser({
    Name: payload.fullName?.trim() || user?.Name,
    AvatarUrl: payload.avatarUrl,
  });

  return data;
}
