import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import { useStaffApplications } from "../hooks/useApplications";
import type { Application } from "../types";
import { UserAccountMenu } from "@/shared/components";
import { notify } from "@/shared/lib/notify";

type NormalizedStatus = "pending" | "approved" | "rejected";

function formatDate(value?: string | number | null, fallback = "-") {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() <= 1901) {
    return fallback;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getTimeValue(value?: string | null) {
  if (!value) return 0;

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function normalizeStatus(status?: string): NormalizedStatus {
  const value = status?.toLowerCase();

  if (value === "approved" || value === "accepted") return "approved";
  if (value === "rejected") return "rejected";
  return "pending";
}

function getStatusMeta(status?: string) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "approved") {
    return {
      label: "Đã duyệt",
      icon: CheckCircle2,
      badgeClass: "bg-emerald-100 text-emerald-800",
    };
  }

  if (normalizedStatus === "rejected") {
    return {
      label: "Đã từ chối",
      icon: XCircle,
      badgeClass: "bg-rose-100 text-rose-800",
    };
  }

  return {
    label: "Đang duyệt",
    icon: Clock3,
    badgeClass: "bg-amber-100 text-amber-800",
  };
}

function sortPending(applications: Application[]) {
  return [...applications].sort(
    (a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt),
  );
}

function sortReviewed(applications: Application[]) {
  return [...applications].sort((a, b) => {
    const bTime =
      getTimeValue(b.reviewedAt) ||
      getTimeValue(b.updatedAt) ||
      getTimeValue(b.createdAt);
    const aTime =
      getTimeValue(a.reviewedAt) ||
      getTimeValue(a.updatedAt) ||
      getTimeValue(a.createdAt);

    return bTime - aTime;
  });
}

function ApplicationTable({
  applications,
  emptyText,
  basePath,
  canReview,
}: {
  applications: Application[];
  emptyText: string;
  basePath: string;
  canReview: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-190">
        <thead className="bg-cyan-50 text-left text-sm text-slate-700">
          <tr>
            <th className="p-4">Tên quán</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Ngày gửi</th>
            <th className="p-4">Ngày xử lý</th>
            <th className="p-4">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => {
            const statusMeta = getStatusMeta(app.status);
            const StatusIcon = statusMeta.icon;
            const isPending = normalizeStatus(app.status) === "pending";

            return (
              <tr
                key={app.id}
                className="border-t border-slate-100 hover:bg-cyan-50/70"
              >
                <td className="p-4 font-semibold text-slate-900">
                  {app.name || "Không tên"}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${statusMeta.badgeClass}`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    {statusMeta.label}
                  </span>
                </td>
                <td className="p-4 text-slate-700">
                  {formatDate(app.createdAt)}
                </td>
                <td className="p-4 text-slate-700">
                  {isPending ? "Chưa xử lý" : formatDate(app.reviewedAt)}
                </td>
                <td className="p-4">
                  <Link
                    to={`${basePath}/${app.id}`}
                    state={{ application: app }}
                    className="font-semibold text-cyan-700 hover:underline"
                  >
                    {isPending && canReview ? "Xem và duyệt" : "Xem chi tiết"}
                  </Link>
                </td>
              </tr>
            );
          })}

          {applications.length === 0 && (
            <tr>
              <td className="p-6 text-center text-slate-500" colSpan={5}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

type ApplicationsPageProps = {
  basePath?: string;
  title?: string;
  subtitle?: string;
  fallbackName?: string;
  canReview?: boolean;
  secondaryAction?: ReactNode;
  initialTab?: ApplicationTab;
  showTabs?: boolean;
  embedded?: boolean;
};

type ApplicationTab = "pending" | "reviewed";

export default function AdminApplicationsPage({
  basePath = "/staff/applications",
  title = "Job duyệt hồ sơ Merchant",
  subtitle = "Hàng đợi hồ sơ merchant cần Staff kiểm tra và xử lý.",
  fallbackName = "Staff",
  canReview = true,
  secondaryAction,
  initialTab = "pending",
  showTabs = true,
  embedded = false,
}: ApplicationsPageProps) {
  const [selectedTab, setSelectedTab] = useState<ApplicationTab>(initialTab);
  const activeTab = showTabs ? selectedTab : initialTab;

  const {
    data: applications = [],
    dataUpdatedAt,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useStaffApplications();

  const groupedApplications = useMemo(() => {
    const pending: Application[] = [];
    const reviewed: Application[] = [];

    for (const application of applications) {
      if (normalizeStatus(application.status) === "pending") {
        pending.push(application);
      } else {
        reviewed.push(application);
      }
    }

    return {
      pending: sortPending(pending),
      reviewed: sortReviewed(reviewed),
    };
  }, [applications]);

  const tabItems = useMemo(
    () => [
      {
        key: "pending" as const,
        label: "Chờ duyệt",
        description: "Pending và hồ sơ chưa ai nhận xử lý",
        count: groupedApplications.pending.length,
      },
      {
        key: "reviewed" as const,
        label: "Đã duyệt",
        description: "Hồ sơ đã được duyệt hoặc từ chối",
        count: groupedApplications.reviewed.length,
      },
    ],
    [groupedApplications.pending.length, groupedApplications.reviewed.length],
  );

  const activeTabMeta =
    tabItems.find((item) => item.key === activeTab) ?? tabItems[0];

  const activeApplications =
    activeTab === "pending"
      ? groupedApplications.pending
      : groupedApplications.reviewed;

  const activeEmptyText =
    activeTab === "pending"
      ? "Chưa có hồ sơ đang chờ duyệt."
      : "Chưa có hồ sơ đã xử lý.";

  const ActiveTabIcon = activeTab === "pending" ? Clock3 : CheckCircle2;

  const handleRefresh = () => {
    void refetch();
  };

  useEffect(() => {
    if (isError) {
      notify.error(
        "Không tải được danh sách hồ sơ: " + (error as Error)?.message,
      );
    }
  }, [isError, error]);

  return (
    <div
      className={
        embedded
          ? "text-slate-950"
          : "min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5 text-slate-950"
      }
    >
      <div className={embedded ? "w-full" : "mx-auto max-w-6xl"}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            <p className="mt-1 text-xs text-slate-500">
              Cập nhật lần cuối: {formatDate(dataUpdatedAt, "Chưa tải")}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefetching}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              {isRefetching ? "Đang tải..." : "Làm mới"}
            </button>
            {secondaryAction}
            <UserAccountMenu fallbackName={fallbackName} />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-lg bg-slate-200"
                />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-rose-800">
              Không tải được dữ liệu
            </h3>
            <p className="mb-4 text-rose-700">
              {error?.message || "Lỗi không xác định"}
            </p>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-rose-600 px-6 py-2 text-white hover:bg-rose-700"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Danh sách hồ sơ merchant
                  </h2>
                  <p className="text-sm text-slate-500">
                    {showTabs
                      ? "Chuyển tab để xem hồ sơ đang chờ Staff nhận xử lý hoặc hồ sơ đã duyệt."
                      : "Theo dõi nhóm hồ sơ đang chọn từ sidebar bên trái."}
                  </p>
                </div>
                {showTabs ? (
                  <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-semibold text-slate-600">
                    {tabItems.map((item) => {
                      const isActive = activeTab === item.key;

                      return (
                        <button
                          key={item.key}
                          onClick={() => setSelectedTab(item.key)}
                          className={`rounded-full px-4 py-2 transition-colors ${
                            isActive
                              ? "bg-cyan-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {item.label}
                          <span
                            className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-white text-slate-500"
                            }`}
                          >
                            {item.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-lg ${
                      activeTab === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <ActiveTabIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {activeTabMeta.label}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {activeTabMeta.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    activeTab === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {activeTabMeta.count} hồ sơ
                </span>
              </div>

              <ApplicationTable
                applications={activeApplications}
                emptyText={activeEmptyText}
                basePath={basePath}
                canReview={canReview}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
