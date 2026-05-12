import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "@/features/auth";
import {
  getBill,
  confirmBill,
  rejectBill,
} from "@/features/customer/services/orderService";

export default function ConfirmBillPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId") ?? searchParams.get("OrderId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bill, setBill] = useState<any>(null);
  const [method, setMethod] = useState<"transfer" | "cash">("transfer");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("Mã đơn hàng không hợp lệ.");
      setLoading(false);
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      const returnUrl = encodeURIComponent(
        `/orders/confirm?orderId=${orderId}`,
      );
      navigate(`/login?returnUrl=${returnUrl}`, { replace: true });
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getBill(orderId as string)
      .then((data) => {
        if (!active) return;
        setBill(data);
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
  }, [orderId, navigate]);

  async function handleConfirm() {
    if (!orderId) return;
    setSubmitting(true);
    try {
      await confirmBill(orderId);
      // show simple feedback then redirect to orders page
      navigate(`/customer/orders/${orderId}`);
    } catch (err) {
      console.error(err);
      setError("Xác nhận hóa đơn thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject(reason?: string) {
    if (!orderId) return;
    setSubmitting(true);
    try {
      await rejectBill(orderId, reason ?? "");
      navigate(`/customer/orders/${orderId}`);
    } catch (err) {
      console.error(err);
      setError("Từ chối hóa đơn thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold">Xác nhận hóa đơn</h1>

        {loading && <p>Đang tải hóa đơn…</p>}

        {error && (
          <div className="mb-4 rounded-md bg-rose-50 p-3 text-rose-700">
            {error}
          </div>
        )}

        {!loading && bill && (
          <section>
            <div className="mb-4">
              <div className="text-sm text-slate-600">Mã đơn</div>
              <div className="font-mono font-semibold">
                {bill.orderId ?? bill.OrderId ?? orderId}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-slate-600">Món đã gọi</div>
              <ul className="mt-2 space-y-2">
                {(bill.items ?? bill.Items ?? []).map(
                  (it: any, idx: number) => (
                    <li key={idx} className="flex justify-between">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-sm text-slate-500">
                          Số lượng: {it.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {(it.subTotal ?? it.SubTotal ?? 0).toLocaleString()} đ
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">Tổng</div>
              <div className="text-xl font-bold">
                {(bill.finalPrice ?? bill.FinalPrice ?? 0).toLocaleString()} đ
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-sm text-slate-600">
                Chọn phương thức thanh toán
              </div>
              <div className="flex gap-3">
                <label
                  className={`cursor-pointer rounded-md border px-3 py-2 ${method === "transfer" ? "border-cyan-700 bg-cyan-50" : "border-slate-200"}`}
                >
                  <input
                    className="mr-2"
                    type="radio"
                    name="method"
                    checked={method === "transfer"}
                    onChange={() => setMethod("transfer")}
                  />
                  Chuyển khoản (QR)
                </label>
                <label
                  className={`cursor-pointer rounded-md border px-3 py-2 ${method === "cash" ? "border-cyan-700 bg-cyan-50" : "border-slate-200"}`}
                >
                  <input
                    className="mr-2"
                    type="radio"
                    name="method"
                    checked={method === "cash"}
                    onChange={() => setMethod("cash")}
                  />
                  Tiền mặt
                </label>
              </div>
            </div>

            {method === "transfer" && (
              <div className="mb-4 rounded-md border bg-amber-50 p-3">
                <div className="mb-2 font-medium">Hướng dẫn chuyển khoản</div>
                <div className="text-sm text-slate-700">
                  Vui lòng chuyển tiền theo hướng dẫn của quán (mã QR hoặc số
                  tài khoản). Sau khi chuyển, nhấn "Đã chuyển khoản" để thông
                  báo cho quán.
                </div>
              </div>
            )}

            {method === "cash" && (
              <div className="mb-4 rounded-md border bg-amber-50 p-3">
                <div className="mb-2 font-medium">Thanh toán tiền mặt</div>
                <div className="text-sm text-slate-700">
                  Chọn tiền mặt để thanh toán trực tiếp tại quán. Sau khi thanh
                  toán, quán sẽ xác thực và cập nhật trạng thái.
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                disabled={submitting}
                onClick={handleConfirm}
                className="flex-1 rounded-md bg-cyan-700 px-4 py-2 text-white"
              >
                {submitting
                  ? "Đang gửi…"
                  : method === "transfer"
                    ? "Đã chuyển khoản"
                    : "Yêu cầu xác thực tiền mặt"}
              </button>
              <button
                disabled={submitting}
                onClick={() => handleReject("Khác")}
                className="rounded-md border px-4 py-2"
              >
                Từ chối
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
