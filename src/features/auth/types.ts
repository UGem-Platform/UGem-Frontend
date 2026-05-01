export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  phoneNumber: string;
  fullName: string;
  avatarUrl: string;
};

export type UserRole = "Customer" | "Merchant" | "Staff" | "Admin" | string;

export type JwtPayload = {
  UserId?: string;
  Email?: string;
  Role?: UserRole;
  CustomerId?: string;
  exp?: number;
};

export type RegisterRequest = {
  email: string;
  password: string;
  phoneNumber: string;
  fullName: string;
  avatarUrl?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
  traceId?: string | null;
  timestampUtc?: string;
};
