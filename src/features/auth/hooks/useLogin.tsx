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
      const user = saveAuthToken(data.accessToken);

      navigate(getRouteByRole(user.Role), {
        replace: true,
      });
    },
  });
}
