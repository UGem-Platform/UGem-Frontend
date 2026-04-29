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

  // Chưa có field riêng ở BE, chỉ giữ UI rồi gộp vào description
  underratedReason: string;
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
  email?: string;
  logoUrl?: string;
  createdAt?: string;
  reviewedAt?: string;
  updatedAt?: string;
  applicationMenus?: {
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category?: string;
  }[];
};
