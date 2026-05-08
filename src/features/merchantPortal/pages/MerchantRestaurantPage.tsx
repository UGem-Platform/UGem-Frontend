import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Clock3, MapPin, Pencil, Phone, Save, Star, Store, X } from "lucide-react";

import { MerchantHeader } from "@/shared/layouts/Merchants/MerchantHeader";
import { MerchantSidebar } from "@/shared/layouts/Merchants/MerchantSidebar";
import { notify } from "@/shared/lib/notify";
import type { MerchantDetail } from "@/features/customer/types";
import {
  getCurrentMerchantId,
  getMyMerchantDetail,
  updateMerchant,
} from "../services";

type MerchantEditForm = {
  merchantName: string;
  merchantDescription: string;
  email: string;
  phone: string;
  address: string;
  openingHours: string;
};

function toEditForm(merchant?: MerchantDetail | null): MerchantEditForm {
  return {
    merchantName: merchant?.name ?? "",
    merchantDescription: merchant?.description ?? "",
    email: merchant?.email ?? "",
    phone: merchant?.phone ?? "",
    address: merchant?.address ?? "",
    openingHours: (merchant as { openingHours?: string } | null)?.openingHours ?? "",
  };
}

export function MerchantRestaurantPage() {
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<MerchantEditForm>(() => toEditForm(null));
  const merchantId = getCurrentMerchantId();

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await getMyMerchantDetail();

        if (active) {
          setMerchant(data);
          setForm(toEditForm(data));
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

  async function handleUpdateMerchant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await updateMerchant({
        merchantName: form.merchantName.trim(),
        merchantDescription: form.merchantDescription.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        openingHours: form.openingHours.trim(),
      });

      const nextMerchant = await getMyMerchantDetail();
      setMerchant(nextMerchant);
      setForm(toEditForm(nextMerchant));
      setIsEditing(false);
      notify.success("Đã cập nhật hồ sơ nhà hàng.");
    } catch (error) {
      console.error(error);
      notify.error("Cập nhật hồ sơ nhà hàng thất bại.");
    } finally {
      setSaving(false);
    }
  }

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
                {merchant ? (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(toEditForm(merchant));
                      setIsEditing((value) => !value);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {isEditing ? <X size={16} /> : <Pencil size={16} />}
                    {isEditing ? "Hủy sửa" : "Chỉnh sửa"}
                  </button>
                ) : null}
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
            ) : isEditing ? (
              <form
                onSubmit={handleUpdateMerchant}
                className="grid gap-4 md:grid-cols-2"
              >
                <EditField
                  label="Tên nhà hàng"
                  value={form.merchantName}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, merchantName: value }))
                  }
                  disabled={saving}
                />
                <EditField
                  label="Giờ mở cửa"
                  value={form.openingHours}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, openingHours: value }))
                  }
                  disabled={saving}
                />
                <EditField
                  label="Email"
                  value={form.email}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, email: value }))
                  }
                  disabled={saving}
                />
                <EditField
                  label="Số điện thoại"
                  value={form.phone}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, phone: value }))
                  }
                  disabled={saving}
                />
                <EditField
                  label="Địa chỉ"
                  value={form.address}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, address: value }))
                  }
                  disabled={saving}
                  className="md:col-span-2"
                />
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Mô tả
                  </span>
                  <textarea
                    value={form.merchantDescription}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        merchantDescription: event.target.value,
                      }))
                    }
                    disabled={saving}
                    className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:opacity-60"
                  />
                </label>
                <div className="flex justify-end md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "Đang lưu..." : "Lưu hồ sơ"}
                  </button>
                </div>
              </form>
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

function EditField({
  label,
  value,
  onChange,
  disabled,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:opacity-60"
      />
    </label>
  );
}
