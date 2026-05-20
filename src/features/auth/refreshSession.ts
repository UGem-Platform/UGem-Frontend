import { getRouteByRole } from "./hooks/useLogin";
import { refreshTokenApi } from "./services";
import { getAccessToken, getRefreshToken, saveAuthToken } from "./store";

export async function refreshCurrentSession() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) {
    throw new Error("Missing auth tokens");
  }

  const data = await refreshTokenApi({
    accessToken,
    refreshToken,
  });
  const token = data.accessToken;

  if (!token) {
    throw new Error("Missing refreshed access token");
  }

  const user = saveAuthToken(token, {
    refreshToken: data.refreshToken,
    refreshTokenExpiresAtUtc: data.refreshTokenExpiresAtUtc,
  });
  window.dispatchEvent(new Event("ugem:profile-updated"));

  return {
    user,
    route: getRouteByRole(user.Role),
  };
}
