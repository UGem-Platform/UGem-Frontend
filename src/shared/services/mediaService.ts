import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types";

export const IMAGE_UPLOAD_ACCEPT = "image/jpeg,image/png,image/gif,image/webp";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 - 16 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
]);

type UploadImageResponse =
  | ApiResponse<string>
  | string
  | {
      url?: string;
      secure_url?: string;
    };

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export function validateImageFile(file: File) {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Ảnh phải nhỏ hơn 5MB.");
  }

  const contentType = file.type.toLowerCase();
  const extension = getFileExtension(file.name);

  if (
    !SUPPORTED_IMAGE_TYPES.has(contentType) ||
    !SUPPORTED_IMAGE_EXTENSIONS.has(extension)
  ) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, GIF hoặc WebP.");
  }
}

export async function uploadImage(file: File) {
  validateImageFile(file);

  const formData = new FormData();
  formData.append("file", file, file.name);

  let data: UploadImageResponse;

  try {
    const response = await api.post<UploadImageResponse>(
      "/media/images",
      formData,
    );
    data = response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("status code 400")) {
      throw new Error(
        "Không thể tải ảnh lên. Hãy chọn ảnh JPG, PNG, GIF hoặc WebP nhỏ hơn 5MB.",
      );
    }

    throw error;
  }

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
