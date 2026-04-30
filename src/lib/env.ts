const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.toString().trim();

export const API_BASE_URL = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, "")
  : "";
