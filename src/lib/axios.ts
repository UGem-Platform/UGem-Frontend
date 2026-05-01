import axios from "axios";
import { API_BASE_URL } from "./env";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ugem_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[AXIOS] Auth header set with token");
  } else {
    console.warn("[AXIOS] No auth token found");
  }

  const method = config.method?.toLowerCase();
  const hasBody = config.data !== undefined && config.data !== null;

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

    // Debug logging
    if (status === 403) {
      console.error("[AXIOS 403] Forbidden", {
        url: error.config?.url,
        message,
        data: error.response?.data,
      });
      return Promise.reject(
        new Error(
          "Không có quyền. Vui lòng đăng nhập lại hoặc kiểm tra tài khoản.",
        ),
      );
    }

    console.error(`[AXIOS ${status}]`, message);
    return Promise.reject(new Error(message));
  },
);
