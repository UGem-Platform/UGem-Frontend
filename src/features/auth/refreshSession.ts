import { getRouteByRole } from "./hooks/useLogin";
import { refreshTokenApi } from "./services";
import { saveAuthToken } from "./store";

export async function refreshCurrentSession() {
  const data = await refreshTokenApi();
  const token = data.accessToken;

  if (!token) {
    throw new Error("Missing refreshed access token");
  }

  const user = saveAuthToken(token);
  window.dispatchEvent(new Event("ugem:profile-updated"));

  return {
    user,
    route: getRouteByRole(user.Role),
  };
}
