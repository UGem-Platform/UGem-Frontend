import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type NotificationItem = {
  id?: string;
  title?: string;
  message?: string;
  content?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  isRead?: boolean;
  actionUrl?: string;
  targetUrl?: string;
  url?: string;
  metadata?: Record<string, unknown>;
};

export async function getNotifications() {
  const res = await api.get<ApiResponse<NotificationItem[]>>("/notifications");
  return res.data.data ?? [];
}
