export type ApplicationStatus = "Pending" | "Approved" | "Rejected" | "Draft";

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
  phone: string;

  restaurantType: string;
  mainDishType: string;
  priceRange: PriceRange | "";
  openingHours: string;

  description: string;

  address: string;
  latitude: number;
  longitude: number;

  logoUploadDataUrl?: string;
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
  openingHours: string;
  address: string;
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
  updatedAt?: string;
  applicant?: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string | null;
  } | null;
  applicationMenus?: {
    id?: string;
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
