import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type NotificationItem = {
  id: string;
  title?: string;
  message?: string;
  content?: string;
  createdAt?: string;
  type?: "info" | "success" | "warning" | "error";
  isRead?: boolean;
};

export async function getNotifications() {
  const res = await api.get<ApiResponse<NotificationItem[]>>("/notifications");
  return res.data.data;
}
