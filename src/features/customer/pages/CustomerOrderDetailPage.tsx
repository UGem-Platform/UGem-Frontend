import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  confirmNotReceived,
  confirmReceived,
  getCustomerOrderDetail,
} from "../services/orderService";
import type { CustomerOrderDetailItem } from "@/shared/types";
import { notify } from "@/shared/lib/notify";

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [items, setItems] = useState<CustomerOrderDetailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const data = await getCustomerOrderDetail(id);

        if (active) {
          setItems(data ?? []);
        }
      } catch (error) {
        console.error(error);
        notify.error("Không tải được chi tiết đơn.");
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
  }, [id]);

  async function handleConfirmReceived() {
    if (!id) return;

    setUpdatingStatus(true);

    try {
      await confirmReceived(id);
      notify.success("Đã xác nhận đã nhận hàng.");
    } catch (error) {
      console.error(error);
      notify.error("Xác nhận đơn thất bại.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleConfirmNotReceived() {
    if (!id) return;

    setUpdatingStatus(true);

    try {
      await confirmNotReceived(id);
      notify.success("Đã báo chưa nhận hàng.");
    } catch (error) {
      console.error(error);
      notify.error("Cập nhật đơn thất bại.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  const total = items.reduce((sum, item) => {
    return sum + Number(item.unitPrice || 0) * Number(item.quantity || 0);
  }, 0);

  if (loading) return <div className="p-5">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-cyan-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-bold">Đơn #{id}</h1>

          <p className="mt-3 text-xl font-bold text-cyan-700">
            {total.toLocaleString("vi-VN")}đ
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleConfirmReceived()}
              disabled={updatingStatus}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Check size={16} />
              Đã nhận hàng
            </button>

            <button
              type="button"
              onClick={() => void handleConfirmNotReceived()}
              disabled={updatingStatus}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              <X size={16} />
              Chưa nhận hàng
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-lg font-semibold">Món đã đặt</h2>

          {items.map((item) => (
            <div
              key={`${item.foodId}-${item.orderId}`}
              className="flex justify-between border-b py-3"
            >
              <div>
                <p className="font-medium">{item.name || "Món ăn"}</p>
                <p className="text-sm text-slate-500">
                  Số lượng: {item.quantity}
                </p>
              </div>

              <p>{Number(item.unitPrice || 0).toLocaleString("vi-VN")}đ</p>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-slate-500">Không có món nào trong đơn.</p>
          )}
        </div>
      </div>
    </div>
  );
}
