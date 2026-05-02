import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types";

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ApiResponse<string> | string>(
    "/Media/images",
    formData,
  );

  // Xử lý trường hợp backend trả về trực tiếp chuỗi URL (plain string)
  if (typeof data === "string") {
    if (!data) throw new Error("Không nhận được URL ảnh sau khi tải lên.");
    return data;
  }

  // Xử lý trường hợp backend trả về object (ví dụ: Cloudinary upload result hoặc ApiResponse)
  if (data && typeof data === "object") {
    // Nếu được wrap trong ApiResponse
    if ("data" in data && typeof data.data === "string") {
      return data.data;
    }

    // Nếu trả về JSON raw từ Cloudinary thường có field secure_url hoặc url
    const cloudinaryResponse = data as Record<string, unknown>;
    if (typeof cloudinaryResponse.secure_url === "string") {
      return cloudinaryResponse.secure_url;
    }
    if (typeof cloudinaryResponse.url === "string") {
      return cloudinaryResponse.url;
    }
  }

  console.error("Upload response không đúng định dạng:", data);
  throw new Error("Không nhận được URL ảnh sau khi tải lên.");
}
