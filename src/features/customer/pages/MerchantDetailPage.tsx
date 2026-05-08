import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Heart,
  Minus,
  ShoppingCart,
  Star,
  MapPin,
  Phone,
  Mail,
  Flame,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getReviewsByMerchantId,
  type Review,
} from "@/features/review/services";

import { getMerchantDetail } from "../services/merchantService";

import type { MerchantDetail, MerchantMenuItem } from "../types";

import { addWishlist } from "../services/wishlistService";
import { createOrder } from "../services/orderService";
import { notify } from "@/shared/lib/notify";

type CartItem = {
  food: MerchantMenuItem;
  quantity: number;
};

const DESCRIPTION_META_LABELS = [
  "Địa chỉ",
  "Loại hình quán",
  "Loại món chính",
  "Khoảng giá trung bình",
];

function getReviewContent(review: Review) {
  return review.content || review.comment || review.description || "";
}

function getReviewAuthorName(review: Review) {
  return review.customerName || review.CustomerName || "Khách hàng UGem";
}

function getReviewAuthorAvatarUrl(review: Review) {
  return review.customerAvatarUrl || review.CustomerAvatarUrl || "";
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "UG"
  );
}

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")}đ`;
}

function parseMerchantDescription(description?: string) {
  const lines = (description || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const markerIndex = lines.findIndex((line) =>
    line.toLowerCase().includes("thông tin ui bổ sung"),
  );

  const isMetaLine = (line: string) =>
    DESCRIPTION_META_LABELS.some((label) =>
      line.toLowerCase().startsWith(`${label.toLowerCase()}:`),
    );

  const isUiMarkerLine = (line: string) =>
    line.toLowerCase().includes("thông tin ui bổ sung");

  const summaryLines =
    markerIndex >= 0
      ? lines.slice(0, markerIndex)
      : lines.filter((line) => !isMetaLine(line) && !isUiMarkerLine(line));

  const metaLines =
    markerIndex >= 0
      ? lines.slice(markerIndex + 1)
      : lines.filter((line) => isMetaLine(line));

  const facts = metaLines
    .map((line) => {
      const [label, ...valueParts] = line.split(":");
      return {
        label: label.trim(),
        value: valueParts.join(":").trim(),
      };
    })
    .filter((item) => item.label && item.value);

  return {
    summary: summaryLines.join("\n").trim(),
    facts,
  };
}

function formatRating(value: number) {
  return value.toFixed(2);
}

function getCartQuantity(cart: CartItem[], foodId: string) {
  return cart.find((item) => item.food.id === foodId)?.quantity ?? 0;
}

export default function MerchantDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const reviewSectionRef = useRef<HTMLElement | null>(null);

  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [pendingFood, setPendingFood] = useState<MerchantMenuItem | null>(null);

  const [pendingQuantity, setPendingQuantity] = useState(1);

  const [showReviews, setShowReviews] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [ordering, setOrdering] = useState(false);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
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

      setCart([]);
      setCartOpen(false);
      navigate("/customer/orders");
    } catch (error) {
      console.error(error);
      notify.error("Đặt món thất bại.");
    } finally {
      setOrdering(false);
    }
  }

  function addToCart(food: MerchantMenuItem, quantity: number = 1) {
    const nextQuantity = Math.max(1, Math.min(99, Math.floor(quantity || 1)));

    setCart((prev) => {
      const existed = prev.find((item) => item.food.id === food.id);

      if (existed) {
        return prev.map((item) =>
          item.food.id === food.id
            ? {
                ...item,
                quantity: Math.min(99, item.quantity + nextQuantity),
              }
            : item,
        );
      }

      return [...prev, { food, quantity: nextQuantity }];
    });
  }

  function updateCartQuantity(foodId: string, quantity: number) {
    const nextQuantity = Math.max(1, Math.min(99, Math.floor(quantity || 1)));

    setCart((prev) =>
      prev.map((item) =>
        item.food.id === foodId ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  }

  function incrementCartItem(foodId: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.food.id === foodId
          ? { ...item, quantity: Math.min(99, item.quantity + 1) }
          : item,
      ),
    );
  }

  function decrementCartItem(foodId: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.food.id === foodId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    );
  }

  function removeCartItem(foodId: string) {
    setCart((prev) => prev.filter((item) => item.food.id !== foodId));
  }

  function clearCart() {
    setCart([]);
    setCartOpen(false);
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

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/customer");
  }

  useEffect(() => {
    if (!showReviews) return;

    reviewSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [showReviews]);

  function openAddFoodModal(food: MerchantMenuItem) {
    setPendingFood(food);
    setPendingQuantity(1);
  }

  function closeAddFoodModal() {
    setPendingFood(null);
    setPendingQuantity(1);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.14),transparent_34%),linear-gradient(135deg,#ecfeff_0%,#f8fafc_46%,#fff7ed_100%)] p-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="h-72 animate-pulse rounded-4xl bg-white/70 shadow-2xl" />

          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-3xl bg-white/70 shadow-xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#ecfeff_0%,#f8fafc_46%,#fff7ed_100%)] px-6 text-center">
        <div className="rounded-4xl border border-white/70 bg-white/80 p-10 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl">
          <h2 className="text-2xl font-black text-slate-950">
            Không tìm thấy quán
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Merchant này có thể đã bị xoá hoặc không tồn tại.
          </p>
        </div>
      </div>
    );
  }

  const name = merchant.name || "Unnamed merchant";

  const menuItems = merchant.menu || merchant.foods || [];
  const descriptionInfo = parseMerchantDescription(merchant.description);
  const visibleFacts = descriptionInfo.facts.filter(
    (item) => item.label.toLowerCase() !== "địa chỉ",
  );
  const reviewCount = reviews.length;
  const reviewAverage =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        reviewCount
      : null;
  const displayRating =
    reviewAverage && reviewAverage > 0
      ? reviewAverage
      : typeof merchant.rating === "number" && merchant.rating > 0
        ? merchant.rating
        : null;

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_32%),linear-gradient(135deg,#ecfeff_0%,#f8fafc_46%,#fff7ed_100%)] px-4 pt-6 text-slate-950 ${
        cart.length > 0 ? "pb-28" : "pb-6"
      }`}
    >
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-size-[32px_32px]" />

      <div className="relative mx-auto max-w-6xl">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex h-11 items-center gap-2 rounded-lg border border-white/80 bg-white/85 px-4 text-sm font-black text-slate-700 shadow-lg shadow-slate-950/5 ring-1 ring-slate-950/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-cyan-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* hero */}
        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/75 shadow-2xl shadow-cyan-950/10 ring-1 ring-slate-950/5 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%)]" />

          <div className="relative grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700 shadow-sm">
                Featured Merchant
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                {name}
              </h1>

              {merchant.address && (
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <MapPin className="h-4 w-4 text-cyan-700" />
                  {merchant.address}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviews(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-sm font-black text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
                >
                  <Star
                    className={
                      displayRating
                        ? "h-4 w-4 fill-amber-400 text-amber-400"
                        : "h-4 w-4 text-amber-400"
                    }
                  />
                  {displayRating
                    ? `Đánh giá ${formatRating(displayRating)} sao${reviewCount > 0 ? ` (${reviewCount} đánh giá)` : ""}`
                    : "Chưa có đánh giá"}
                </button>

                {merchant.phone && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-950/5">
                    <Phone className="h-4 w-4 text-cyan-700" />
                    {merchant.phone}
                  </span>
                )}

                {merchant.email && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-950/5">
                    <Mail className="h-4 w-4 text-cyan-700" />
                    {merchant.email}
                  </span>
                )}
              </div>

              {descriptionInfo.summary && (
                <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-600">
                  {descriptionInfo.summary}
                </p>
              )}

              {visibleFacts.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {visibleFacts.map((item) => (
                    <span
                      key={`${item.label}-${item.value}`}
                      className="inline-flex items-center rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-xs font-bold text-cyan-800"
                    >
                      {item.value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-start justify-end gap-3">
              <button
                type="button"
                onClick={() => void handleAddWishlist()}
                className="group inline-flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-5 py-3 text-sm font-black text-cyan-700 shadow-lg shadow-slate-950/5 ring-1 ring-slate-950/5 transition-all hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                <Heart className="h-5 w-5 transition group-hover:scale-110" />
                Thêm yêu thích
              </button>
            </div>
          </div>
        </section>

        {/* menu */}
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
                Signature Menu
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Menu nổi bật
              </h2>
            </div>
          </div>

          {menuItems.length > 0 ? (
            <div
              className={
                menuItems.length === 1
                  ? "grid gap-4"
                  : "grid gap-4 lg:grid-cols-2"
              }
            >
              {menuItems.map((food) => (
                <div
                  key={food.id}
                  className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-950/5 ring-1 ring-slate-950/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/10"
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl opacity-0 transition group-hover:opacity-100" />

                  <div className="relative flex gap-4">
                    {food.imageUrl ? (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-md"
                      />
                    ) : (
                      <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#cffafe,#f8fafc,#fef3c7)] text-cyan-800 shadow-md">
                        <Flame className="h-8 w-8" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-lg font-black text-slate-950">
                        {food.name}
                      </h3>

                      {food.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                          {food.description}
                        </p>
                      )}

                      {food.categoryDetail?.length ? (
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          Danh mục: {food.categoryDetail.join(", ")}
                        </p>
                      ) : null}

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-cyan-700">
                            {formatPrice(food.price)}
                          </p>
                          {getCartQuantity(cart, food.id) > 0 && (
                            <p className="mt-1 text-xs font-black text-emerald-600">
                              {getCartQuantity(cart, food.id)} trong đơn
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => openAddFoodModal(food)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:bg-cyan-700"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Thêm món
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-amber-200 bg-white/75 p-8 text-center shadow-xl shadow-slate-950/5">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                <Flame className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-950">
                Quán chưa cập nhật menu
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Khi merchant bổ sung món ăn, menu sẽ hiển thị tại đây.
              </p>
            </div>
          )}
        </section>

        {showReviews && (
          <section
            ref={reviewSectionRef}
            id="review-section"
            className="mt-8 overflow-hidden rounded-4xl border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-950/5 ring-1 ring-slate-950/5 backdrop-blur-2xl"
          >
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700">
                Community Reviews
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Đánh giá khách hàng
              </h2>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div
                    key={review.id || `${review.createdAt}-${index}`}
                    className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm ring-1 ring-slate-950/5"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-cyan-100 text-xs font-black text-cyan-800 ring-1 ring-cyan-200">
                        {getReviewAuthorAvatarUrl(review) ? (
                          <img
                            src={getReviewAuthorAvatarUrl(review)}
                            alt={getReviewAuthorName(review)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(getReviewAuthorName(review))
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950">
                          {getReviewAuthorName(review)}
                        </p>
                        {review.createdAt ? (
                          <p className="text-xs font-semibold text-slate-400">
                            {new Date(review.createdAt).toLocaleString("vi-VN")}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {review.rating && review.rating > 0 ? (
                      <div className="mb-3 flex items-center gap-1 text-amber-500">
                        {Array.from({
                          length: review.rating,
                        }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className="fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="mb-3 text-xs font-black uppercase text-slate-400">
                        Chưa chấm sao
                      </div>
                    )}

                    <p className="text-sm leading-7 text-slate-700">
                      {getReviewContent(review) || "Không có nội dung."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-amber-500 shadow-sm">
                  <Star className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Chưa có đánh giá khách hàng.
                </p>
              </div>
            )}
          </section>
        )}

        {pendingFood && (
          <div
            className="fixed inset-0 z-50 flex items-end bg-slate-950/35 px-4 py-4 backdrop-blur-sm sm:items-center sm:justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={`Chọn số lượng ${pendingFood.name}`}
            onClick={closeAddFoodModal}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-2xl shadow-slate-950/20"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                    Thêm món
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {pendingFood.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeAddFoodModal}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Đóng chọn số lượng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-5 py-5">
                <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Số lượng muốn thêm
                    </p>
                    <p className="mt-1 text-lg font-black text-cyan-700">
                      {formatPrice(pendingFood.price)} / món
                    </p>
                  </div>

                  <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setPendingQuantity((current) =>
                          Math.max(1, current - 1),
                        )
                      }
                      className="grid h-12 w-12 place-items-center text-slate-600 transition hover:bg-slate-50"
                      aria-label="Giảm số lượng"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <input
                      value={pendingQuantity}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);

                        setPendingQuantity(
                          Number.isFinite(nextValue)
                            ? Math.max(
                                1,
                                Math.min(99, Math.floor(nextValue || 1)),
                              )
                            : 1,
                        );
                      }}
                      className="h-12 w-16 border-x border-slate-200 text-center text-sm font-black text-slate-950 outline-none"
                      inputMode="numeric"
                      aria-label="Số lượng món muốn thêm"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setPendingQuantity((current) =>
                          Math.min(99, current + 1),
                        )
                      }
                      className="grid h-12 w-12 place-items-center text-slate-600 transition hover:bg-slate-50"
                      aria-label="Tăng số lượng"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAddFoodModal}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addToCart(pendingFood, pendingQuantity);
                      closeAddFoodModal();
                    }}
                    className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:bg-cyan-700"
                  >
                    Thêm vào đơn
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {cartOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end bg-slate-950/35 px-4 py-4 backdrop-blur-sm sm:items-stretch sm:justify-end sm:p-0"
            role="dialog"
            aria-modal="true"
            aria-label="Đơn đang đặt"
            onClick={() => setCartOpen(false)}
          >
            <div
              className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-2xl shadow-slate-950/20 sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none sm:rounded-l-[28px]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                    Order draft
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Đơn đang đặt
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Đóng đơn đang đặt"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[52vh] overflow-y-auto px-5 py-4 sm:max-h-none sm:flex-1">
                {cart.length > 0 ? (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.food.id}
                        className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                      >
                        {item.food.imageUrl ? (
                          <img
                            src={item.food.imageUrl}
                            alt={item.food.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="grid h-16 w-16 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                            <Flame className="h-6 w-6" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">
                            {item.food.name}
                          </p>
                          <p className="mt-1 text-sm font-bold text-cyan-700">
                            {formatPrice(item.food.price)}
                          </p>
                          {item.food.description && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {item.food.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                          <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <button
                              type="button"
                              onClick={() => decrementCartItem(item.food.id)}
                              className="grid h-10 w-10 place-items-center text-slate-600 transition hover:bg-slate-50"
                              aria-label={`Giảm ${item.food.name}`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <input
                              value={item.quantity}
                              onChange={(event) =>
                                updateCartQuantity(
                                  item.food.id,
                                  Number(event.target.value),
                                )
                              }
                              className="h-10 w-14 border-x border-slate-200 text-center text-sm font-black text-slate-950 outline-none"
                              inputMode="numeric"
                              aria-label={`Số lượng ${item.food.name}`}
                            />

                            <button
                              type="button"
                              onClick={() => incrementCartItem(item.food.id)}
                              className="grid h-10 w-10 place-items-center text-slate-600 transition hover:bg-slate-50"
                              aria-label={`Tăng ${item.food.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeCartItem(item.food.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <ShoppingCart className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 text-sm font-bold text-slate-500">
                      Chưa có món nào trong đơn.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      {cartItemCount} món đã chọn
                    </p>
                    <p className="text-2xl font-black text-cyan-700">
                      {formatPrice(total)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                      >
                        Xóa hết
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleCreateOrder()}
                      disabled={ordering || cart.length === 0}
                      className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {ordering ? "Đang đặt..." : "Đặt món"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* cart */}
        {cart.length > 0 && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
            <div className="pointer-events-auto mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-3 shadow-2xl shadow-cyan-950/15 ring-1 ring-slate-950/5 backdrop-blur-2xl sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {cartItemCount} món trong giỏ
                  </p>

                  <p className="mt-1 text-2xl font-black tracking-tight text-cyan-700">
                    {formatPrice(total)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-white px-5 py-3 text-sm font-black text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Xem đơn
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleCreateOrder()}
                    disabled={ordering}
                    className="rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {ordering ? "Đang đặt..." : "Đặt món ngay"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
