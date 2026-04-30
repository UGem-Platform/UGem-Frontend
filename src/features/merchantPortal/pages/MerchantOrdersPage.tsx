import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { getMerchantOrders, acceptOrder, rejectOrder } from "../services";

type MerchantOrderSummary = {
  id: string;
  status?: string;
  finalPrice?: number;
  totalAmount?: number;
};

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<MerchantOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = (await getMerchantOrders()) as MerchantOrderSummary[];

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

  async function handleAccept(orderId: string) {
    setActioningId(orderId);
    try {
      await acceptOrder(orderId);
      alert("Đã chấp nhận đơn hàng.");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Accepted" } : o)),
      );
    } catch (error) {
      console.error(error);
      alert("Chấp nhận đơn thất bại.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(orderId: string) {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    setActioningId(orderId);
    try {
      await rejectOrder(orderId, reason);
      alert("Đã từ chối đơn hàng.");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Rejected" } : o)),
      );
    } catch (error) {
      console.error(error);
      alert("Từ chối đơn thất bại.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-5 text-2xl font-bold">Đơn hàng của quán</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">Đơn #{order.id}</p>
                    <p className="text-sm text-slate-500">
                      Trạng thái: {order.status}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-cyan-700 mb-3">
                      {(
                        order.finalPrice ||
                        order.totalAmount ||
                        0
                      ).toLocaleString("vi-VN")}
                      đ
                    </p>

                    {(order.status === "Pending" || !order.status) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(order.id)}
                          disabled={actioningId === order.id}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                        >
                          <CheckCircle2 size={16} />
                          Chấp nhận
                        </button>
                        <button
                          onClick={() => handleReject(order.id)}
                          disabled={actioningId === order.id}
                          className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Từ chối
                        </button>
                      </div>
                    )}
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
