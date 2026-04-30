import { api } from "../../lib/axios";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "./types";

export async function loginApi(payload: LoginRequest) {
  const { data } = await api.get<LoginResponse>("/Identity/login", {
    params: {
      email: payload.email,
      password: payload.password,
    },
  });

  return data;
}

export async function registerCustomerApi(payload: RegisterRequest) {
  const { data } = await api.post<ApiResponse<string>>("/Customer/register", {
    email: payload.email,
    hashedPassword: payload.password,
    phoneNumber: payload.phoneNumber,
    fullName: payload.fullName,
    avatarUrl: payload.avatarUrl || "",
  });

  return data;
}
