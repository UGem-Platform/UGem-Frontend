import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types";

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ApiResponse<string>>(
    "/Media/images",
    formData,
  );

  if (!data.data) {
    throw new Error("Không nhận được URL ảnh sau khi tải lên.");
  }

  return data.data;
}
