import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStaffApplications } from "../services/applicationService";
import type { Application } from "../types";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const data = await getStaffApplications();
      setApplications(data);
    } catch (error) {
      console.error(error);
      alert("Không tải được danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-5 text-2xl font-bold">Duyệt hồ sơ Merchant</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-100 text-left text-sm">
                <tr>
                  <th className="p-4">Tên quán</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Ngày gửi</th>
                  <th className="p-4">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-t">
                    <td className="p-4">
                      {app.merchantName || app.businessName || "Không tên"}
                    </td>
                    <td className="p-4">{app.status || "Pending"}</td>
                    <td className="p-4">
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        state={{ application: app }}
                        className="text-blue-600"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}

                {applications.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-gray-500" colSpan={4}>
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
