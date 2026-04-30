import { api } from "@/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getNotifications() {
  const res = await api.get<ApiResponse<any[]>>("/Notification");
  return res.data.data;
}
