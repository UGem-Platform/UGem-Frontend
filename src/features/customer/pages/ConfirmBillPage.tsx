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

        const billPaymentMethod = (
          ((billData as Bill)?.paymentMethod ?? (billData as Bill)?.PaymentMethod) ||
          ""
        )
          .trim()
          .toLowerCase();

        if (billPaymentMethod === "cash") {
          setMethod("cash");
        }

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
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_32%),linear-gradient(135deg,#ecfeff_0%,#f8fafc_46%,#fff7ed_100%)] px-4 py-8 text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none fixed left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-xl overflow-hidden rounded-[36px] border border-white/50 bg-white/60 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_8px_40px_0_rgba(31,38,135,0.12)]">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl mix-blend-multiply" />
        <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl mix-blend-multiply" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/50 bg-gradient-to-r from-cyan-50/80 to-blue-50/80 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700 ring-1 ring-cyan-500/10">
            Payment & Check-in
          </div>
          <h1 className="mb-6 text-3xl font-black tracking-tight text-slate-900 leading-[1.15]">Xác nhận hóa đơn</h1>

          {loading && <p className="text-slate-500 font-medium">Đang tải hóa đơn...</p>}

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200/60 bg-rose-50/80 p-4 text-sm font-semibold text-rose-700 shadow-sm backdrop-blur">
              {error}
            </div>
          )}

          {!loading && bill && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-white/60 bg-white/50 p-5 shadow-sm backdrop-blur">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Mã đơn</div>
                <div className="mt-1 break-all font-mono text-[15px] font-black text-cyan-800">
                  {billOrderId}
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/50 p-5 shadow-sm backdrop-blur">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Món đã gọi</div>
                <ul className="space-y-3">
                  {items.map((item, idx) => {
                    const name = item.name ?? item.Name ?? "Món ăn";
                    const quantity = item.quantity ?? item.Quantity ?? 0;
                    const subTotal = item.subTotal ?? item.SubTotal ?? 0;

                    return (
                      <li
                        key={`${name}-${idx}`}
                        className="flex items-center justify-between gap-3 border-b border-slate-200/50 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <div className="text-[15px] font-bold text-slate-800">{name}</div>
                          <div className="text-[13px] font-medium text-slate-500 mt-0.5">
                            Số lượng: <span className="font-bold text-slate-700">{quantity}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-[15px] font-black text-slate-900">
                          {formatCurrency(subTotal)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-200/50 bg-gradient-to-r from-cyan-50/80 to-blue-50/80 p-5 shadow-sm">
                <div className="text-[13px] font-black uppercase tracking-[0.18em] text-cyan-800">Tổng thanh toán</div>
                <div className="text-2xl font-black text-cyan-700">
                  {formatCurrency(finalPrice)}
                </div>
              </div>

            {!billConfirmed && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmBill}
                  className="flex-1 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 px-5 py-3.5 text-[15px] font-black text-white shadow-lg shadow-cyan-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-900/30 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting ? "Đang gửi..." : "Xác nhận hóa đơn"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReject("Khác")}
                  className="rounded-xl border border-rose-200/60 bg-white/70 px-6 py-3.5 text-[15px] font-bold text-rose-600 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-md hover:border-rose-300 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  Từ chối
                </button>
              </div>
            )}

            {billConfirmed && (
              <>
                <div className="mb-6 rounded-2xl border border-emerald-200/60 bg-emerald-50/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2.5 font-bold text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    Hóa đơn đã được xác nhận
                  </div>
                </div>

                <div className="mb-6">
                  <div className="mb-3 text-[13px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Chọn phương thức thanh toán
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label
                      className={`group relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                        method === "transfer"
                          ? "border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm"
                          : "border-white/60 bg-white/50 text-slate-600 hover:border-cyan-300 hover:bg-white/80"
                      }`}
                    >
                      <input
                        className="peer sr-only"
                        type="radio"
                        name="method"
                        checked={method === "transfer"}
                        onChange={() => {
                          setMethod("transfer");
                          setCashRequested(false);
                        }}
                      />
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${method === 'transfer' ? 'border-cyan-600' : 'border-slate-400 group-hover:border-cyan-400'}`}>
                        {method === 'transfer' && <div className="h-2 w-2 rounded-full bg-cyan-600" />}
                      </div>
                      Chuyển khoản (QR)
                    </label>
                    <label
                      className={`group relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                        method === "cash"
                          ? "border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm"
                          : "border-white/60 bg-white/50 text-slate-600 hover:border-cyan-300 hover:bg-white/80"
                      }`}
                    >
                      <input
                        className="peer sr-only"
                        type="radio"
                        name="method"
                        checked={method === "cash"}
                        onChange={() => {
                          setMethod("cash");
                          setShowQr(false);
                        }}
                      />
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${method === 'cash' ? 'border-cyan-600' : 'border-slate-400 group-hover:border-cyan-400'}`}>
                        {method === 'cash' && <div className="h-2 w-2 rounded-full bg-cyan-600" />}
                      </div>
                      Tiền mặt
                    </label>
                  </div>
                </div>

                {method === "transfer" && (
                  <div className="mb-6 rounded-2xl border border-amber-200/60 bg-amber-50/80 p-4 shadow-sm backdrop-blur">
                    <div className="mb-2 font-bold text-amber-800">
                      Thanh toán chuyển khoản
                    </div>
                    <div className="text-[13px] font-medium leading-relaxed text-amber-700/80">
                      Tạo mã QR chuyển khoản ngân hàng. Sau khi chuyển xong, bấm
                      Đã chuyển khoản để hoàn tất check-in.
                    </div>
                  </div>
                )}

                {method === "cash" && (
                  <div className="mb-6 rounded-2xl border border-amber-200/60 bg-amber-50/80 p-4 shadow-sm backdrop-blur">
                    <div className="mb-2 font-bold text-amber-800">Thanh toán tiền mặt</div>
                    <div className="text-[13px] font-medium leading-relaxed text-amber-700/80">
                      Vui lòng thanh toán trực tiếp tại quán. Sau khi đã thanh
                      toán, bấm Đã thanh toán tiền mặt để hoàn tất check-in.
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      method === "transfer"
                        ? handleStartPayment()
                        : void handleCashPaymentRequested()
                    }
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 px-5 py-3.5 text-[15px] font-black text-white shadow-lg shadow-cyan-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-900/30 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
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
                    className="rounded-xl border border-slate-200/60 bg-white/70 px-6 py-3.5 text-[15px] font-bold text-slate-600 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md hover:border-slate-300"
                  >
                    Quay lại
                  </button>
                </div>

                {showQr && method === "transfer" && (
                  <div className="mt-8 rounded-3xl border border-white/60 bg-white/80 p-6 text-center shadow-xl shadow-slate-950/5 ring-1 ring-slate-950/5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-center gap-2 text-lg font-black text-cyan-800">
                      <QrCode className="h-6 w-6" />
                      Mã QR thanh toán
                    </div>
                    <div className="mx-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100 max-w-fit">
                      <img
                        src={getQrUrl()}
                        alt="Mã QR thanh toán"
                        className="h-64 w-64 max-w-full object-contain"
                      />
                    </div>
                    <div className="mt-4 text-[15px] font-medium text-slate-500">
                      Số tiền:{" "}
                      <span className="font-black text-cyan-700 text-lg">
                        {formatCurrency(finalPrice)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mt-6 w-full rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-3.5 text-[15px] font-black text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/30 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
                      disabled={submitting}
                      onClick={() => void handleTransferPaymentCompleted()}
                    >
                      {submitting ? "Đang hoàn tất..." : "Đã chuyển khoản"}
                    </button>
                  </div>
                )}

                {cashRequested && method === "cash" && (
                  <div className="mt-8 rounded-2xl border border-cyan-200/60 bg-cyan-50/80 p-4 text-[14px] font-semibold text-cyan-800 shadow-sm backdrop-blur">
                    Đã ghi nhận thanh toán tiền mặt. Đang chờ merchant xác nhận
                    để hoàn tất check-in.
                  </div>
                )}
              </>
            )}
          </section>
        )}
        </div>
      </div>
    </main>
  );
}
