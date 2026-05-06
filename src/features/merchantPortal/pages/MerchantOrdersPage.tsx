import { useEffect, useRef, useState } from "react";
import { Check, QrCode, X } from "lucide-react";
import {
  acceptOrder,
  getMerchantCheckInQr,
  getMerchantOrders,
  rejectOrder,
} from "../services";
import type { MerchantOrderSummary } from "@/shared/types";
import { notify } from "@/shared/lib/notify";

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<MerchantOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const qrUrlsRef = useRef<Record<string, string>>({});

  async function loadOrders(shouldCommit = () => true) {
    setLoading(true);

    try {
      const data = await getMerchantOrders();

      if (shouldCommit()) {
        setOrders(data ?? []);
      }
    } catch (error) {
      console.error(error);
      notify.error("Không tải được đơn của merchant.");
    } finally {
      if (shouldCommit()) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      void loadOrders(() => active);
    });

    return () => {
      active = false;
      Object.values(qrUrlsRef.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  async function handleAcceptOrder(orderId: string) {
    setActionOrderId(orderId);

    try {
      await acceptOrder(orderId);
      notify.success("Đã chấp nhận đơn.");
      await loadOrders();
    } catch (error) {
      console.error(error);
      notify.error("Chấp nhận đơn thất bại.");
    } finally {
      setActionOrderId(null);
    }
  }

  async function handleRejectOrder(orderId: string) {
    const reason = window.prompt("Lý do từ chối đơn hàng")?.trim();

    if (!reason) {
      return;
    }

    setActionOrderId(orderId);

    try {
      await rejectOrder(orderId, reason);
      notify.success("Đã từ chối đơn.");
      await loadOrders();
    } catch (error) {
      console.error(error);
      notify.error("Từ chối đơn thất bại.");
    } finally {
      setActionOrderId(null);
    }
  }

  async function handleGenerateQr(orderId: string) {
    setActionOrderId(orderId);

    try {
      const nextUrl = await getMerchantCheckInQr(orderId);
      const previousUrl = qrUrlsRef.current[orderId];

      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      qrUrlsRef.current = {
        ...qrUrlsRef.current,
        [orderId]: nextUrl,
      };
      setQrUrls(qrUrlsRef.current);
    } catch (error) {
      console.error(error);
      notify.error("Không tạo được QR check-in.");
    } finally {
      setActionOrderId(null);
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
            {orders.map((order) => {
              const isBusy = actionOrderId === order.orderId;
              const qrUrl = qrUrls[order.orderId];

              return (
                <div
                  key={order.orderId}
                  className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Đơn #{order.orderId}</p>
                      <p className="text-sm text-slate-500">
                        Trạng thái: {order.status}
                      </p>
                      <p className="text-sm text-slate-500">
                        Khách: {order.customerName || "N/A"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Địa chỉ: {order.deliveryAddress || "N/A"}
                      </p>
                      {order.createdAt ? (
                        <p className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </p>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-bold text-cyan-700">
                        {order.finalPrice.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleAcceptOrder(order.orderId)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check size={16} />
                      Chấp nhận
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleRejectOrder(order.orderId)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <X size={16} />
                      Từ chối
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleGenerateQr(order.orderId)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 px-3 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50 disabled:opacity-50"
                    >
                      <QrCode size={16} />
                      QR check-in
                    </button>
                  </div>

                  {qrUrl ? (
                    <div className="mt-4 inline-flex rounded-xl border border-slate-100 bg-white p-3">
                      <img
                        src={qrUrl}
                        alt={`QR check-in ${order.orderId}`}
                        className="h-32 w-32 object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}

            {orders.length === 0 && (
              <p className="text-center text-slate-500">Chưa có đơn nào.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
