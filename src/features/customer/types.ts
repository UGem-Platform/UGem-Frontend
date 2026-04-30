export type Merchant = {
  id: string;
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  rating?: number;
  distance?: number;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
};

export type Food = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryDetail?: string[];
};

export type MerchantDetail = Merchant & {
  menu?: Food[];
};

export type CustomerOrderSummary = {
  name?: string;
  discount?: number;
  finalPrice?: number;
  status?: string;
  orderedAt?: string;
  notes?: string;
  deliveryAddress?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CreateOrderItem = {
  foodId: string;
  quantity: number;
};
