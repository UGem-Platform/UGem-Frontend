import { api } from "../../lib/axios";
import type { ApiResponse } from "@/shared/types";
import type { LoginRequest, LoginResponse, RegisterRequest } from "./types";

export async function loginApi(payload: LoginRequest) {
  const { data } = await api.get<LoginResponse>("/Identity/login", {
    params: {
      email: payload.email,
      password: payload.password,
    },
  });

  return data;
}

export async function registerApi(payload: RegisterRequest) {
  const { data } = await api.post<ApiResponse<string>>("/Customer/register", {
    email: payload.email,
    hashedPassword: payload.password,
    phoneNumber: payload.phoneNumber,
    fullName: payload.fullName,
    role: payload.role,
  });

  return data;
}
