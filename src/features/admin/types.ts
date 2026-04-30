export type Application = {
  id: string;
  status?: string;
  merchantName?: string;
  businessName?: string;
  address?: string;
  description?: string;
  rejectReason?: string;
  note?: string;
  createdAt?: string;
  applicationMenus?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  }[];
};
