import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  acceptApplication,
  rejectApplication,
} from "../services/applicationService";
import type { Application } from "../types";

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const application = location.state?.application as Application | undefined;

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAccept() {
    if (!id) return;

    setSubmitting(true);

    try {
      await acceptApplication(id);
      alert("Đã duyệt hồ sơ.");
      navigate("/admin/applications");
    } catch (error) {
      console.error(error);
      alert("Duyệt hồ sơ thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!id) return;

    if (!reason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    setSubmitting(true);

    try {
      await rejectApplication(id, reason);
      alert("Đã từ chối hồ sơ.");
      navigate("/admin/applications");
    } catch (error) {
      console.error(error);
      alert("Từ chối hồ sơ thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!application) {
    return (
      <div className="p-5">
        Không có dữ liệu hồ sơ. Hãy quay lại danh sách và mở lại.
      </div>
    );
  }

  const name = application.name || "Không tên";

  function formatDate(value?: string | null) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/admin/applications")}
          className="mb-4 text-cyan-700"
        >
          ← Quay lại
        </button>

        <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-bold">{name}</h1>

          <p className="mt-2 text-sm text-slate-500">
            Trạng thái: {application.status || "Pending"}
          </p>

          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p>
              <b>Loại:</b> {application.type || "-"}
            </p>
            <p>
              <b>Ngày gửi:</b> {formatDate(application.createdAt)}
            </p>
            <p>
              <b>Ngày rà soát:</b> {formatDate(application.reviewedAt)}
            </p>
          </div>

          {application.applicant && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">Thông tin người nộp</p>
              <p>{application.applicant.fullName}</p>
              <p>{application.applicant.email}</p>
              <p>{application.applicant.phoneNumber}</p>
            </div>
          )}

          {application.description && (
            <p className="mt-3">
              <b>Mô tả:</b> {application.description}
            </p>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-lg font-semibold">Menu gửi kèm</h2>

          {application.applicationMenus?.map((item) => (
            <div key={item.id} className="border-b py-3 last:border-b-0">
              <p className="font-medium">{item.name}</p>
              <p className="text-cyan-700">
                {item.price.toLocaleString("vi-VN")}đ
              </p>
              {item.category && (
                <p className="text-sm text-slate-500">
                  Danh mục: {item.category}
                </p>
              )}
              {item.description && (
                <p className="text-sm text-slate-500">{item.description}</p>
              )}
            </div>
          ))}

          {!application.applicationMenus?.length && (
            <p className="text-slate-500">Không có menu.</p>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-lg font-semibold">Xử lý hồ sơ</h2>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do từ chối nếu reject..."
            className="mb-3 min-h-24 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-cyan-500"
          />

          <div className="flex gap-3">
            <button
              disabled={submitting}
              onClick={handleAccept}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-white disabled:opacity-50"
            >
              Duyệt
            </button>

            <button
              disabled={submitting}
              onClick={handleReject}
              className="rounded-xl bg-rose-600 px-5 py-3 text-white disabled:opacity-50"
            >
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
