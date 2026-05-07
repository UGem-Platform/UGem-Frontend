import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCustomerOrderId,
  getCustomerOrders,
} from "../services/orderService";
import type { CustomerOrderSummary } from "@/shared/types";
import { notify } from "@/shared/lib/notify";

export default function CustomerOrdersPage() {
  const navigate = useNavigate();
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
        notify.error("Không tải được đơn hàng.");
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

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/customer");
  }

  function handleViewDetail(
    order: CustomerOrderSummary,
    fallbackOrderNumber: number,
  ) {
    const orderRouteId =
      getCustomerOrderId(order) || `summary-${fallbackOrderNumber}`;

    navigate(`/customer/orders/${orderRouteId}`, {
      state: {
        order,
        fallbackOrderNumber,
      },
    });
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center rounded-xl border border-cyan-200 bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-950/10 backdrop-blur transition hover:-translate-y-px hover:bg-cyan-700 hover:shadow-lg"
        >
          Back
        </button>

        <div className="mb-5">
          <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi lịch sử đặt món và trạng thái xử lý đơn hàng.
          </p>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => {
              const isCompleted = order.status?.toLowerCase() === "completed";
              const orderId = getCustomerOrderId(order);
              const key = orderId || `${order.name}-${order.orderedAt}`;
              const detailPath = orderId ? `/customer/orders/${orderId}` : null;

              return (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiết đơn ${order.name}`}
                  onClick={() => handleViewDetail(order, index + 1)}
                  onKeyDown={(event) => {
                    if (event.currentTarget !== event.target) return;

                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleViewDetail(order, index + 1);
                    }
                  }}
                  className="cursor-pointer rounded-lg border border-white/70 bg-white/90 p-4 shadow-lg shadow-slate-950/5 backdrop-blur transition hover:-translate-y-px hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-300"
                >
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                      <p className="font-semibold">{order.name}</p>
                      <p className="text-sm text-slate-500">
                        Trạng thái: {order.status}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.orderedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <p className="text-right font-bold text-cyan-700">
                      {order.finalPrice.toLocaleString("vi-VN")}đ
                    </p>

                    <div className="space-y-1 sm:col-span-2">
                      {order.deliveryAddress && (
                        <p className="text-sm text-slate-500">
                          Địa chỉ: {order.deliveryAddress}
                        </p>
                      )}

                      {order.notes && (
                        <p className="text-sm text-slate-500">
                          Ghi chú: {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 sm:col-span-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleViewDetail(order, index + 1);
                        }}
                        className="inline-flex min-w-36 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100 hover:text-cyan-800"
                      >
                        Xem chi tiết đơn
                      </button>

                      {detailPath && isCompleted && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`${detailPath}#review-section`);
                          }}
                          className="inline-flex items-center rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
                        >
                          Đánh giá
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {orders.length === 0 && (
              <p className="text-center text-slate-500">Chưa có đơn hàng.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
