import { useEffect, useState } from "react";
import { Check, Star, X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  confirmNotReceived,
  confirmReceived,
  getCustomerOrderDetail,
  getCustomerOrderId,
  getCustomerOrders,
} from "../services/orderService";
import type {
  CustomerOrderDetailItem,
  CustomerOrderSummary,
} from "@/shared/types";
import { notify } from "@/shared/lib/notify";
import {
  createReview,
  getReviewsByMerchantId,
  type Review,
} from "@/features/review/services";
import { findMerchantByFoodId } from "../services/merchantService";

type OrderDetailLocationState = {
  order?: CustomerOrderSummary;
  fallbackOrderNumber?: number;
};

type FoodReviewDraft = {
  rating: number;
  content: string;
};

const orderIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getCustomerConfirmMessage(status?: string | null) {
  const normalizedStatus = status?.toLowerCase();

  if (!normalizedStatus || normalizedStatus === "pending") {
    return "Đơn đang chờ Merchant xác nhận. Sau khi quán chấp nhận đơn, bạn mới có thể xác nhận nhận hàng.";
  }

  if (normalizedStatus === "rejected") {
    return "Đơn đã bị Merchant từ chối nên không thể xác nhận nhận hàng.";
  }

  if (normalizedStatus === "completed") {
    return "Bạn đã xác nhận nhận hàng cho đơn này.";
  }

  if (normalizedStatus === "cashpending") {
    return "Bạn đã thanh toán tiền mặt. Đang chờ Merchant xác nhận để hoàn tất check-in.";
  }

  if (normalizedStatus === "notreceived") {
    return "Bạn đã báo chưa nhận hàng cho đơn này.";
  }

  return "Bạn chỉ có thể xác nhận đơn sau khi Merchant chấp nhận đơn hàng.";
}

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = location.state as OrderDetailLocationState | null;
  const summaryOrder = navigationState?.order ?? null;
  const fallbackOrderNumber = navigationState?.fallbackOrderNumber ?? null;
  const hasRealOrderId = Boolean(id && orderIdPattern.test(id));
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null);
  const [items, setItems] = useState<CustomerOrderDetailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [foodReviewDrafts, setFoodReviewDrafts] = useState<
    Record<string, FoodReviewDraft>
  >({});
  const [activeFoodReviewId, setActiveFoodReviewId] = useState<string | null>(
    null,
  );
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!id) return;

      setLoading(true);
      setResolvedOrderId(null);

      try {
        let effectiveOrderId = id;
        let matchingSummaryOrder = summaryOrder;

        if (!hasRealOrderId) {
          const orders = await getCustomerOrders().catch(() => []);
          const refreshedSummaryOrder = summaryOrder
            ? orders.find((order) => matchesSummaryOrder(order, summaryOrder))
            : orders[0];

          matchingSummaryOrder =
            refreshedSummaryOrder ?? summaryOrder ?? matchingSummaryOrder;
          effectiveOrderId = getCustomerOrderId(matchingSummaryOrder) || "";

          if (!effectiveOrderId) {
            if (active) {
              setItems([]);
              setOrderStatus(matchingSummaryOrder?.status ?? null);
              setMerchantId(null);
              setMerchantName(matchingSummaryOrder?.name || "");
            }

            return;
          }

          if (active) {
            setResolvedOrderId(effectiveOrderId);

            navigate(`/customer/orders/${effectiveOrderId}${location.hash}`, {
              replace: true,
              state: {
                order: matchingSummaryOrder ?? summaryOrder ?? undefined,
                fallbackOrderNumber,
              },
            });
          }
        }

        const [data, orders] = await Promise.all([
          getCustomerOrderDetail(effectiveOrderId),
          getCustomerOrders().catch(() => []),
        ]);

        if (active) {
          setItems(data ?? []);
          setOrderStatus(
            orders.find(
              (order) => getCustomerOrderId(order) === effectiveOrderId,
            )?.status ??
              matchingSummaryOrder?.status ??
              null,
          );
        }

        const firstItem = data?.[0];
        const firstFoodId = firstItem?.foodId;

        if (firstFoodId) {
          const merchant = await resolveOrderMerchant(firstItem).catch(
            (error) => {
              console.error(error);
              return null;
            },
          );

          if (active) {
            setMerchantId(merchant?.id ?? null);
            setMerchantName(merchant?.name ?? "");
          }

          if (merchant?.id && effectiveOrderId) {
            const merchantReviews = await getReviewsByMerchantId(
              merchant.id,
            ).catch(() => []);

            if (active) {
              const existingReview = merchantReviews.find((review: Review) => {
                const reviewOrderId = review.orderId || review.oderId;

                return (
                  normalizeReviewOrderId(reviewOrderId) === effectiveOrderId
                );
              });

              setHasReviewed(Boolean(existingReview));
            }
          }
        } else if (active) {
          setMerchantId(null);
          setMerchantName("");
          setHasReviewed(false);
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
  }, [
    fallbackOrderNumber,
    hasRealOrderId,
    id,
    location.hash,
    navigate,
    summaryOrder,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hash !== "#review-section") return;

    const timer = window.setTimeout(() => {
      document.getElementById("review-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [id]);

  async function handleSubmitReview() {
    const orderId = hasRealOrderId ? id : resolvedOrderId;

    if (!orderId || !merchantId) {
      notify.error("Không xác định được merchant để đánh giá.");
      return;
    }

    if (hasReviewed) {
      notify.error("Đơn hàng này đã được đánh giá rồi.");
      return;
    }

    if (!isCompleted) {
      notify.error("Chỉ có thể đánh giá khi đơn hàng đã hoàn tất.");
      return;
    }

    const reviewDetails = items
      .map((item) => {
        const orderDetailId = getOrderDetailId(item);
        const draft = orderDetailId ? foodReviewDrafts[orderDetailId] : null;

        if (!orderDetailId || !draft || draft.rating < 1) {
          return null;
        }

        return {
          orderDetailId,
          rating: draft.rating,
          detailContent: draft.content.trim(),
        };
      })
      .filter(
        (
          item,
        ): item is {
          orderDetailId: string;
          rating: number;
          detailContent: string;
        } => item !== null,
      );

    setSubmittingReview(true);

    try {
      await createReview({
        merchantId,
        orderId,
        rating: reviewRating,
        content: reviewContent.trim(),
        reviewDetails: reviewDetails.length > 0 ? reviewDetails : undefined,
      });

      notify.success("Đã gửi đánh giá.");
      setReviewContent("");
      setReviewRating(5);
      setFoodReviewDrafts({});
      setActiveFoodReviewId(null);
      setHasReviewed(true);
    } catch (error) {
      console.error(error);
      notify.error("Gửi đánh giá thất bại.");
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleConfirmReceived() {
    const orderId = hasRealOrderId ? id : resolvedOrderId;

    if (!orderId) return;

    if (!isAccepted) {
      notify.error(
        "Merchant cần xác nhận đơn trước khi bạn xác nhận nhận hàng.",
      );
      return;
    }

    setUpdatingStatus(true);

    try {
      await confirmReceived(orderId);
      setOrderStatus("Completed");
      notify.success("Đã xác nhận đã nhận hàng.");
    } catch (error) {
      console.error(error);
      notify.error("Xác nhận đơn thất bại.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleConfirmNotReceived() {
    const orderId = hasRealOrderId ? id : resolvedOrderId;

    if (!orderId) return;

    if (!isAccepted) {
      notify.error(
        "Merchant cần xác nhận đơn trước khi bạn báo chưa nhận hàng.",
      );
      return;
    }

    setUpdatingStatus(true);

    try {
      await confirmNotReceived(orderId);
      setOrderStatus("NotReceived");
      notify.success("Đã báo chưa nhận hàng.");
    } catch (error) {
      console.error(error);
      notify.error("Cập nhật đơn thất bại.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/customer/orders");
  }

  function handleRefresh() {
    window.location.reload();
  }

  function updateFoodReviewDraft(
    orderDetailId: string,
    patch: Partial<FoodReviewDraft>,
  ) {
    setFoodReviewDrafts((current) => {
      const previous = current[orderDetailId] ?? { rating: 0, content: "" };

      return {
        ...current,
        [orderDetailId]: {
          ...previous,
          ...patch,
        },
      };
    });
  }

  function toggleFoodReview(orderDetailId: string) {
    setActiveFoodReviewId((current) =>
      current === orderDetailId ? null : orderDetailId,
    );
  }

  const itemsTotal = items.reduce((sum, item) => {
    return sum + Number(item.unitPrice || 0) * Number(item.quantity || 0);
  }, 0);
  const total =
    itemsTotal > 0 ? itemsTotal : Number(summaryOrder?.finalPrice || 0);
  const title = summaryOrder?.name || `Đơn #${fallbackOrderNumber ?? id}`;
  const effectiveOrderId = hasRealOrderId ? id : resolvedOrderId;
  const displayOrderStatus = orderStatus ?? summaryOrder?.status ?? null;
  const normalizedOrderStatus = displayOrderStatus?.trim().toLowerCase();
  const isAccepted = normalizedOrderStatus === "accepted";
  const isCompleted = normalizedOrderStatus === "completed";
  const isNotReceived = normalizedOrderStatus === "notreceived";
  const reviewLocked = hasReviewed || submittingReview;

  if (loading) return <div className="p-5">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-cyan-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center rounded-xl border border-white/70 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-px hover:bg-white"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          className="mb-4 ml-2 inline-flex items-center rounded-xl border border-cyan-200 bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:-translate-y-px hover:bg-cyan-700"
        >
          Refresh
        </button>

        <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-bold">{title}</h1>

          <p className="mt-3 text-xl font-bold text-cyan-700">
            {total.toLocaleString("vi-VN")}đ
          </p>

          {summaryOrder && (
            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p>Trạng thái: {displayOrderStatus ?? summaryOrder.status}</p>
              <p>
                Ngày đặt:{" "}
                {new Date(summaryOrder.orderedAt).toLocaleString("vi-VN")}
              </p>
              {summaryOrder.deliveryAddress && (
                <p>Địa chỉ: {summaryOrder.deliveryAddress}</p>
              )}
              {summaryOrder.notes && <p>Ghi chú: {summaryOrder.notes}</p>}
            </div>
          )}

          {effectiveOrderId && isAccepted ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleConfirmReceived()}
                disabled={updatingStatus || isCompleted}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check size={16} />
                Đã nhận hàng
              </button>

              <button
                type="button"
                onClick={() => void handleConfirmNotReceived()}
                disabled={updatingStatus || isCompleted || isNotReceived}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                <X size={16} />
                Chưa nhận hàng
              </button>
            </div>
          ) : effectiveOrderId ? (
            <div className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {getCustomerConfirmMessage(displayOrderStatus)}
            </div>
          ) : null}
        </div>

        <div
          id="review-section"
          className="mt-5 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Đánh giá quán</h2>
              <p className="mt-1 text-sm text-slate-500">
                {merchantId
                  ? `Gửi nhận xét cho ${merchantName || "merchant này"}.`
                  : "Chưa xác định được merchant từ đơn hàng này."}
              </p>
            </div>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              Trạng thái: {displayOrderStatus || "Đang tải"}
            </span>
          </div>

          {!effectiveOrderId ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Chưa ghép được mã đơn thật từ dữ liệu danh sách, nên trang này chỉ
              hiển thị thông tin tóm tắt.
            </p>
          ) : !isCompleted ? (
            <p className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Bạn chỉ có thể gửi đánh giá sau khi đơn hàng đã được xác nhận hoàn
              tất.
            </p>
          ) : hasReviewed ? (
            <p className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Đơn hàng này đã được đánh giá rồi, mỗi đơn chỉ đánh giá một lần.
            </p>
          ) : merchantId ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Chọn số sao
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    const active = value <= reviewRating;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        disabled={reviewLocked}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                          active
                            ? "border-amber-300 bg-amber-50 text-amber-500"
                            : "border-slate-200 bg-white text-slate-300 hover:border-amber-200 hover:text-amber-400"
                        }`}
                        aria-label={`Chọn ${value} sao`}
                      >
                        <Star
                          size={18}
                          className={active ? "fill-amber-400" : ""}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-content"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nội dung đánh giá
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    (không bắt buộc)
                  </span>
                </label>
                <textarea
                  id="review-content"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về quán nếu muốn..."
                  disabled={reviewLocked}
                  className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              {items.length > 0 && (
                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Đánh giá từng món
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Không bắt buộc. Món nào không chọn sao sẽ không gửi review
                      riêng.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => {
                      const orderDetailId = getOrderDetailId(item);
                      if (!orderDetailId) return null;

                      const draft = foodReviewDrafts[orderDetailId] ?? {
                        rating: 0,
                        content: "",
                      };
                      const isOpen = activeFoodReviewId === orderDetailId;

                      return (
                        <div
                          key={`food-review-${orderDetailId}`}
                          className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-950">
                                {item.name || "Món ăn"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Số lượng: {item.quantity || 0}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleFoodReview(orderDetailId)}
                              disabled={reviewLocked}
                              className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:opacity-60"
                            >
                              {isOpen ? "Ẩn món" : "Xem món"}
                            </button>
                          </div>

                          {draft.rating > 0 && !isOpen ? (
                            <p className="mt-3 text-xs font-semibold text-amber-700">
                              Đã chọn {draft.rating}/5 sao cho món này.
                            </p>
                          ) : null}

                          {isOpen ? (
                            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                              <div className="flex flex-wrap gap-1">
                                {Array.from({ length: 5 }).map((_, index) => {
                                  const value = index + 1;
                                  const active = value <= draft.rating;

                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() =>
                                        updateFoodReviewDraft(orderDetailId, {
                                          rating:
                                            draft.rating === value ? 0 : value,
                                        })
                                      }
                                      disabled={reviewLocked}
                                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                                        active
                                          ? "border-amber-300 bg-amber-50 text-amber-500"
                                          : "border-slate-200 bg-white text-slate-300 hover:border-amber-200 hover:text-amber-400"
                                      }`}
                                      aria-label={`Chọn ${value} sao cho ${item.name || "món ăn"}`}
                                    >
                                      <Star
                                        size={15}
                                        className={
                                          active ? "fill-amber-400" : ""
                                        }
                                      />
                                    </button>
                                  );
                                })}
                              </div>

                              <textarea
                                value={draft.content}
                                onChange={(event) =>
                                  updateFoodReviewDraft(orderDetailId, {
                                    content: event.target.value,
                                  })
                                }
                                placeholder="Nhận xét riêng cho món này nếu muốn..."
                                disabled={reviewLocked}
                                className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                              />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleSubmitReview()}
                disabled={reviewLocked}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Star size={16} className="fill-white" />
                {hasReviewed
                  ? "Đã đánh giá"
                  : submittingReview
                    ? "Đang gửi..."
                    : "Gửi đánh giá"}
              </button>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Không lấy được merchant của đơn này, nên chưa thể tạo đánh giá.
            </p>
          )}
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
            <p className="text-slate-500">
              {effectiveOrderId
                ? "Không có món nào trong đơn."
                : "Backend chưa trả mã đơn nên chưa tải được danh sách món."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeReviewOrderId(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function getOrderDetailId(item: CustomerOrderDetailItem) {
  return item.orderDetailId || item.id || "";
}

function matchesSummaryOrder(
  candidate: CustomerOrderSummary,
  reference: CustomerOrderSummary | null,
) {
  if (!reference) return true;

  return (
    normalizeString(candidate.name) === normalizeString(reference.name) &&
    normalizeString(candidate.status) === normalizeString(reference.status) &&
    normalizeString(candidate.deliveryAddress) ===
      normalizeString(reference.deliveryAddress) &&
    normalizeString(candidate.notes) === normalizeString(reference.notes) &&
    normalizeDateString(candidate.orderedAt) ===
      normalizeDateString(reference.orderedAt) &&
    normalizeNumber(candidate.finalPrice) ===
      normalizeNumber(reference.finalPrice)
  );
}

function normalizeString(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizeNumber(value?: number | null) {
  return Number(value ?? 0).toFixed(2);
}

function normalizeDateString(value?: string | null) {
  const timestamp = value ? Date.parse(value) : Number.NaN;

  return Number.isNaN(timestamp) ? "" : new Date(timestamp).toISOString();
}

async function resolveOrderMerchant(item?: CustomerOrderDetailItem | null) {
  if (!item?.foodId) return null;

  if (item.merchantId) {
    return {
      id: item.merchantId,
      name: item.merchantName || "",
    };
  }

  const merchant = await findMerchantByFoodId(item.foodId);

  if (!merchant?.id) return null;

  return {
    id: merchant.id,
    name: merchant.name || item.merchantName || "",
  };
}
