import { useMemo } from "react";
import { IdCard, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";

import { getCurrentUser } from "@/features/auth";
import { MerchantHeader } from "@/shared/layouts/Merchants/MerchantHeader";
import { MerchantSidebar } from "@/shared/layouts/Merchants/MerchantSidebar";

function getInitial(name?: string) {
  return (name || "M").trim().charAt(0).toUpperCase() || "M";
}

export default function MerchantProfilePage() {
  const user = getCurrentUser();

  const profile = useMemo(() => {
    return {
      displayName: user?.Name || "Merchant",
      email: user?.Email || "-",
      role: user?.Role || "Merchant",
      phoneNumber: "Chưa cập nhật",
      userId: user?.UserId || "-",
    };
  }, [user?.Email, user?.Name, user?.Role, user?.UserId]);

  return (
    <main className="merchant-portal-layout">
      <MerchantSidebar />

      <section className="merchant-main">
        <MerchantHeader />

        <div className="merchant-content">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                Merchant Profile
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Profile Merchant
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Xem thông tin tài khoản Merchant đang đăng nhập.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <section className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-white/90 shadow-sm">
              <div className="border-b border-cyan-100 p-6">
                <div className="grid place-items-center text-center">
                  <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-2xl bg-cyan-100 text-4xl font-black text-cyan-800 shadow-sm">
                    {getInitial(profile.displayName)}
                  </div>

                  <h2 className="mt-5 max-w-full truncate text-2xl font-bold text-slate-950">
                    {profile.displayName}
                  </h2>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                    {profile.email}
                  </p>

                  <span className="mt-4 inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                    {profile.role}
                  </span>
                </div>
              </div>

              <div className="space-y-3 p-5 text-sm">
                <ProfileInfoRow
                  icon={ShieldCheck}
                  label="Vai trò"
                  value={profile.role}
                />
                <ProfileInfoRow
                  icon={Mail}
                  label="Email"
                  value={profile.email}
                />
                <ProfileInfoRow
                  icon={Phone}
                  label="Số điện thoại"
                  value={profile.phoneNumber}
                />
                <ProfileInfoRow
                  icon={IdCard}
                  label="User ID"
                  value={profile.userId}
                />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-white/90 p-6 shadow-sm">
              <div className="mb-5 flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-800 ring-1 ring-cyan-100">
                  <UserRound size={20} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-950">
                    Thông tin tài khoản
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Hiện tại hệ thống chỉ hỗ trợ cập nhật hồ sơ cho Customer.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                Nếu cần chỉnh tên/email Merchant, vui lòng liên hệ Admin để cập
                nhật.
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
        <Icon size={16} />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-bold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}
