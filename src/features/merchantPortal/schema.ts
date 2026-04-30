import { z } from "zod";

export const onboardingSchema = z.object({
  restaurantName: z.string().min(1, "Vui lòng nhập tên quán"),
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),

  restaurantType: z.string().min(1, "Vui lòng chọn loại hình quán"),
  mainDishType: z.string().min(1, "Vui lòng chọn loại món chính"),
  priceRange: z.string().min(1, "Vui lòng chọn khoảng giá"),

  description: z.string().min(10, "Mô tả tối thiểu 10 ký tự"),

  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  latitude: z.number().default(0),
  longitude: z.number().default(0),

  logoUrl: z.string().default(""),

  menu: z
    .array(
      z.object({
        name: z.string().min(1, "Vui lòng nhập tên món"),
        description: z.string().min(1, "Vui lòng nhập mô tả món"),
        price: z.number().min(1000, "Giá món không hợp lệ"),
        imageUrl: z.string().optional(),
        imageUploadDataUrl: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .min(1, "Vui lòng thêm ít nhất 1 món"),
});

export type OnboardingFormValues = z.input<typeof onboardingSchema>;
export type OnboardingSchema = z.output<typeof onboardingSchema>;
