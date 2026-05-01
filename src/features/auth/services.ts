import { api } from "../../lib/axios";
import type { ApiResponse } from "@/shared/types";
import type { LoginRequest, LoginResponse, RegisterRequest } from "./types";

export async function loginApi(payload: LoginRequest) {
  const { data } = await api.get<LoginResponse>("/identity/login", {
    params: {
      email: payload.email,
      password: payload.password,
    },
  });

  return data;
}

export async function registerApi(payload: RegisterRequest) {
  const { data } = await api.post<ApiResponse<string>>("/customer", {
    email: payload.email,
    hashedPassword: payload.password,
    phoneNumber: payload.phoneNumber,
    fullName: payload.fullName,
    avatarUrl: payload.avatarUrl,
  });

  return data;
}
