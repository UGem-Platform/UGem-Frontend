export type ApplicationStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Draft"
  | string;

export type ApplicationMenuItem = {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
};

export type PriceRange = "Tiết kiệm" | "Bình dân" | "Tầm trung";

export type OnboardingFormValues = {
  restaurantName: string;
  email: string;

  // Chưa có field riêng ở BE, chỉ giữ UI rồi gộp vào description
  restaurantType: string;
  mainDishType: string;
  priceRange: PriceRange | "";

  description: string;

  // BE có latitude/longitude, nhưng chưa có address string riêng
  address: string;
  latitude: number;
  longitude: number;

  logoUrl: string;

  menu: {
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category?: string;
  }[];
};

export type CreateApplicationPayload = {
  name: string;
  description: string;
  email: string;
  phone: string;
  logoUrl: string;
  latitude: number;
  longitude: number;
  menu: {
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category?: string;
  }[];
};

export type MerchantApplication = {
  id: string;
  name: string;
  description: string;
  type?: string;
  status: ApplicationStatus;
  createdAt?: string;
  reviewedAt?: string;
  updatedAt?: string | null;
  applicant?: null;
  applicationMenus?: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category?: string;
  }[];
};

export type Food = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  merchantId?: string;
  isAvailable?: boolean;
  categoryIds?: string[];
};

export type CreateFoodPayload = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  merchantId: string;
  isAvailable: boolean;
  categoryIds: string[];
};

export type CreateFoodResponse = {
  id: string;
  name: string;
  price: number;
  message: string;
};
