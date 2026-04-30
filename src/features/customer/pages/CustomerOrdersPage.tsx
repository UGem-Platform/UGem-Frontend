import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerOrders } from "../services/orderService";

type CustomerOrderSummary = {
  id: string;
  status?: string;
  finalPrice?: number;
  totalAmount?: number;
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = (await getCustomerOrders()) as CustomerOrderSummary[];

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
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-5 text-2xl font-bold">Đơn hàng của tôi</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/customer/orders/${order.id}`}
                className="block rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Đơn #{order.id}</p>
                    <p className="text-sm text-slate-500">
                      Trạng thái: {order.status}
                    </p>
                  </div>

                  <p className="font-bold text-cyan-700">
                    {(
                      order.finalPrice ||
                      order.totalAmount ||
                      0
                    ).toLocaleString("vi-VN")}
                    đ
                  </p>
                </div>
              </Link>
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
