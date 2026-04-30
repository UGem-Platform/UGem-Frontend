import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../services";
import { saveAuthToken } from "../store";
import type { LoginRequest } from "../types";

function getRouteByRole(role?: string) {
  if (role === "Merchant") return "/merchant";
  if (role === "Admin" || role === "Staff") return "/admin/applications";
  return "/customer";
}

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginRequest) => loginApi(payload),

    onSuccess: (data) => {
      const token = data.accessToken || data.AccessToken;

      if (!token) {
        throw new Error("Không nhận được token từ server.");
      }

      const user = saveAuthToken(token);

      navigate(getRouteByRole(user.Role), {
        replace: true,
      });
    },
  });
}
