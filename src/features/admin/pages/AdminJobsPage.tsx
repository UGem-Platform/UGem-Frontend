import { Link } from "react-router-dom";
import AdminApplicationsPage from "./AdminApplicationsPage";

export default function AdminJobsPage() {
  return (
    <AdminApplicationsPage
      basePath="/admin/jobs"
      title="Quản lý job Staff"
      subtitle="Admin theo dõi toàn bộ job duyệt hồ sơ và kết quả xử lý của Staff."
      fallbackName="Admin"
      canReview={false}
      secondaryAction={
        <Link
          to="/admin/staff"
          className="inline-flex items-center rounded-lg border border-cyan-100 bg-white px-4 py-2 font-semibold text-cyan-700 hover:bg-cyan-50"
        >
          Quản lý Staff
        </Link>
      }
    />
  );
}
