import { useEffect, useState } from "react";
import { getMerchantOrders } from "../services";

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const data = await getMerchantOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      alert("Không tải được đơn của merchant.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-5 text-2xl font-bold">Đơn hàng của quán</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Đơn #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      Trạng thái: {order.status}
                    </p>
                  </div>

                  <p className="font-bold text-blue-600">
                    {(
                      order.finalPrice ||
                      order.totalAmount ||
                      0
                    ).toLocaleString("vi-VN")}
                    đ
                  </p>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-center text-gray-500">Chưa có đơn nào.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
