import { api } from "@/lib/axios";
import type {
  ApiResponse,
  CustomerOrderDetailItem,
  CustomerOrderSummary,
} from "@/shared/types";

export type CreateOrderItem = {
  foodId: string;
  quantity: number;
};

export async function createOrder(payload: {
  name: string;
  deliveryAddress: string;
  notes?: string;
  finalPrice: number;
  foods: CreateOrderItem[];
}) {
  const res = await api.post<ApiResponse<null>>("/order", {
    name: payload.name,
    deliveryAddress: payload.deliveryAddress,
    notes: payload.notes || "",
    finalPrice: payload.finalPrice,
    foods: payload.foods,
  });

  return res.data;
}

export async function getCustomerOrders() {
  const res = await api.get<
    ApiResponse<CustomerOrderSummary[]> | CustomerOrderSummary[]
  >("/order");
  return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
}

export async function getCustomerOrderDetail(orderId: string) {
  const res = await api.get<
    | ApiResponse<
        | CustomerOrderDetailItem[]
        | {
            items?: CustomerOrderDetailItem[];
            foods?: CustomerOrderDetailItem[];
            orderItems?: CustomerOrderDetailItem[];
            details?: CustomerOrderDetailItem[];
          }
      >
    | CustomerOrderDetailItem[]
    | {
        items?: CustomerOrderDetailItem[];
        foods?: CustomerOrderDetailItem[];
        orderItems?: CustomerOrderDetailItem[];
        details?: CustomerOrderDetailItem[];
      }
  >(`/order/${orderId}`);

  const payload =
    res.data &&
    typeof res.data === "object" &&
    "success" in res.data &&
    "data" in res.data
      ? res.data.data
      : res.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  return (
    payload.items ??
    payload.foods ??
    payload.orderItems ??
    payload.details ??
    []
  );
}

export async function confirmReceived(orderId: string) {
  void orderId;
  throw new Error(
    "Backend hiện chưa public endpoint xác nhận nhận hàng trong contract mới.",
  );
}

export async function confirmNotReceived(orderId: string) {
  void orderId;
  throw new Error(
    "Backend hiện chưa public endpoint báo chưa nhận hàng trong contract mới.",
  );
}
