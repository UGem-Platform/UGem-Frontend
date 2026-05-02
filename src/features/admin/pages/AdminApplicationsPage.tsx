import { useEffect } from "react";
import { useStaffApplications } from "../hooks/useApplications";
import { Link } from "react-router-dom";
import { getStaffApplications } from "../services/applicationService";
import type { Application } from "../types";
import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { notify } from "@/shared/lib/notify";

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function getApplicationBadgeClass(status?: string) {
  if (status === "Approved") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "Rejected") {
    return "bg-rose-100 text-rose-800";
  }

  return "bg-amber-100 text-amber-800";
}

export default function AdminApplicationsPage() {
  const {
    data: applications = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useStaffApplications();

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
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Duyệt hồ sơ Merchant</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {isRefetching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 w-64 animate-pulse rounded bg-slate-200"></div>
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded bg-slate-200"
                ></div>
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
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm backdrop-blur">
            <table className="w-full">
              <thead className="bg-cyan-50 text-left text-sm">
                <tr>
                  <th className="p-4">Tên quán</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Ngày gửi</th>
                  <th className="p-4">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {(applications as Application[]).map((app) => {
                  const badgeClass = getApplicationBadgeClass(app.status);

                  return (
                    <tr key={app.id} className="border-t hover:bg-cyan-50">
                      <td className="p-4">{app.name || "Không tên"}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${badgeClass}`}
                        >
                          {app.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">{formatDate(app.createdAt)}</td>
                      <td className="p-4">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          state={{ application: app }}
                          className="text-cyan-700 hover:underline"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {(applications as Application[]).length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan={4}>
                      Chưa có hồ sơ Pending nào
                      {isRefetching && " (đang cập nhật...)"}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
