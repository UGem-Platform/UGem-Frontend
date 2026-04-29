export type UserRole = "Customer" | "Merchant" | "Staff" | "Admin";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
  traceId?: string;
  timestampUtc?: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type JwtPayload = {
  UserId?: string;
  Email?: string;
  Role?: UserRole;
  CustomerId?: string;
  exp?: number;
};

export type Merchant = {
  id: string;
  name: string;
  rating: number;
  distance?: number | null;
  description?: string;
  logoUrl?: string;
  address?: string;
};

export type Category = {
  id: string;
  name: string;
  parentId?: string | null;
};

export type Application = {
  id: string;
  merchantName?: string;
  status?: string;
  createdAt?: string;
  email?: string;
  address?: string;
};
