import { useEffect, useRef, useState } from "react";
import { Check, QrCode, RefreshCw, X } from "lucide-react";
import {
  acceptOrder,
  getMerchantCheckInQr,
  getMerchantOrders,
  rejectOrder,
  updateBill,
} from "../services";
import type { MerchantOrderSummary } from "@/shared/types";
import { notify } from "@/shared/lib/notify";
import { MerchantHeader } from "@/shared/layouts/Merchants/MerchantHeader";
import { MerchantSidebar } from "@/shared/layouts/Merchants/MerchantSidebar";

function getOrderStatusKey(status?: string | null) {
  return status?.trim().toLowerCase() ?? "";
}

function getLockedOrderMessage(status?: string | null) {
  const statusKey = getOrderStatusKey(status);

  if (statusKey === "accepted") {
    return "Đơn đã được chấp nhận, chờ khách xác nhận nhận hàng.";
  }

  if (statusKey === "completed") {
    return "Đơn đã hoàn tất, không thể duyệt lại.";
  }

  if (statusKey === "rejected") {
    return "Đơn đã bị từ chối, không thể duyệt lại.";
  }

  return "Chỉ có thể duyệt đơn đang ở trạng thái Pending.";
}

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

  async function handleAcceptOrder(order: MerchantOrderSummary) {
    if (getOrderStatusKey(order.status) !== "pending") {
      notify.error(getLockedOrderMessage(order.status));
      return;
    }

    const { orderId } = order;
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

  async function handleRejectOrder(order: MerchantOrderSummary) {
    if (getOrderStatusKey(order.status) !== "pending") {
      notify.error(getLockedOrderMessage(order.status));
      return;
    }

    const reason = window.prompt("Lý do từ chối đơn hàng")?.trim();

    if (!reason) {
      return;
    }

    const { orderId } = order;
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

  async function handleGenerateQr(orderId: string, billAlreadyConfirmed = false) {
    setActionOrderId(orderId);

    try {
      const nextUrl = await getMerchantCheckInQr(orderId, billAlreadyConfirmed);
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

  async function handleUpdateBill(order: MerchantOrderSummary) {
    if (getOrderStatusKey(order.status) !== "billrejected") {
      notify.error("Chỉ có thể cập nhật hóa đơn sau khi khách từ chối bill.");
      return;
    }

    const discountInput = window.prompt(
      "Nhập giá trị giảm giá (số, ví dụ 0 hoặc 10000):",
      "0",
    );

    if (discountInput == null) return; // user cancelled

    const discount = Number(discountInput.trim() || "0");

    if (Number.isNaN(discount)) {
      notify.error("Giá trị giảm giá không hợp lệ.");
      return;
    }

    // Ask whether user wants to adjust items as well
    const editItems = window.confirm(
      "Bạn có muốn chỉnh sửa các món trong hóa đơn không? (OK = có)",
    );

    let items:
      | { foodId: string; quantity?: number; unitPrice?: number }[]
      | undefined = undefined;

    if (editItems) {
      const example =
        "foodId,quantity,unitPrice\n...\nVí dụ: 3fae-...-id,2,50000";
      const raw = window.prompt(
        `Nhập các dòng item theo định dạng: foodId,quantity,unitPrice (mỗi dòng một item). Bỏ trống để không thay đổi.\n\n${example}`,
        "",
      );

      if (raw == null) {
        // user cancelled
        setActionOrderId(null);
        return;
      }

      const lines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length > 0) {
        const parsed: {
          foodId: string;
          quantity?: number;
          unitPrice?: number;
        }[] = [];

        for (const line of lines) {
          const parts = line.split(",").map((p) => p.trim());
          if (parts.length < 1) {
            notify.error(`Dòng không hợp lệ: ${line}`);
            return;
          }

          const foodId = parts[0];
          const quantity = parts[1] ? Number(parts[1]) : undefined;
          const unitPrice = parts[2] ? Number(parts[2]) : undefined;

          if (!foodId) {
            notify.error(`foodId trống trong dòng: ${line}`);
            return;
          }

          if (quantity !== undefined && Number.isNaN(quantity)) {
            notify.error(`quantity không hợp lệ trong dòng: ${line}`);
            return;
          }

          if (unitPrice !== undefined && Number.isNaN(unitPrice)) {
            notify.error(`unitPrice không hợp lệ trong dòng: ${line}`);
            return;
          }

          parsed.push({ foodId, quantity, unitPrice });
        }

        items = parsed;
      }
    }

    setActionOrderId(order.orderId);

    try {
      await updateBill(order.orderId, {
        discount,
        ...(items ? { items } : {}),
      });
      notify.success("Đã cập nhật hóa đơn.");
      await loadOrders();
    } catch (error) {
      console.error(error);
      notify.error("Cập nhật hóa đơn thất bại.");
    } finally {
      setActionOrderId(null);
    }
  }

  return (
    <main className="merchant-portal-layout">
      <MerchantSidebar />

      <section className="merchant-main">
        <MerchantHeader />

        <div className="merchant-content">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">
                Đơn hàng của quán
              </h1>
              <p className="text-sm text-slate-500">
                Theo dõi, duyệt đơn và tạo QR xác nhận bill cho khách hàng.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadOrders()}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 text-sm font-semibold text-cyan-700 shadow-sm transition hover:-translate-y-px hover:bg-cyan-50 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const isBusy = actionOrderId === order.orderId;
                const qrUrl = qrUrls[order.orderId];
                const orderStatus = getOrderStatusKey(order.status);
                const isPending = orderStatus === "pending";
                const isBillRejected = orderStatus === "billrejected";
                const canGenerateQr =
                  orderStatus === "accepted" ||
                  orderStatus === "billupdated" ||
                  orderStatus === "billconfirmed";

                return (
                  <div
                    key={order.orderId}
                    className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-lg shadow-slate-950/5 backdrop-blur transition hover:-translate-y-px hover:shadow-xl"
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

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleAcceptOrder(order)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Check size={16} />
                            Chấp nhận
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleRejectOrder(order)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                          >
                            <X size={16} />
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                          {getLockedOrderMessage(order.status)}
                        </span>
                      )}

                      {isBillRejected && (
                        <button
                          type="button"
                          onClick={() => void handleUpdateBill(order)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                        >
                          Cập nhật hóa đơn
                        </button>
                      )}

                      {canGenerateQr && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleGenerateQr(
                              order.orderId,
                              orderStatus === "billconfirmed",
                            )
                          }
                          disabled={isBusy}
                          className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:opacity-50"
                        >
                          <QrCode size={16} />
                          QR xác nhận bill
                        </button>
                      )}
                    </div>

                    {qrUrl ? (
                      <div className="mt-4 inline-flex rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                        <img
                          src={qrUrl}
                          alt={`QR xác nhận bill ${order.orderId}`}
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
      </section>
    </main>
  );
}
