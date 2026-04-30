import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  confirmNotReceived,
  confirmReceived,
  getCustomerOrderDetail,
} from "../services/orderService";

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!id) return;

    setLoading(true);

    try {
      const data = await getCustomerOrderDetail(id);
      setItems(data || []);
    } catch (error) {
      console.error(error);
      alert("Không tải được chi tiết đơn.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReceived() {
    if (!id) return;

    try {
      await confirmReceived(id);
      alert("Đã xác nhận nhận hàng.");
      load();
    } catch (error) {
      console.error(error);
      alert("Xác nhận thất bại.");
    }
  }

  async function handleConfirmNotReceived() {
    if (!id) return;

    try {
      await confirmNotReceived(id);
      alert("Đã báo chưa nhận hàng.");
      load();
    } catch (error) {
      console.error(error);
      alert("Gửi báo cáo thất bại.");
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const total = items.reduce((sum, item) => {
    return sum + Number(item.unitPrice || 0) * Number(item.quantity || 0);
  }, 0);

  if (loading) return <div className="p-5">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">Đơn #{id}</h1>

          <p className="mt-3 text-xl font-bold text-blue-600">
            {total.toLocaleString("vi-VN")}đ
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Món đã đặt</h2>

          {items.map((item) => (
            <div
              key={`${item.foodId}-${item.orderId}`}
              className="flex justify-between border-b py-3"
            >
              <div>
                <p className="font-medium">{item.name || "Món ăn"}</p>
                <p className="text-sm text-gray-500">
                  Số lượng: {item.quantity}
                </p>
              </div>

              <p>{Number(item.unitPrice || 0).toLocaleString("vi-VN")}đ</p>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-gray-500">Không có món nào trong đơn.</p>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={handleConfirmReceived}
            className="rounded-xl bg-green-600 px-5 py-3 text-white"
          >
            Đã nhận hàng
          </button>

          <button
            onClick={handleConfirmNotReceived}
            className="rounded-xl bg-red-600 px-5 py-3 text-white"
          >
            Chưa nhận được
          </button>
        </div>
      </div>
    </div>
  );
}
