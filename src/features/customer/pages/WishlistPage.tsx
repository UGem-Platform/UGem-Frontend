import { useEffect, useState } from "react";
import { HeartOff, Star, Store, Trash2 } from "lucide-react";
import {
  getWishlist,
  removeWishlist,
  type WishlistItem,
} from "../services/wishlistService";
import { notify } from "@/shared/lib/notify";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleRemove(merchantId?: string) {
    if (!merchantId) {
      notify.error(
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
      notify.error("Xóa wishlist thất bại.");
    }
  }

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await getWishlist();

        if (active) {
          setItems(data ?? []);
        }
      } catch (error) {
        console.error(error);
        notify.error("Không tải được wishlist.");
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
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_32%),linear-gradient(135deg,#ecfeff_0%,#f8fafc_46%,#fff7ed_100%)] px-4 py-6 text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none fixed left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700 shadow-sm shadow-cyan-950/5">
            Favorite Merchants
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Quán yêu thích
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Những quán bạn đã lưu để quay lại nhanh hơn.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-[28px] border border-white/70 bg-white/70 shadow-xl shadow-slate-950/5"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((merchant, index) => {
              const merchantId = merchant.merchantId || merchant.id;

              return (
                <div
                  key={merchantId || `${merchant.name}-${index}`}
                  className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-950/5 ring-1 ring-slate-950/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/10"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/15 blur-2xl opacity-0 transition group-hover:opacity-100" />

                  <div className="relative flex gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cyan-100 shadow-md shadow-slate-950/5 ring-1 ring-white/70">
                      {merchant.logoUrl ? (
                        <img
                          src={merchant.logoUrl}
                          alt={merchant.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#cffafe,#f8fafc,#fef3c7)] text-cyan-800">
                          <Store className="h-7 w-7" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-lg font-black tracking-tight text-slate-950">
                        {merchant.name}
                      </h3>

                      <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-sm font-black text-amber-700 shadow-sm">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {merchant.rating || 0}
                      </p>

                      <div className="mt-4">
                        <button
                          onClick={() => handleRemove(merchantId)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-white/85 px-4 py-2 text-sm font-black text-rose-600 shadow-sm ring-1 ring-slate-950/5 transition hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa khỏi yêu thích
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/75 p-10 text-center shadow-xl shadow-slate-950/5 ring-1 ring-slate-950/5 backdrop-blur-xl">
                <HeartOff className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-4 text-sm font-bold text-slate-500">
                  Bạn chưa lưu quán nào.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
