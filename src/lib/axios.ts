import axios from "axios";
import { API_BASE_URL } from "./env";
import { clearAuth, getAccessToken } from "../features/auth/store";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.debug("[AXIOS] Auth header set with token");
  }

  const method = config.method?.toLowerCase();
  const hasBody = config.data !== undefined && config.data !== null;

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

  if ((method === "get" || method === "head") && !hasBody) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.response?.statusText ||
      error.message ||
      "Có lỗi xảy ra.";

    if (status === 401 || status === 403) {
      clearAuth();
      console.error(`[AXIOS ${status}] Unauthorized/Forbidden`, {
        url: error.config?.url,
        message,
        data: error.response?.data,
      });

      if (typeof globalThis !== "undefined" && "location" in globalThis) {
        globalThis.location.href = "/login";
      }

      return Promise.reject(
        new Error(
          "Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập. Vui lòng đăng nhập lại.",
        ),
      );
    }

    if (!error.response) {
      console.error("[AXIOS Network Error]", error.message, error.config?.url);
      return Promise.reject(
        new Error(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.",
        ),
      );
    }

    console.error(`[AXIOS ${status}]`, message);
    return Promise.reject(new Error(message));
  },
);
