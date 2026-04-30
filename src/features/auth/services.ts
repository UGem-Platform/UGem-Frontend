import { api } from "../../lib/axios";
import type { LoginRequest, LoginResponse } from "./types";

export async function loginApi(payload: LoginRequest) {
  const { data } = await api.get<LoginResponse>("/Identity/login", {
    params: {
      email: payload.email,
      password: payload.password,
    },
  });

  return data;
}
