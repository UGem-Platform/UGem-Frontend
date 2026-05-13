import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, QrCode } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "@/features/auth";
import {
  confirmBill,
  confirmReceived,
  getCustomerOrderId,
  getCustomerOrders,
  getBill,
  rejectBill,
  requestCashPayment,
} from "@/features/customer/services/orderService";

type BillItem = {
  name?: string;
  Name?: string;
  quantity?: number;
  Quantity?: number;
  subTotal?: number;
  SubTotal?: number;
};

type Bill = {
  orderId?: string;
  OrderId?: string;
  name?: string;
  Name?: string;
  paymentMethod?: string;
  PaymentMethod?: string;
  finalPrice?: number;
  FinalPrice?: number;
  items?: BillItem[];
  Items?: BillItem[];
};

const cashPaymentStoragePrefix = "ugem.cash-payment-requested";

function getCashPaymentStorageKey(orderId?: string | null) {
  return orderId ? `${cashPaymentStoragePrefix}.${orderId}` : null;
}

function getPersistedCashRequest(orderId?: string | null) {
  const key = getCashPaymentStorageKey(orderId);

  if (!key || typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(key) === "1";
}

function getServerMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function formatCurrency(value: unknown) {
  const amount = Number(value ?? 0);
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export default function ConfirmBillPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId") ?? searchParams.get("OrderId");
  const billConfirmedFromQr = searchParams.get("billConfirmed") === "1";

  const [loading, setLoading] = useState<boolean>(!!orderId);
  const [error, setError] = useState<string | null>(
    orderId ? null : "Mã đơn hàng không hợp lệ.",
  );
  const [bill, setBill] = useState<Bill | null>(null);
  const [method, setMethod] = useState<"transfer" | "cash">("transfer");
  const [submitting, setSubmitting] = useState(false);
  const [billConfirmed, setBillConfirmed] = useState(billConfirmedFromQr);
  const [showQr, setShowQr] = useState(false);
  const [cashRequested, setCashRequested] = useState(() =>
    getPersistedCashRequest(orderId),
  );

  const billOrderId = bill?.orderId ?? bill?.OrderId ?? orderId;
  const finalPrice = bill?.finalPrice ?? bill?.FinalPrice ?? 0;
  const items = useMemo(() => bill?.items ?? bill?.Items ?? [], [bill]);

  useEffect(() => {
    if (!orderId) return;

    const user = getCurrentUser();
    if (!user) {
      const returnUrl = encodeURIComponent(
        `/orders/confirm?orderId=${orderId}`,
      );
      navigate(`/login?returnUrl=${returnUrl}`, { replace: true });
      return;
    }

    let active = true;

    Promise.all([getBill(orderId), getCustomerOrders().catch(() => [])])
      .then(([billData, orders]) => {
        if (!active) return;

        setError(null);
        setBillConfirmed(billConfirmedFromQr);
        setShowQr(false);
        setBill(billData as Bill);

        const currentOrder = orders.find(
          (order) => getCustomerOrderId(order) === orderId,
        );
        const currentStatus = currentOrder?.status?.trim().toLowerCase() ?? "";
        const persistedCashRequest = getPersistedCashRequest(orderId);

        if (currentStatus === "completed") {
          const cashPaymentKey = getCashPaymentStorageKey(orderId);

          if (cashPaymentKey && typeof window !== "undefined") {
            window.localStorage.removeItem(cashPaymentKey);
          }

          navigate("/check-in?success=1", { replace: true });
          return;
        }

        if (currentStatus === "cashpending") {
          setBillConfirmed(true);
          setCashRequested(true);
          return;
        }

        if (currentStatus === "billconfirmed") {
          setBillConfirmed(true);
          setCashRequested(persistedCashRequest);
          return;
        }

        setCashRequested(persistedCashRequest);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setError("Không thể tải hóa đơn. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [billConfirmedFromQr, orderId, navigate]);

  useEffect(() => {
    const cashPaymentKey = getCashPaymentStorageKey(orderId);

    if (!cashPaymentKey || typeof window === "undefined") {
      return;
    }

    if (cashRequested) {
      window.localStorage.setItem(cashPaymentKey, "1");
      return;
    }

    window.localStorage.removeItem(cashPaymentKey);
  }, [cashRequested, orderId]);

  useEffect(() => {
    if (!orderId || !cashRequested) return;

    let active = true;
    const timerId = window.setInterval(() => {
      void syncCashPaymentStatus();
    }, 4000);

    async function syncCashPaymentStatus() {
      const orders = await getCustomerOrders().catch(() => []);

      if (!active) return;

      const currentOrder = orders.find(
        (order) => getCustomerOrderId(order) === orderId,
      );
      const currentStatus = currentOrder?.status?.trim().toLowerCase() ?? "";

      if (currentStatus === "completed") {
        const cashPaymentKey = getCashPaymentStorageKey(orderId);

        if (cashPaymentKey && typeof window !== "undefined") {
          window.localStorage.removeItem(cashPaymentKey);
        }

        navigate("/check-in?success=1", { replace: true });
        return;
      }

      if (!currentStatus || currentStatus === "cashpending") {
        return;
      }

      const cashPaymentKey = getCashPaymentStorageKey(orderId);

      if (cashPaymentKey && typeof window !== "undefined") {
        window.localStorage.removeItem(cashPaymentKey);
      }

      setCashRequested(false);
      setError(
        "Đơn tiền mặt đã thay đổi trạng thái. Vui lòng tải lại hóa đơn.",
      );
    }

    void syncCashPaymentStatus();

    return () => {
      active = false;
      window.clearInterval(timerId);
    };
  }, [cashRequested, navigate, orderId]);

  async function handleConfirmBill() {
    if (!orderId) return;

    setSubmitting(true);
    setError(null);
    setShowQr(false);
    setCashRequested(false);

    try {
      await confirmBill(orderId);
      setBillConfirmed(true);
    } catch (err) {
      console.error(err);
      setBillConfirmed(false);
      setError(
        getServerMessage(err, "Xác nhận hóa đơn thất bại. Vui lòng thử lại."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getQrUrl() {
    const amount = Number(finalPrice || 0);
    const orderCode = String(billOrderId ?? "").replace(/-/g, "");
    const description = `UGem-${orderCode}`;

    return `https://qr.sepay.vn/img?acc=VQRQAIDAX4356&bank=MBBank&amount=${encodeURIComponent(String(Math.round(amount)))}&des=${encodeURIComponent(description)}&template=qronly`;
  }

  function handleStartPayment() {
    setError(null);

    if (method === "transfer") {
      setShowQr(true);
      setCashRequested(false);
      return;
    }

    setShowQr(false);
    void handleCashPaymentRequested();
  }

  async function handleCashPaymentRequested() {
    if (!orderId) return;

    setSubmitting(true);
    setError(null);

    try {
      await requestCashPayment(orderId);
      setCashRequested(true);
    } catch (err) {
      console.error(err);
      setError(
        getServerMessage(
          err,
          "Không thể gửi yêu cầu xác nhận tiền mặt. Vui lòng thử lại.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTransferPaymentCompleted() {
    if (!orderId) return;

    setSubmitting(true);
    setError(null);

    try {
      await confirmReceived(orderId);
      navigate("/check-in?success=1", { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        getServerMessage(
          err,
          "Không thể hoàn tất thanh toán/check-in. Vui lòng thử lại.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject(reason?: string) {
    if (!orderId) return;

    setSubmitting(true);
    setError(null);

    try {
      await rejectBill(orderId, reason ?? "");
      navigate(`/customer/orders/${orderId}`);
    } catch (err) {
      console.error(err);
      setError(
        getServerMessage(err, "Từ chối hóa đơn thất bại. Vui lòng thử lại."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold">Xác nhận hóa đơn</h1>

        {loading && <p>Đang tải hóa đơn...</p>}

        {error && (
          <div className="mb-4 rounded-md bg-rose-50 p-3 text-rose-700">
            {error}
          </div>
        )}

        {!loading && bill && (
          <section>
            <div className="mb-4">
              <div className="text-sm text-slate-600">Mã đơn</div>
              <div className="break-all font-mono font-semibold">
                {billOrderId}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-slate-600">Món đã gọi</div>
              <ul className="mt-2 space-y-2">
                {items.map((item, idx) => {
                  const name = item.name ?? item.Name ?? "Món ăn";
                  const quantity = item.quantity ?? item.Quantity ?? 0;
                  const subTotal = item.subTotal ?? item.SubTotal ?? 0;

                  return (
                    <li
                      key={`${name}-${idx}`}
                      className="flex justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium">{name}</div>
                        <div className="text-sm text-slate-500">
                          Số lượng: {quantity}
                        </div>
                      </div>
                      <div className="shrink-0 font-semibold">
                        {formatCurrency(subTotal)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-sm text-slate-600">Tổng</div>
              <div className="text-xl font-bold">
                {formatCurrency(finalPrice)}
              </div>
            </div>

            {!billConfirmed && (
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmBill}
                  className="flex-1 rounded-md bg-cyan-700 px-4 py-2 text-white disabled:cursor-wait disabled:opacity-60"
                >
                  {submitting ? "Đang gửi..." : "Xác nhận hóa đơn"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReject("Khác")}
                  className="rounded-md border px-4 py-2 disabled:cursor-wait disabled:opacity-60"
                >
                  Từ chối
                </button>
              </div>
            )}

            {billConfirmed && (
              <>
                <div className="mb-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Hóa đơn đã được xác nhận
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-2 text-sm text-slate-600">
                    Chọn phương thức thanh toán
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label
                      className={`cursor-pointer rounded-md border px-3 py-2 ${
                        method === "transfer"
                          ? "border-cyan-700 bg-cyan-50"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        className="mr-2"
                        type="radio"
                        name="method"
                        checked={method === "transfer"}
                        onChange={() => {
                          setMethod("transfer");
                          setCashRequested(false);
                        }}
                      />
                      Chuyển khoản (QR)
                    </label>
                    <label
                      className={`cursor-pointer rounded-md border px-3 py-2 ${
                        method === "cash"
                          ? "border-cyan-700 bg-cyan-50"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        className="mr-2"
                        type="radio"
                        name="method"
                        checked={method === "cash"}
                        onChange={() => {
                          setMethod("cash");
                          setShowQr(false);
                        }}
                      />
                      Tiền mặt
                    </label>
                  </div>
                </div>

                {method === "transfer" && (
                  <div className="mb-4 rounded-md border bg-amber-50 p-3">
                    <div className="mb-2 font-medium">
                      Thanh toán chuyển khoản
                    </div>
                    <div className="text-sm text-slate-700">
                      Tạo mã QR chuyển khoản ngân hàng. Sau khi chuyển xong, bấm
                      Đã chuyển khoản để hoàn tất check-in.
                    </div>
                  </div>
                )}

                {method === "cash" && (
                  <div className="mb-4 rounded-md border bg-amber-50 p-3">
                    <div className="mb-2 font-medium">Thanh toán tiền mặt</div>
                    <div className="text-sm text-slate-700">
                      Vui lòng thanh toán trực tiếp tại quán. Sau khi đã thanh
                      toán, bấm Đã thanh toán tiền mặt để hoàn tất check-in.
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      method === "transfer"
                        ? handleStartPayment()
                        : void handleCashPaymentRequested()
                    }
                    disabled={submitting}
                    className="flex-1 rounded-md bg-cyan-700 px-4 py-2 text-white disabled:cursor-wait disabled:opacity-60"
                  >
                    {method === "transfer"
                      ? "Tạo mã QR thanh toán"
                      : cashRequested
                        ? "Đang chờ merchant xác nhận"
                        : "Đã thanh toán tiền mặt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/customer/orders/${orderId}`)}
                    className="rounded-md border px-4 py-2"
                  >
                    Quay lại
                  </button>
                </div>

                {showQr && method === "transfer" && (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <div className="mb-3 flex items-center justify-center gap-2 font-semibold">
                      <QrCode className="h-5 w-5 text-cyan-700" />
                      Mã QR thanh toán
                    </div>
                    <img
                      src={getQrUrl()}
                      alt="Mã QR thanh toán"
                      className="mx-auto h-64 w-64 max-w-full object-contain"
                    />
                    <div className="mt-3 text-sm text-slate-600">
                      Số tiền:{" "}
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(finalPrice)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mt-4 w-full rounded-md bg-cyan-700 px-4 py-2 text-white disabled:cursor-wait disabled:opacity-60"
                      disabled={submitting}
                      onClick={() => void handleTransferPaymentCompleted()}
                    >
                      {submitting ? "Đang hoàn tất..." : "Đã chuyển khoản"}
                    </button>
                  </div>
                )}

                {cashRequested && method === "cash" && (
                  <div className="mt-5 rounded-md border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-800">
                    Đã ghi nhận thanh toán tiền mặt. Đang chờ merchant xác nhận
                    để hoàn tất check-in.
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
