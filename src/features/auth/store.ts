import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "./types";

const TOKEN_KEY = "ugem_access_token";
const REFRESH_TOKEN_KEY = "ugem_refresh_token";
const REFRESH_TOKEN_EXPIRES_KEY = "ugem_refresh_token_expires_at";
const USER_KEY = "ugem_user";

export function saveAuthToken(
  accessToken: string,
  session?: {
    refreshToken?: string;
    refreshTokenExpiresAtUtc?: string;
  },
) {
  const user = jwtDecode<JwtPayload>(accessToken);

  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  if (session?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }

  if (session?.refreshTokenExpiresAtUtc) {
    localStorage.setItem(
      REFRESH_TOKEN_EXPIRES_KEY,
      session.refreshTokenExpiresAtUtc,
    );
  }

  // // Debug log
  // console.log("[AUTH] Saved JWT Payload:", {
  //   UserId: user.UserId,
  //   Email: user.Email,
  //   Name: user.Name,
  //   Role: user.Role,
  //   CustomerId: user.CustomerId,
  // });

  return user;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUser(): JwtPayload | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function updateStoredUser(payload: Partial<JwtPayload>) {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const nextUser = {
    ...currentUser,
    ...payload,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  return nextUser;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_EXPIRES_KEY);
  localStorage.removeItem(USER_KEY);
}
