import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStaffApplications } from "../services/applicationService";
import type { Application } from "../types";
import { RefreshCw } from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadApplications = async () => {
    setLoading(true);

    try {
      const data = await getStaffApplications();
      setApplications(data ?? []);
    } catch (error) {
      console.error(error);
      alert("Không tải được danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      const data = await getStaffApplications();
      setApplications(data ?? []);
    } catch (error) {
      console.error(error);
      alert("Không tải được danh sách hồ sơ.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadApplications();
    });

    const interval = globalThis.setInterval(() => {
      void loadApplications();
    }, 5000);

    return () => {
      globalThis.clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Duyệt hồ sơ Merchant</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            {refreshing ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {loading ? (
          <p>Đang tải...</p>
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
                {applications.map((app) => {
                  const badgeClass =
                    app.status === "Approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : app.status === "Rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800";

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

                {applications.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan={4}>
                      Chưa có hồ sơ nào.
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
