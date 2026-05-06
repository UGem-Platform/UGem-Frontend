import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Clock3, MapPin, Phone, Star, Store } from "lucide-react";

import { MerchantHeader } from "@/shared/layouts/Merchants/MerchantHeader";
import { MerchantSidebar } from "@/shared/layouts/Merchants/MerchantSidebar";
import { notify } from "@/shared/lib/notify";
import type { MerchantDetail } from "@/features/customer/types";
import { getCurrentMerchantId, getMyMerchantDetail } from "../services";

export function MerchantRestaurantPage() {
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const merchantId = getCurrentMerchantId();

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await getMyMerchantDetail();

        if (active) {
          setMerchant(data);
        }
      } catch (error) {
        console.error(error);
        notify.error("Không tải được thông tin nhà hàng.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    queueMicrotask(() => {
      void load();
    });

    return () => {
      active = false;
    };
  }, []);

  const menu = merchant?.menu ?? merchant?.foods ?? [];

  return (
    <main className="merchant-portal-layout">
      <MerchantSidebar />

      <section className="merchant-main">
        <MerchantHeader />

        <div className="merchant-content">
          <section className="rounded-2xl border border-cyan-100 bg-white/90 p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                  Nhà hàng của bạn
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-950">
                  {merchant?.name || "Thông tin nhà hàng"}
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/merchant/foods"
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                >
                  Quản lý món
                </Link>
                <Link
                  to="/merchant/orders"
                  className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
                >
                  Đơn hàng
                </Link>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Đang tải nhà hàng...</p>
            ) : !merchant ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Chưa lấy được hồ sơ nhà hàng. FE đang dùng MerchantId trong JWT
                để gọi GET /api/v1/merchants/{`{id}`}; token hiện tại{" "}
                {merchantId ? "có MerchantId nhưng BE chưa trả dữ liệu." : "chưa có MerchantId."}
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  {merchant.logoUrl ? (
                    <img
                      src={merchant.logoUrl}
                      alt={merchant.name}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-52 place-items-center text-cyan-700">
                      <Store size={42} />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoLine
                      icon={<MapPin size={16} />}
                      label="Địa chỉ"
                      value={merchant.address}
                    />
                    <InfoLine
                      icon={<Phone size={16} />}
                      label="Liên hệ"
                      value={merchant.phone || merchant.email}
                    />
                    <InfoLine
                      icon={<Clock3 size={16} />}
                      label="Giờ mở cửa"
                      value={(merchant as { openingHours?: string }).openingHours}
                    />
                    <InfoLine
                      icon={<Star size={16} />}
                      label="Đánh giá"
                      value={
                        typeof merchant.rating === "number"
                          ? `${merchant.rating}/5`
                          : undefined
                      }
                    />
                  </div>

                  {merchant.description ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {merchant.description}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </section>

          {merchant ? (
            <section className="mt-5 rounded-2xl border border-cyan-100 bg-white/90 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-950">
                Menu hiện tại
              </h2>

              {menu.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {menu.map((item) => (
                    <article
                      key={item.id}
                      className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-cyan-700">
                          {item.price.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Chưa có món nào trong menu.
                </p>
              )}
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-slate-800">{value || "Chưa có"}</p>
    </div>
  );
}
