import { useEffect, useState } from "react";
import { getMerchantOrders } from "../services";
import type { MerchantOrderSummary } from "@/shared/types";

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<MerchantOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await getMerchantOrders();

        if (active) {
          setOrders(data ?? []);
        }
      } catch (error) {
        console.error(error);
        alert("Không tải được đơn của merchant.");
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
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-5 text-2xl font-bold">Đơn hàng của quán</h1>
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Contract backend hiện tại chỉ public `GET /api/order` cho màn này.
          Nút chấp nhận hoặc từ chối đơn đã được ẩn vì chưa có endpoint tương
          ứng trong danh sách API mới.
        </p>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">Đơn #{order.orderId}</p>
                    <p className="text-sm text-slate-500">
                      Trạng thái: {order.status}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-cyan-700">
                      {order.finalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-center text-slate-500">Chưa có đơn nào.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
