import { useReviews } from "../hooks";
import { Star } from "lucide-react";
import type { Review } from "../services";

export default function ReviewsPage() {
  const { data: reviews = [], isLoading, isError, error } = useReviews();

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-5 text-2xl font-bold">Đánh giá</h1>

        {isLoading ? (
          <p>Đang tải...</p>
        ) : isError ? (
          <p className="text-red-600">
            Lỗi:{" "}
            {error instanceof Error
              ? error.message
              : "Không tải được danh sách"}
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review: Review, idx: number) => (
                <div
                  key={review.id || idx}
                  className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {review.title || review.name || "Đánh giá"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {review.comment || review.description || ""}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: review.rating || 5 }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className="fill-amber-400 text-amber-400"
                            />
                          ),
                        )}
                        <span className="ml-2 text-sm text-slate-500">
                          ({review.rating || 5}/5)
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500">
                Chưa có đánh giá nào.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
