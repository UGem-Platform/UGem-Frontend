export type Merchant = {
  id: string;
  name?: string;
  merchantName?: string;
  description?: string;
  address?: string;
  logoUrl?: string;
  imageUrl?: string;
  rating?: number;
  distance?: number;
};

export type Food = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

export type MerchantDetail = Merchant & {
  foods?: Food[];
  menu?: Food[];
};
