export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken?: string;
  AccessToken?: string;
};

export type UserRole = "Customer" | "Merchant" | "Staff" | "Admin" | string;

export type JwtPayload = {
  UserId?: string;
  Email?: string;
  Role?: UserRole;
  CustomerId?: string;
  exp?: number;
};
