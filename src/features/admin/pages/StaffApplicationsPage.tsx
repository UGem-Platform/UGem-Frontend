import AdminApplicationsPage from "./AdminApplicationsPage";

export default function StaffApplicationsPage() {
  return (
    <AdminApplicationsPage
      basePath="/staff/applications"
      title="Job duyệt hồ sơ Merchant"
      subtitle="Hàng đợi hồ sơ merchant cần Staff kiểm tra và xử lý."
      fallbackName="Staff"
      canReview
    />
  );
}
