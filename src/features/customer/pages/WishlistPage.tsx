import { useEffect, useState } from "react";
import {
  getWishlist,
  removeWishlist,
  type WishlistItem,
} from "../services/wishlistService";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const data = await getWishlist();
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Không tải được wishlist.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(merchantId?: string) {
    if (!merchantId) {
      alert(
        "Không tìm thấy merchantId để xóa. BE cần trả merchantId trong wishlist.",
      );
      return;
    }

    try {
      await removeWishlist(merchantId);

      setItems((prev) =>
        prev.filter(
          (item) => item.merchantId !== merchantId && item.id !== merchantId,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Xóa wishlist thất bại.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-5 text-2xl font-bold">Quán yêu thích</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {items.map((merchant, index) => {
              const merchantId = merchant.merchantId || merchant.id;

              return (
                <div
                  key={merchantId || `${merchant.name}-${index}`}
                  className="rounded-2xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                      {merchant.logoUrl ? (
                        <img
                          src={merchant.logoUrl}
                          alt={merchant.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {merchant.name}
                      </h3>

                      <p className="mt-2 text-sm text-gray-600">
                        ⭐ {merchant.rating || 0}
                      </p>

                      <button
                        onClick={() => handleRemove(merchantId)}
                        className="mt-3 text-sm text-red-600"
                      >
                        Xóa khỏi yêu thích
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <p className="text-center text-gray-500">
                Bạn chưa lưu quán nào.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
