import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../services";
import { saveAuthToken } from "../store";
import type { LoginRequest } from "../types";

export function getRouteByRole(role?: string) {
  if (role === "Merchant") return "/merchant";
  if (role === "Admin") return "/admin/jobs";
  if (role === "Staff") return "/staff/dashboard";
  return "/customer";
}

export function useLogin() {
  const navigate = useNavigate();
  // If login page was opened with a returnUrl query param, prefer that.
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get("returnUrl");

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const data = await loginApi(payload);
      const token = data.accessToken;

      if (!token) {
        throw new Error("Không nhận được token từ server.");
      }

      const user = saveAuthToken(token);
      return { data, user };
    },

    onSuccess: ({ user }) => {
      if (returnUrl) {
        // try to navigate back to requested path
        try {
          navigate(returnUrl, { replace: true });
          return;
        } catch {
          // fallthrough to role-based route
        }
      }

      navigate(getRouteByRole(user.Role), {
        replace: true,
      });
    },
  });
}
