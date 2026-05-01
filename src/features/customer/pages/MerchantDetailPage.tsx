import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMerchantDetail } from "../services/merchantService";
import type { Food, MerchantDetail } from "../types";
import { addWishlist } from "../services/wishlistService";
import { createOrder } from "../services/orderService";
import { useNavigate } from "react-router-dom";
type CartItem = {
  food: Food;
  quantity: number;
};

export default function MerchantDetailPage() {
  const { id } = useParams();
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  }, [cart]);

  async function handleCreateOrder() {
    if (!merchant?.id) return;

    try {
      await createOrder({
        name: `Order from ${name}`,
        deliveryAddress: merchant.address || "No address",
        notes: "",
        finalPrice: total,
        foods: cart.map((item) => ({
          foodId: item.food.id,
          quantity: item.quantity,
        })),
      });

      alert("Đặt món thành công.");
      navigate("/customer/orders");
    } catch (error) {
      console.error(error);
      alert("Đặt món thất bại.");
    }
  }
  function addToCart(food: Food) {
    setCart((prev) => {
      const existed = prev.find((item) => item.food.id === food.id);

      if (existed) {
        return prev.map((item) =>
          item.food.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prev, { food, quantity: 1 }];
    });
  }
  async function handleAddWishlist() {
    if (!merchant?.id) return;

    try {
      await addWishlist(merchant.id);
      alert("Đã thêm vào yêu thích.");
    } catch (error) {
      console.error(error);
      alert("Thêm wishlist thất bại.");
    }
  }

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      try {
        const data = await getMerchantDetail(id!);
        setMerchant(data);
      } catch (error) {
        console.error(error);
        alert("Không tải được chi tiết quán.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) return <div className="p-5">Đang tải...</div>;
  if (!merchant) return <div className="p-5">Không tìm thấy quán.</div>;

  const name = merchant.name || merchant.merchantName || "Unnamed merchant";
  const menuItems = merchant.menu || merchant.foods || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-bold">{name}</h1>

          {merchant.address && (
            <p className="mt-1 text-sm text-slate-500">{merchant.address}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
            {typeof merchant.rating === "number" && (
              <span>⭐ {merchant.rating}</span>
            )}
            {merchant.phone && <span>📞 {merchant.phone}</span>}
            {merchant.email && <span>✉️ {merchant.email}</span>}
          </div>

          {merchant.description && (
            <p className="mt-3 text-slate-700">{merchant.description}</p>
          )}
        </div>

        <h2 className="mt-6 mb-3 text-lg font-semibold">Menu</h2>

        <div className="space-y-3">
          {menuItems.map((food) => (
            <div
              key={food.id}
              className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
            >
              <div>
                <h3 className="font-semibold">{food.name}</h3>

                {food.description && (
                  <p className="text-sm text-slate-500">{food.description}</p>
                )}

                {food.categoryDetail?.length ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Danh mục: {food.categoryDetail.join(", ")}
                  </p>
                ) : null}

                <p className="mt-1 font-medium text-cyan-700">
                  {food.price.toLocaleString("vi-VN")}đ
                </p>
              </div>

              <button
                onClick={() => addToCart(food)}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700"
              >
                Thêm
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="sticky bottom-4 mt-6 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{cart.length} món trong giỏ</p>
                <p className="font-bold text-cyan-700">
                  {total.toLocaleString("vi-VN")}đ
                </p>
              </div>

              <button
                onClick={handleCreateOrder}
                className="rounded-xl bg-cyan-600 px-5 py-3 text-white hover:bg-cyan-700"
              >
                Đặt món
              </button>
              <button
                onClick={handleAddWishlist}
                className="mt-4 rounded-xl border border-cyan-600 px-4 py-2 text-cyan-700"
              >
                Thêm vào yêu thích
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
