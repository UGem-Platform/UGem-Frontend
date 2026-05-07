import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  BadgeCheck,
  Clock3,
  FileText,
  Flame,
  Hourglass,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { UserAccountMenu } from "@/shared/components";
import { useStaffApplications } from "../hooks/useApplications";
import { notify } from "@/shared/lib/notify";
import { getUserProfile, type UserProfile } from "@/shared/services";
import { StaffShell } from "../components/StaffShell";

function formatDate(value?: string | number | null, fallback = "-") {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatMinutes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "-";
  if (value < 60) return `${Math.round(value)} phút`;

  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
}

function getStatusMeta(status?: string) {
  const value = status?.toLowerCase();

  if (value === "approved" || value === "accepted") {
    return {
      label: "Đã duyệt",
      tone: "bg-emerald-100 text-emerald-800",
      icon: BadgeCheck,
    };
  }

  if (value === "rejected") {
    return {
      label: "Đã từ chối",
      tone: "bg-rose-100 text-rose-800",
      icon: Flame,
    };
  }

  return {
    label: "Chờ duyệt",
    tone: "bg-amber-100 text-amber-800",
    icon: Hourglass,
  };
}

export default function StaffProfilePage() {
  const currentUser = getCurrentUser();
  const {
    data: applications = [],
    isLoading,
    isError,
  } = useStaffApplications();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        if (!active) return;
        setProfile(data ?? null);
      } catch (error) {
        console.error(error);
        if (active) {
          notify.error("Không tải được hồ sơ Staff.");
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const pending = applications.filter(
      (item) => !item.status || item.status.toLowerCase() === "pending",
    );
    const approved = applications.filter((item) => {
      const value = item.status?.toLowerCase();
      return value === "approved" || value === "accepted";
    });
    const rejected = applications.filter(
      (item) => item.status?.toLowerCase() === "rejected",
    );
    const reviewed = applications.filter(
      (item) => item.status && item.status.toLowerCase() !== "pending",
    );

    const processingRate =
      applications.length > 0
        ? (reviewed.length / applications.length) * 100
        : 0;
    const approvalRate =
      reviewed.length > 0 ? (approved.length / reviewed.length) * 100 : 0;

    const processingDurations = reviewed
      .map((item) => {
        const createdAt = new Date(item.createdAt || 0).getTime();
        const reviewedAt = new Date(item.reviewedAt || 0).getTime();
        if (!createdAt || !reviewedAt || reviewedAt <= createdAt) return 0;
        return (reviewedAt - createdAt) / 60000;
      })
      .filter((value) => value > 0);

    const avgProcessingMinutes =
      processingDurations.length > 0
        ? processingDurations.reduce((sum, value) => sum + value, 0) /
          processingDurations.length
        : 0;

    const recentReviewed = [...reviewed]
      .sort(
        (a, b) =>
          new Date(b.reviewedAt || 0).getTime() -
          new Date(a.reviewedAt || 0).getTime(),
      )
      .slice(0, 5);

    const recentPending = [...pending]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 5);

    return {
      total: applications.length,
      pending: pending.length,
      reviewed: reviewed.length,
      approved: approved.length,
      rejected: rejected.length,
      processingRate,
      approvalRate,
      avgProcessingMinutes,
      recentReviewed,
      recentPending,
    };
  }, [applications]);

  const displayName =
    profile?.fullName || profile?.name || currentUser?.Name || "Staff";
  const email = profile?.email || currentUser?.Email || "-";
  const roleLabel = profile?.role || currentUser?.Role || "Staff";

  return (
    <StaffShell activeItem="dashboard">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Dashboard KPI Staff</h1>
            <p className="mt-1 text-sm text-slate-600">
              Theo dõi khối lượng hồ sơ, tốc độ xử lý và hiệu quả duyệt hồ sơ.
            </p>
          </div>

          <UserAccountMenu fallbackName="Staff" />
        </div>

        {isError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Không tải được dữ liệu KPI. Vui lòng thử lại sau.
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-cyan-950/10 backdrop-blur">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-cyan-800">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={displayName}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <UserRound className="h-8 w-8" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-cyan-700">Staff</p>
                  <h2 className="truncate text-xl font-black text-slate-950">
                    {displayName}
                  </h2>
                  <p className="truncate text-sm text-slate-500">{email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </p>
                <p className="mt-1 text-base font-bold text-slate-950">
                  {roleLabel}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User ID
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-950">
                  {currentUser?.UserId || profile?.userId || profile?.id || "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Trạng thái dữ liệu
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {isLoading ? "Đang tải KPI..." : "KPI sẵn sàng"}
                </p>
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Tổng hồ sơ"
                value={stats.total}
                icon={FileText}
                tone="bg-cyan-600 text-white"
                hint="Toàn bộ hồ sơ Staff được phép xem"
              />
              <KpiCard
                title="Chờ duyệt"
                value={stats.pending}
                icon={Clock3}
                tone="bg-amber-500 text-white"
                hint="Chưa ai nhận xử lý"
              />
              <KpiCard
                title="Đã xử lý"
                value={stats.reviewed}
                icon={BadgeCheck}
                tone="bg-emerald-600 text-white"
                hint="Đã duyệt hoặc từ chối"
              />
              <KpiCard
                title="Tỷ lệ xử lý"
                value={`${stats.processingRate.toFixed(0)}%`}
                icon={TrendingUp}
                tone="bg-slate-900 text-white"
                hint="Reviewed / Total"
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-3">
              <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-cyan-950/10 backdrop-blur xl:col-span-2">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      KPI hiệu suất
                    </h2>
                    <p className="text-sm text-slate-500">
                      Các chỉ số phản ánh tốc độ và chất lượng xử lý hồ sơ.
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    Cập nhật theo dữ liệu hiện có
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricRow
                    label="Tỷ lệ duyệt"
                    value={`${stats.approvalRate.toFixed(0)}%`}
                  />
                  <MetricRow
                    label="Hồ sơ đã duyệt"
                    value={formatNumber(stats.approved)}
                  />
                  <MetricRow
                    label="Hồ sơ từ chối"
                    value={formatNumber(stats.rejected)}
                  />
                  <MetricRow
                    label="Thời gian xử lý TB"
                    value={formatMinutes(stats.avgProcessingMinutes)}
                  />
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Nhận xét nhanh
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {stats.pending === 0
                      ? "Hiện không còn hồ sơ chờ xử lý. Bạn đang ở trạng thái sạch backlog."
                      : `Còn ${formatNumber(stats.pending)} hồ sơ chờ xử lý. Ưu tiên xử lý backlog trước để cải thiện SLA.`}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-cyan-950/10 backdrop-blur">
                <h2 className="text-lg font-bold text-slate-950">
                  Danh sách nhanh
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Hồ sơ mới nhất đang chờ và hồ sơ vừa xử lý.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Chờ duyệt gần đây
                    </p>
                    <div className="mt-2 space-y-2">
                      {stats.recentPending.length === 0 ? (
                        <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
                          Không có hồ sơ pending.
                        </p>
                      ) : (
                        stats.recentPending.map((item) => {
                          const meta = getStatusMeta(item.status);
                          const StatusIcon = meta.icon;

                          return (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-950">
                                    {item.name || "Không tên"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Gửi lúc {formatDate(item.createdAt)}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${meta.tone}`}
                                >
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {meta.label}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Đã xử lý gần đây
                    </p>
                    <div className="mt-2 space-y-2">
                      {stats.recentReviewed.length === 0 ? (
                        <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
                          Chưa có hồ sơ được xử lý.
                        </p>
                      ) : (
                        stats.recentReviewed.map((item) => {
                          const meta = getStatusMeta(item.status);
                          const StatusIcon = meta.icon;

                          return (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-950">
                                    {item.name || "Không tên"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Xử lý lúc {formatDate(item.reviewedAt)}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${meta.tone}`}
                                >
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {meta.label}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </StaffShell>
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
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  tone: string;
  hint: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-cyan-950/10 backdrop-blur">
      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}
