export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type RegisterRole = "Customer" | "Merchant";

export type LoginRoleOption = RegisterRole | "Staff";

export type GoogleLoginRequest = {
  idToken: string;
  role?: RegisterRole;
};

export type GoogleLoginResponse = LoginResponse & {
  fullName?: string;
  role?: string;
  avatarUrl?: string | null;
};

export type RegisterRequest = {
  email: string;
  password: string;
  phoneNumber: string;
  fullName: string;
  avatarUrl?: string;
  role: RegisterRole;
};

export type UserRole = "Customer" | "Merchant" | "Staff" | "Admin" | string;

export type JwtPayload = {
  UserId?: string;
  Email?: string;
  Name?: string;
  Role?: UserRole;
  CustomerId?: string;
  MerchantId?: string;
  exp?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
  traceId?: string | null;
  timestampUtc?: string;
};
