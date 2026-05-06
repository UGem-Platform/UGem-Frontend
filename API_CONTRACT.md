# UGem.Api v1 Frontend API Contract

This file stores the normalized frontend API contract for `UGem.Api v1`.

## Base URL

```
https://ugem-test-backend.onrender.com
```

## Auth

- `Authorization` header is required for protected endpoints.
- Header format:

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Response envelope

```ts
{
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
  traceId?: string;
  timestampUtc: string;
}
```

### Standard error body

```ts
{
  success: false;
  message: string;
  errors?: {
    code?: string;
    details?: any;
  };
  traceId?: string;
  timestampUtc: string;
}
```

---

## 1. AUTH

### Login

```http
POST /api/v1/auth/login
```

#### Request

```ts
LoginRequest {
  email: string;
  password: string;
}
```

### Register

```http
POST /api/v1/auth/register
```

#### Request

```ts
RegisterUserRequest {
  email: string;
  password: string;
  phoneNumber: string;
  fullName: string;
  role: string;
}
```

---

## 2. CUSTOMERS

### Get customer profile

```http
GET /api/v1/customers/profile
```

---

## 3. MERCHANTS

### Search merchants

```http
GET /api/v1/merchants
```

#### Query parameters

```ts
{
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
}
```

### Get merchant by id

```http
GET /api/v1/merchants/{id}
```

### Get merchants by category

```http
GET /api/v1/merchants/by-category
```

#### Query parameters

```ts
{
  categoryId: string;
  pageIndex?: number;
  pageSize?: number;
}
```

### Get merchants for map

```http
GET /api/v1/merchants/map
```

#### Query parameters

```ts
{
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
  zoomLevel: number;
}
```

---

## 4. CATEGORIES

### Create category

```http
POST /api/v1/categories
```

### Get all categories

```http
GET /api/v1/categories
```

### Get child categories

```http
GET /api/v1/categories/{parentId}/children
```

---

## 5. FOODS

### Create food

```http
POST /api/v1/foods
```

### Get foods

```http
GET /api/v1/foods
```

### Get food by id

```http
GET /api/v1/foods/{id}
```

---

## 6. ORDERS

### Create order (customer)

```http
POST /api/v1/orders
```

#### Request

```ts
CreateOrderRequest {
  name: string;
  paymentMethod: string;
  notes: string;
  deliveryAddress: string;
  foods: FoodOrderRequest[];
}
```

#### FoodOrderRequest

```ts
{
  foodId: string;
  quantity: number;
}
```

### Get merchant orders

```http
GET /api/v1/orders
```

### Get customer orders

```http
GET /api/v1/orders/mine
```

### Get order detail

```http
GET /api/v1/orders/{id}
```

### Update order status

```http
PATCH /api/v1/orders/{id}/status
```

#### Request

```ts
UpdateOrderStatusRequest {
  status: "Accepted" | "Rejected" | "Completed" | "NotReceived";
  reason?: string; // required when status = Rejected
}
```

---

## 7. REVIEWS

### Create review

```http
POST /api/v1/reviews
```

### Get reviews

```http
GET /api/v1/reviews
```

### Get review by id

```http
GET /api/v1/reviews/{id}
```

---

## 8. WISHLISTS

### Add to wishlist

```http
POST /api/v1/wishlists
```

#### Request

```ts
CreateWishlistRequest {
  merchantId: string;
}
```

### Get wishlist

```http
GET /api/v1/wishlists
```

### Remove wishlist

```http
DELETE /api/v1/wishlists/{merchantId}
```

---

## 9. APPLICATIONS

### Create application

```http
POST /api/v1/applications
```

#### Request

```ts
ApplicationRequest {
  name: string;
  description: string;
  email: string;
  phone: string;
  logoUrl: string;
  openingHours: string;
  address: string;
  latitude: number;
  longitude: number;
  menu: CreateFoodRequest[];
}
```

### Get merchant applications

```http
GET /api/v1/applications/mine
```

### Get applications (staff/admin)

```http
GET /api/v1/applications
```

### Update application

```http
PUT /api/v1/applications/{id}
```

### Update application status

```http
PATCH /api/v1/applications/{id}/status
```

#### Request

```ts
UpdateApplicationStatusRequest {
  status: "Accepted" | "Rejected";
  note?: string;
}
```

---

## 10. AFFILIATE LINKS

### Create affiliate link

```http
POST /api/v1/affiliate-links
```

### Get affiliate links

```http
GET /api/v1/affiliate-links
```

### Get affiliate link by id

```http
GET /api/v1/affiliate-links/{id}
```

---

## 11. ADMIN / STAFF

### Admin

```http
POST /api/v1/admins
GET /api/v1/admins
GET /api/v1/admins/{id}
```

### Staff

```http
POST /api/v1/staff
GET /api/v1/staff
GET /api/v1/staff/{id}
```

---

## 12. NOTIFICATIONS

### Get notifications

```http
GET /api/v1/notifications
```

---

## 13. FRONTEND ARCHITECTURE SUGGESTION

### API layer structure

```
/api
  auth.api.ts
  customer.api.ts
  merchant.api.ts
  food.api.ts
  order.api.ts
  review.api.ts
  wishlist.api.ts
  application.api.ts
  category.api.ts
```

---

### Axios base client

```ts
const api = axios.create({
  baseURL: "https://ugem-test-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Request interceptor

```ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
