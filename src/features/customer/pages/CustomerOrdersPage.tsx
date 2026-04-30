import { useEffect, useState } from "react";
import { getCustomerOrders } from "../services/orderService";
import type { CustomerOrderSummary } from "../types";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await getCustomerOrders();

        if (active) {
          setOrders(data ?? []);
        }
      } catch (error) {
        console.error(error);
        alert("Không tải được đơn hàng.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-5 text-2xl font-bold">Đơn hàng của tôi</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={`${order.name}-${order.orderedAt}`}
                className="block rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">{order.name || "Đơn hàng"}</p>

                    <p className="text-sm text-slate-500">
                      Trạng thái: {order.status || "Không rõ"}
                    </p>

                    {order.deliveryAddress && (
                      <p className="text-sm text-slate-500">
                        Địa chỉ: {order.deliveryAddress}
                      </p>
                    )}

                    {order.orderedAt && (
                      <p className="text-sm text-slate-500">
                        Ngày đặt:{" "}
                        {new Date(order.orderedAt).toLocaleString("vi-VN")}
                      </p>
                    )}

                    {order.notes && (
                      <p className="text-sm text-slate-500">
                        Ghi chú: {order.notes}
                      </p>
                    )}
                  </div>

                  <p className="font-bold text-cyan-700">
                    {(order.finalPrice || 0).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-center text-slate-500">Chưa có đơn hàng.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
