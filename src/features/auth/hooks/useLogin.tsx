import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../services";
import { clearAuth, saveAuthToken } from "../store";
import type { JwtPayload, LoginRequest, LoginRoleOption } from "../types";

export function getRouteByRole(role?: string) {
  if (role === "Merchant") return "/merchant";
  if (role === "Admin" || role === "Staff") return "/admin/applications";
  return "/customer";
}

function getRoleLabel(role?: string) {
  if (role === "Customer") return "Khách hàng";
  if (role === "Merchant") return "Chủ quán";
  if (role === "Staff") return "Nhân viên";
  if (role === "Admin") return "Admin";
  return "không xác định";
}

export function isRoleAllowedForLoginOption(
  actualRole: string | undefined,
  selectedRole: LoginRoleOption,
) {
  if (selectedRole === "Staff") {
    return actualRole === "Staff" || actualRole === "Admin";
  }

  return actualRole === selectedRole;
}

export function getLoginRoleMismatchMessage(
  actualRole: string | undefined,
  selectedRole: LoginRoleOption,
) {
  return `Tài khoản này là ${getRoleLabel(
    actualRole,
  )}. Hãy chọn tab ${getRoleLabel(selectedRole)} để đăng nhập.`;
}

export function saveAndValidateAuthToken(
  accessToken: string,
  selectedRole: LoginRoleOption,
): JwtPayload {
  const user = saveAuthToken(accessToken);

  if (!isRoleAllowedForLoginOption(user.Role, selectedRole)) {
    clearAuth();
    throw new Error(getLoginRoleMismatchMessage(user.Role, selectedRole));
  }

  return user;
}

export function useLogin(selectedRole: LoginRoleOption = "Customer") {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const data = await loginApi(payload);
      const token = data.accessToken;

      if (!token) {
        throw new Error("Không nhận được token từ server.");
      }

      const user = saveAndValidateAuthToken(token, selectedRole);
      return { data, user };
    },

    onSuccess: ({ user }) => {
      navigate(getRouteByRole(user.Role), {
        replace: true,
      });
    },
  });
}
