import { api } from "../../lib/axios";
import type { ApiResponse } from "@/shared/types";
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "./types";

export async function loginApi(payload: LoginRequest) {
  const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
    email: payload.email,
    password: payload.password,
  });

  return data.data;
}

export async function googleLoginApi(payload: GoogleLoginRequest) {
  const { data } = await api.post<ApiResponse<GoogleLoginResponse>>(
    "/auth/google-login",
    {
      idToken: payload.idToken,
      role: payload.role,
    },
  );

  return data.data;
}

export async function registerApi(payload: RegisterRequest) {
  const { data } = await api.post<ApiResponse<string>>("/auth/register", {
    email: payload.email,
    password: payload.password,
    phoneNumber: payload.phoneNumber,
    fullName: payload.fullName,
    role: payload.role,
  });

  return data;
}
