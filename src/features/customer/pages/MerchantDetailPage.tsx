import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getReviewsByMerchantId, type Review } from "@/features/review/services";
import { getMerchantDetail } from "../services/merchantService";
import type { MerchantDetail, MerchantMenuItem } from "../types";
import { addWishlist } from "../services/wishlistService";
import { createOrder } from "../services/orderService";
import { notify } from "@/shared/lib/notify";

type CartItem = {
  food: MerchantMenuItem;
  quantity: number;
};

function getReviewContent(review: Review) {
  return review.content || review.comment || review.description || "";
}

export default function MerchantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  }, [cart]);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      try {
        const [merchantData, reviewData] = await Promise.all([
          getMerchantDetail(id!),
          getReviewsByMerchantId(id!),
        ]);

        setMerchant(merchantData);
        setReviews(reviewData);
      } catch (error) {
        console.error(error);
        notify.error("Không tải được chi tiết quán.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id]);

  async function handleCreateOrder() {
    if (!merchant?.id || cart.length === 0) return;

    setOrdering(true);

    try {
      await createOrder({
        name: `Order from ${merchant.name || "Unnamed merchant"}`,
        deliveryAddress: merchant.address || "No address",
        notes: "",
        finalPrice: total,
        foods: cart.map((item) => ({
          foodId: item.food.id,
          quantity: item.quantity,
        })),
      });

      notify.success("Đặt món thành công.");
      navigate("/customer/orders");
    } catch (error) {
      console.error(error);
      notify.error("Đặt món thất bại.");
    } finally {
      setOrdering(false);
    }
  }

  function addToCart(food: MerchantMenuItem) {
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
      notify.success("Đã thêm vào yêu thích.");
    } catch (error) {
      console.error(error);
      notify.error("Thêm wishlist thất bại.");
    }
  }

  if (loading) return <div className="p-5">Đang tải...</div>;
  if (!merchant) return <div className="p-5">Không tìm thấy quán.</div>;

  const name = merchant.name || "Unnamed merchant";
  const menuItems = merchant.menu || merchant.foods || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>

              {merchant.address && (
                <p className="mt-1 text-sm text-slate-500">
                  {merchant.address}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => void handleAddWishlist()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-100 text-cyan-700 hover:bg-cyan-50"
              aria-label="Thêm yêu thích"
            >
              <Heart size={18} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
            {typeof merchant.rating === "number" && (
              <span className="inline-flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {merchant.rating}
              </span>
            )}
            {merchant.phone && <span>{merchant.phone}</span>}
            {merchant.email && <span>{merchant.email}</span>}
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
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex min-w-0 gap-3">
                {food.imageUrl && (
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                )}

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{food.name}</h3>

                  {food.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {food.description}
                    </p>
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
              </div>

              <button
                type="button"
                onClick={() => addToCart(food)}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700"
              >
                <ShoppingCart size={16} />
                Thêm
              </button>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-lg font-semibold">Đánh giá</h2>

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review, index) => (
                <div
                  key={review.id || `${review.createdAt}-${index}`}
                  className="rounded-xl border border-slate-100 bg-white p-3"
                >
                  <div className="mb-1 flex items-center gap-1 text-amber-500">
                    {Array.from({ length: review.rating || 0 }).map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  <p className="text-sm text-slate-700">
                    {getReviewContent(review) || "Không có nội dung."}
                  </p>

                  {review.createdAt ? (
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleString("vi-VN")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chưa có đánh giá.</p>
          )}
        </section>

        {cart.length > 0 && (
          <div className="sticky bottom-4 mt-6 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{cart.length} món trong giỏ</p>
                <p className="font-bold text-cyan-700">
                  {total.toLocaleString("vi-VN")}đ
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleCreateOrder()}
                disabled={ordering}
                className="rounded-xl bg-cyan-600 px-5 py-3 text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                {ordering ? "Đang đặt..." : "Đặt món"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
