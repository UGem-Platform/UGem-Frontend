import AdminApplicationDetailPage from "./AdminApplicationDetailPage";

export default function AdminJobDetailPage() {
  return (
    <AdminApplicationDetailPage
      basePath="/admin/jobs"
      fallbackName="Admin"
      canReview={false}
    />
  );
}
