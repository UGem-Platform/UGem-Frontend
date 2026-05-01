export type Merchant = {
  id: string;
  name?: string;
  merchantName?: string;
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  imageUrl?: string;
  rating?: number;
  distance?: number;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  status?: string;
  menu?: MerchantMenuItem[];
};

export type MerchantMenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryDetail?: string[];
};

export type Food = MerchantMenuItem;

export type MerchantDetail = Merchant & {
  foods?: MerchantMenuItem[];
  menu?: MerchantMenuItem[];
};

export type CustomerProfile = {
  userId?: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  avatarUrl?: string | null;
};
