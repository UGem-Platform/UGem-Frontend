import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  BellRing,
  Building2,
  CalendarPlus,
  Clock3,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
  UserRoundPlus,
} from "lucide-react";

import { UserAccountMenu } from "@/shared/components";
import { notify } from "@/shared/lib/notify";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

function formatNumber(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "0";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatCurrency(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "0đ";
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useAdminDashboard();

  const dashboard = data ?? {
    totalUsers: 0,
    totalMerchants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    pendingApplications: 0,
    pendingReviewerApplications: 0,
  };

  if (isError) {
    notify.error(
      "Không tải được dashboard Admin: " + (error as Error)?.message,
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_32%),linear-gradient(135deg,#ecfeff_0%,#f8fafc_46%,#fff7ed_100%)] px-4 py-6 text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="pointer-events-none fixed left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700 shadow-sm shadow-cyan-950/5">
              Admin Dashboard
            </div>

            <h1 className="wrap-break-word text-3xl font-black tracking-tight text-slate-950">
              Dashboard Admin
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Theo dõi nhanh toàn bộ hệ thống: user, merchant, đơn hàng và các
              hồ sơ đang chờ xử lý.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isRefetching}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={isRefetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
              {isRefetching ? "Đang tải..." : "Làm mới"}
            </button>

            <UserAccountMenu fallbackName="Admin" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-3xl bg-white/70 shadow-lg shadow-slate-950/5"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {isError ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50/85 p-4 text-sm font-semibold text-rose-700 shadow-lg shadow-rose-950/5 ring-1 ring-rose-100 backdrop-blur-xl">
                Không tải được dashboard Admin, vui lòng thử lại sau.
              </div>
            ) : null}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Tổng người dùng"
                value={formatNumber(dashboard.totalUsers)}
                icon={Users}
                tone="bg-cyan-600 text-white"
                hint="Tất cả tài khoản trong hệ thống"
              />
              <KpiCard
                title="Tổng merchant"
                value={formatNumber(dashboard.totalMerchants)}
                icon={Building2}
                tone="bg-slate-900 text-white"
                hint="Merchant đã có hồ sơ hoạt động"
              />
              <KpiCard
                title="Tổng đơn hàng"
                value={formatNumber(dashboard.totalOrders)}
                icon={ShoppingBag}
                tone="bg-emerald-600 text-white"
                hint="Đơn hàng đã phát sinh trong hệ thống"
              />
              <KpiCard
                title="Doanh thu"
                value={formatCurrency(dashboard.totalRevenue)}
                icon={BadgeDollarSign}
                tone="bg-amber-500 text-white"
                hint="Tổng doanh thu từ đơn hoàn tất"
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-cyan-950/10 ring-1 ring-slate-950/5 backdrop-blur-2xl xl:col-span-2">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Chỉ số vận hành
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Những chỉ số chính để nhìn nhanh tình trạng hệ thống.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 shadow-sm">
                    <Clock3 className="h-3.5 w-3.5" />
                    Cập nhật theo API admin/dashboard
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard
                    icon={UserRoundPlus}
                    label="Người dùng mới hôm nay"
                    value={formatNumber(dashboard.newUsersToday)}
                    description="Tài khoản mới trong ngày"
                  />
                  <MetricCard
                    icon={CalendarPlus}
                    label="Hồ sơ merchant chờ duyệt"
                    value={formatNumber(dashboard.pendingApplications)}
                    description="Chờ Staff xử lý"
                  />
                  <MetricCard
                    icon={BellRing}
                    label="Reviewer application chờ duyệt"
                    value={formatNumber(dashboard.pendingReviewerApplications)}
                    description="Chờ Staff xử lý"
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="Tổng quan hệ thống"
                    value={
                      dashboard.totalRevenue > 0 ? "Tăng trưởng" : "Khởi tạo"
                    }
                    description="Tổng quan dựa trên dữ liệu hiện có"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-cyan-950/10 ring-1 ring-slate-950/5 backdrop-blur-2xl">
                <h2 className="text-xl font-black text-slate-950">
                  Lối tắt nhanh
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Đi tới các khu vực admin thường dùng.
                </p>

                <div className="mt-5 space-y-3">
                  <QuickLink
                    to="/admin/staff"
                    title="Quản lý Staff"
                    description="Xem, thêm và xóa tài khoản Staff"
                  />
                  <QuickLink
                    to="/admin/applications"
                    title="Hồ sơ merchant"
                    description="Staff xử lý hồ sơ merchant"
                  />
                  <QuickLink
                    to="/admin/reviewer-applications"
                    title="Reviewer applications"
                    description="Duyệt đơn đăng ký Reviewer"
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  hint: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-2xl shadow-cyan-950/5 ring-1 ring-slate-950/5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-cyan-950/10">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl" />

      <div
        className={`relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg shadow-slate-950/10 ${tone}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="relative text-sm font-bold text-slate-500">{title}</p>
      <p className="relative mt-2 text-4xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="relative mt-2 text-xs font-semibold leading-5 text-slate-500">
        {hint}
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm ring-1 ring-slate-950/5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-cyan-100">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm ring-1 ring-slate-950/5 transition hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-lg"
    >
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </Link>
  );
}
