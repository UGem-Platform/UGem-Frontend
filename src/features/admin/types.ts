export type Application = {
  id: string;
  type?: string;
  status?: string;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string | null;

  name?: string;
  description?: string;

  applicant?: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl?: string | null;
  } | null;

  applicationMenus?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category?: string;
  }[];
};
