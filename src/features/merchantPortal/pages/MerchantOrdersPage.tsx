import { useEffect, useState } from "react";
import { Check, Eye, QrCode, RefreshCw, X } from "lucide-react";
import {
  acceptOrder,
  confirmCashPayment,
  getMerchantCheckInQr,
  getMerchantOrderDetail,
  getMerchantOrders,
  rejectOrder,
  updateBill,
} from "../services";
import type {
  CustomerOrderDetailItem,
  MerchantOrderSummary,
} from "@/shared/types";
import { notify } from "@/shared/lib/notify";
import { MerchantHeader } from "@/shared/layouts/Merchants/MerchantHeader";
import { MerchantSidebar } from "@/shared/layouts/Merchants/MerchantSidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type MerchantOrderDetailItem = CustomerOrderDetailItem & {
  Name?: string;
  Quantity?: number;
  notes?: string;
  note?: string;
  subTotal?: number;
  SubTotal?: number;
  unitPrice?: number;
  UnitPrice?: number;
};

type MerchantOrderDetailPayload =
  | MerchantOrderDetailItem[]
  | {
      items?: MerchantOrderDetailItem[];
      foods?: MerchantOrderDetailItem[];
      orderItems?: MerchantOrderDetailItem[];
      details?: MerchantOrderDetailItem[];
      notes?: string;
      note?: string;
      finalPrice?: number;
      FinalPrice?: number;
      totalPrice?: number;
      TotalPrice?: number;
    };

function formatCurrency(value?: number | null) {
  return `${Number(value ?? 0).toLocaleString("vi-VN")}đ`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getOrderStatusKey(status?: string | null) {
  return status?.trim().toLowerCase() ?? "";
}

function getOrderStatusChipClass(status?: string | null) {
  const statusKey = getOrderStatusKey(status);

  if (statusKey === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (statusKey === "accepted" || statusKey === "billconfirmed") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  if (statusKey === "pending" || statusKey === "cashpending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (statusKey === "rejected" || statusKey === "billrejected") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function canGenerateCheckInQr(status?: string | null) {
  const statusKey = getOrderStatusKey(status);

  return (
    statusKey === "accepted" ||
    statusKey === "billupdated" ||
    statusKey === "billconfirmed"
  );
}

function getOrderActionMessage(status?: string | null) {
  const statusKey = getOrderStatusKey(status);

  if (statusKey === "accepted") {
    return "Đơn đã được chấp nhận. Có thể tạo mã QR check-in cho khách.";
  }

  if (statusKey === "billconfirmed") {
    return "Khách đã xác nhận bill. Có thể tạo lại QR check-in nếu cần.";
  }

  if (statusKey === "cashpending") {
    return "Khách đã thanh toán tiền mặt, chờ merchant xác nhận để hoàn tất check-in.";
  }

  if (statusKey === "billupdated") {
    return "Bill đã được cập nhật, có thể tạo lại QR check-in.";
  }

  if (statusKey === "completed") {
    return "Đơn đã hoàn tất, không còn QR check-in.";
  }

  if (statusKey === "rejected") {
    return "Đơn đã bị từ chối.";
  }

  return "Chỉ có thể duyệt đơn đang ở trạng thái Pending.";
}

function getDetailItems(detail: MerchantOrderDetailPayload | null) {
  if (!detail) return [];

  if (Array.isArray(detail)) {
    return detail;
  }

  return (
    detail.items ?? detail.foods ?? detail.orderItems ?? detail.details ?? []
  );
}

function getDetailNote(detail: MerchantOrderDetailPayload | null) {
  if (!detail || Array.isArray(detail)) return "";

  return detail.notes ?? detail.note ?? "";
}

function getLockedOrderMessage(status?: string | null) {
  const statusKey = getOrderStatusKey(status);

  if (statusKey === "accepted") {
    return "Đơn đã được chấp nhận, có thể tạo QR xác nhận bill.";
  }

  if (statusKey === "billconfirmed") {
    return "Khách đã xác nhận bill, chờ khách thanh toán và hoàn tất check-in.";
  }

  if (statusKey === "cashpending") {
    return "Khách đã thanh toán tiền mặt, chờ merchant xác nhận để hoàn tất check-in.";
  }

  if (statusKey === "billupdated") {
    return "Bill đã được cập nhật, có thể tạo lại QR để khách xác nhận.";
  }

  if (statusKey === "billrejected") {
    return "Khách đã từ chối bill, hãy cập nhật hóa đơn.";
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] =
    useState<MerchantOrderDetailPayload | null>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  const selectedOrder = orders.find(
    (order) => order.orderId === selectedOrderId,
  );

  async function loadOrders(
    shouldCommit = () => true,
    options: { silent?: boolean } = {},
  ) {
    if (!options.silent) {
      setLoading(true);
    }

    try {
      const data = await getMerchantOrders();

      if (shouldCommit()) {
        setOrders(data ?? []);
        setQrUrls((current) => {
          const next = { ...current };

          for (const orderId of Object.keys(current)) {
            const matchingOrder = data?.find(
              (order) => order.orderId === orderId,
            );

            if (!matchingOrder || !canGenerateCheckInQr(matchingOrder.status)) {
              delete next[orderId];
            }
          }

          return next;
        });
      }
    } catch (error) {
      console.error(error);
      notify.error("Không tải được đơn của merchant.");
    } finally {
      if (shouldCommit() && !options.silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (detailOpen) {
      return;
    }

    let active = true;

    queueMicrotask(() => {
      void loadOrders(() => active);
    });

    const pollId = window.setInterval(() => {
      void loadOrders(() => active, { silent: true });
    }, 4000);

    return () => {
      active = false;
      window.clearInterval(pollId);
    };
  }, [detailOpen]);

  useEffect(() => {
    if (!detailOpen || !selectedOrderId) {
      return;
    }

    let active = true;

    void getMerchantOrderDetail(selectedOrderId)
      .then((data) => {
        if (!active) return;
        setOrderDetail(data as MerchantOrderDetailPayload);
      })
      .catch((error) => {
        console.error(error);
        if (!active) return;
        setDetailError("Không tải được chi tiết đơn.");
      })
      .finally(() => {
        if (!active) return;
        setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [detailOpen, selectedOrderId]);

  function openOrderDetail(orderId: string) {
    setSelectedOrderId(orderId);
    setDetailLoading(true);
    setDetailError(null);
    setOrderDetail(null);
    setDetailOpen(true);
  }

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

  async function handleGenerateQr(
    orderId: string,
    billAlreadyConfirmed = false,
  ) {
    setActionOrderId(orderId);

    try {
      const nextUrl = await getMerchantCheckInQr(orderId, billAlreadyConfirmed);
      setQrUrls((current) => ({
        ...current,
        [orderId]: nextUrl,
      }));
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

  async function handleConfirmCashPayment(order: MerchantOrderSummary) {
    const orderStatus = getOrderStatusKey(order.status);
    const paymentMethod = order.paymentMethod?.trim().toLowerCase();

    if (orderStatus !== "cashpending" || paymentMethod !== "cash") {
      notify.error(
        "Chỉ có thể xác nhận thanh toán cho đơn tiền mặt đang chờ xác nhận.",
      );
      return;
    }

    setActionOrderId(order.orderId);

    try {
      await confirmCashPayment(order.orderId);
      notify.success("Đã xác nhận thanh toán tiền mặt.");
      await loadOrders();
    } catch (error) {
      console.error(error);
      notify.error("Xác nhận thanh toán thất bại.");
    } finally {
      setActionOrderId(null);
    }
  }

  function getItemName(item: MerchantOrderDetailItem) {
    return item.name ?? item.Name ?? "Món ăn";
  }

  function getItemQuantity(item: MerchantOrderDetailItem) {
    return item.quantity ?? item.Quantity ?? 0;
  }

  function getItemUnitPrice(item: MerchantOrderDetailItem) {
    return item.unitPrice ?? item.UnitPrice ?? 0;
  }

  function getItemNote(item: MerchantOrderDetailItem) {
    return item.notes ?? item.note ?? "";
  }

  function getItemToppings(item: MerchantOrderDetailItem) {
    return item.toppings ?? [];
  }

  function getItemSubTotal(item: MerchantOrderDetailItem) {
    return item.subTotal ?? item.SubTotal ?? 0;
  }

  function getDetailTotal() {
    if (!selectedOrder) {
      return 0;
    }

    const detail =
      orderDetail && !Array.isArray(orderDetail) ? orderDetail : null;

    return (
      detail?.finalPrice ??
      detail?.FinalPrice ??
      detail?.totalPrice ??
      detail?.TotalPrice ??
      selectedOrder.finalPrice
    );
  }

  const detailItems = getDetailItems(orderDetail);
  const detailTotal = getDetailTotal();

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
                        {order.createdAt ? (
                          <p className="text-xs text-slate-400">
                            {formatDateTime(order.createdAt)}
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
                      <button
                        type="button"
                        onClick={() => openOrderDetail(order.orderId)}
                        className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </button>

                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                        {getOrderActionMessage(order.status)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 && (
                <p className="text-center text-slate-500">Chưa có đơn nào.</p>
              )}
            </div>
          )}

          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent
              className="max-h-[92vh] max-w-4xl overflow-hidden border-white/80 bg-slate-50/95 p-0 shadow-2xl shadow-slate-950/25 backdrop-blur-xl"
              onInteractOutside={(event) => event.preventDefault()}
              onEscapeKeyDown={(event) => event.preventDefault()}
            >
              <DialogHeader className="border-b border-cyan-100 bg-white/90 px-6 py-5 text-left">
                <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-6 text-slate-500">
                  Xem món ăn, ghi chú, giá tiền và thao tác duyệt đơn ở đây.
                </DialogDescription>
              </DialogHeader>

              {selectedOrder ? (
                <div className="max-h-[calc(92vh-104px)] space-y-5 overflow-y-auto px-6 py-5">
                  <div className="grid gap-3 rounded-3xl border border-white/80 bg-white p-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-950/5 sm:grid-cols-2">
                    <div>
                      <div className="text-slate-500">Mã đơn</div>
                      <div className="break-all font-mono text-xs font-bold text-slate-900">
                        {selectedOrder.orderId}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Trạng thái</div>
                      <div
                        className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${getOrderStatusChipClass(
                          selectedOrder.status,
                        )}`}
                      >
                        {selectedOrder.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Khách</div>
                      <div className="font-semibold text-slate-900">
                        {selectedOrder.customerName || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Thời gian đặt</div>
                      <div className="font-semibold text-slate-900">
                        {formatDateTime(selectedOrder.createdAt)}
                      </div>
                    </div>
                  </div>

                  {detailLoading ? (
                    <p>Đang tải chi tiết đơn...</p>
                  ) : detailError ? (
                    <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-rose-700">
                      {detailError}
                    </div>
                  ) : null}

                  <div className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm ring-1 ring-slate-950/5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-950">
                        Món đã gọi
                      </h3>
                      <div className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-black text-cyan-700 ring-1 ring-cyan-100">
                        Tổng: {formatCurrency(getDetailTotal())}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {detailItems.map((item, index) => (
                        <div
                          key={`${getItemName(item)}-${index}`}
                          className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="font-black text-slate-950">
                                {getItemName(item)}
                              </div>
                              <div className="mt-1 inline-flex rounded-full bg-white px-2.5 py-1 text-sm font-bold text-slate-600 ring-1 ring-slate-100">
                                Số lượng: {getItemQuantity(item)}
                              </div>
                              {getItemToppings(item).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {getItemToppings(item).map((topping) => (
                                    <span
                                      key={topping.id ?? topping.name}
                                      className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                    >
                                      +{topping.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {getItemNote(item) ? (
                                <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-100">
                                  Ghi chú: {getItemNote(item)}
                                </div>
                              ) : null}
                            </div>

                            <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-right text-sm shadow-sm ring-1 ring-slate-100">
                              <div className="font-medium text-slate-700">
                                Đơn giá:{" "}
                                {formatCurrency(getItemUnitPrice(item))}
                              </div>
                              <div className="mt-1 font-black text-cyan-700">
                                Thành tiền:{" "}
                                {formatCurrency(getItemSubTotal(item))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {!detailLoading && detailItems.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          Chưa có dữ liệu món ăn.
                        </p>
                      ) : null}
                    </div>

                    {getDetailNote(orderDetail) ? (
                      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                        <div className="font-semibold">Ghi chú đơn hàng</div>
                        <div className="mt-1">{getDetailNote(orderDetail)}</div>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-3xl border border-cyan-100 bg-cyan-50/80 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-slate-500">Tổng tiền</div>
                      <div className="text-2xl font-black text-cyan-700">
                        {formatCurrency(detailTotal)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-cyan-100 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 shadow-sm ring-1 ring-cyan-50">
                    {getOrderActionMessage(selectedOrder.status)}
                  </div>

                  <DialogFooter className="border-t border-slate-100 pt-4 gap-3 sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {getOrderStatusKey(selectedOrder.status) === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              void handleAcceptOrder(selectedOrder)
                            }
                            disabled={actionOrderId === selectedOrder.orderId}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Check size={16} />
                            Xác nhận đơn
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleRejectOrder(selectedOrder)
                            }
                            disabled={actionOrderId === selectedOrder.orderId}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:-translate-y-px hover:bg-rose-50 disabled:opacity-50"
                          >
                            <X size={16} />
                            Từ chối đơn
                          </button>
                        </>
                      ) : null}

                      {getOrderStatusKey(selectedOrder.status) ===
                      "billrejected" ? (
                        <button
                          type="button"
                          onClick={() => void handleUpdateBill(selectedOrder)}
                          disabled={actionOrderId === selectedOrder.orderId}
                          className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:-translate-y-px hover:bg-amber-50 disabled:opacity-50"
                        >
                          Cập nhật hóa đơn
                        </button>
                      ) : null}

                      {canGenerateCheckInQr(selectedOrder.status) ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleGenerateQr(
                              selectedOrder.orderId,
                              getOrderStatusKey(selectedOrder.status) ===
                                "billconfirmed",
                            )
                          }
                          disabled={actionOrderId === selectedOrder.orderId}
                          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:-translate-y-px hover:bg-cyan-50 disabled:opacity-50"
                        >
                          <QrCode size={16} />
                          Tạo mã QR check-in
                        </button>
                      ) : null}

                      {getOrderStatusKey(selectedOrder.status) ===
                        "cashpending" &&
                      selectedOrder.paymentMethod?.trim().toLowerCase() ===
                        "cash" ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleConfirmCashPayment(selectedOrder)
                          }
                          disabled={actionOrderId === selectedOrder.orderId}
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check size={16} />
                          Xác nhận thanh toán tiền mặt
                        </button>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailOpen(false)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-px hover:bg-slate-50"
                    >
                      Đóng
                    </button>
                  </DialogFooter>

                  {qrUrls[selectedOrder.orderId] ? (
                    <div className="mx-auto inline-flex rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
                      <img
                        src={qrUrls[selectedOrder.orderId]}
                        alt={`QR check-in ${selectedOrder.orderId}`}
                        className="h-40 w-40 object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </main>
  );
}
