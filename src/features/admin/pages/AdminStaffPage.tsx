import { UserAccountMenu } from "@/shared/components";
import { useStaffList } from "../hooks/useStaff";
import type { Staff } from "../services/staffService";

export default function AdminStaffPage() {
  const { data: staffList = [], isLoading, isError, error } = useStaffList();

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
          <UserAccountMenu fallbackName="Admin" />
        </div>

        {isLoading ? (
          <p>Đang tải...</p>
        ) : isError ? (
          <p className="text-red-600">
            Lỗi:{" "}
            {error instanceof Error
              ? error.message
              : "Không tải được danh sách"}
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm backdrop-blur">
            <table className="w-full">
              <thead className="bg-cyan-50 text-left text-sm">
                <tr>
                  <th className="p-4">Tên nhân viên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {staffList.length > 0 ? (
                  staffList.map((staff: Staff, idx: number) => (
                    <tr key={staff.id || idx} className="border-t">
                      <td className="p-4">
                        {staff.name || staff.fullName || "N/A"}
                      </td>
                      <td className="p-4">{staff.email || "N/A"}</td>
                      <td className="p-4">{staff.role || "Staff"}</td>
                      <td className="p-4 text-slate-600">
                        Theo dõi trong trang quản lý job
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan={4}>
                      Chưa có nhân viên nào.
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
