import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  CheckCircle2,
  Hourglass,
  Loader2,
  UserRound,
  XCircle,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { notify } from "@/shared/lib/notify";
import {
  getStaffList,
  acceptReviewerApplication,
  rejectReviewerApplication,
} from "../services/staffService";
import { StaffShell } from "../components/StaffShell";

type ReviewerApp = {
  id?: string;
  status?: string;
  motivation?: string;
  experience?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  otherSocialUrl?: string;
  rejectionReason?: string;
  customerId?: string;
  createdAt?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function StatusBadge({ status }: { status?: string }) {
  const v = status?.toLowerCase();
  if (v === "accept" || v === "accepted" || v === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700 shadow-sm">
        <BadgeCheck className="h-3.5 w-3.5" />
        Đã duyệt
      </span>
    );
  }
  if (v === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-black text-rose-700 shadow-sm">
        <XCircle className="h-3.5 w-3.5" />
        Từ chối
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700 shadow-sm">
      <Hourglass className="h-3.5 w-3.5" />
      Chờ duyệt
    </span>
  );
}

const REVIEWER_APPS_QK = ["reviewer-applications", "staff"] as const;

export default function StaffReviewerApplicationsPage() {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    id: string;
    reason: string;
  } | null>(null);

  const {
    data: apps = [],
    isLoading,
    isError,
  } = useQuery<ReviewerApp[]>({
    queryKey: REVIEWER_APPS_QK,
    queryFn: async () => {
      const result = await getStaffList();
      // BE trả về paginated: { items: [...], totalItems, pageSize, pageIndex }
      if (result && typeof result === "object" && "items" in result) {
        return (
          ((result as Record<string, unknown>).items as ReviewerApp[]) ?? []
        );
      }
      return Array.isArray(result) ? (result as ReviewerApp[]) : [];
    },
    staleTime: 1000 * 60,
  });

  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: REVIEWER_APPS_QK });

  const handleAccept = async (id: string) => {
    setProcessing(id);
    try {
      await acceptReviewerApplication(id);
      notify.success("Đã chấp thuận đơn Reviewer.");
      refresh();
    } catch {
      notify.error("Không thể chấp thuận đơn này.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectModal.reason.trim()) {
      notify.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    setProcessing(rejectModal.id);
    try {
      await rejectReviewerApplication(rejectModal.id, rejectModal.reason);
      notify.success("Đã từ chối đơn Reviewer.");
      setRejectModal(null);
      refresh();
    } catch {
      notify.error("Không thể từ chối đơn này.");
    } finally {
      setProcessing(null);
    }
  };

  const pending = apps.filter(
    (a) => !a.status || a.status.toLowerCase() === "pending",
  );
  const reviewed = apps.filter(
    (a) => a.status && a.status.toLowerCase() !== "pending",
  );

  return (
    <StaffShell activeItem="reviewer-applications">
      <div className="relative">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/55 p-3 backdrop-blur-xl ring-1 ring-slate-950/5">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-violet-700 shadow-sm">
              Reviewer Applications
            </div>
            <h1 className="wrap-break-word text-3xl font-black tracking-tight text-slate-950">
              Đơn đăng ký Reviewer
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Xét duyệt đơn đăng ký làm Reviewer từ các Customer.
            </p>
          </div>
        </div>

        {isError && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            Không tải được danh sách đơn Reviewer. Vui lòng thử lại.
          </div>
        )}

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-amber-700">
                Chờ duyệt ({pending.length})
              </p>
              {pending.length === 0 ? (
                <p className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-950/5">
                  Không có đơn nào đang chờ duyệt.
                </p>
              ) : (
                <div className="space-y-3">
                  {pending.map((app) => (
                    <ReviewerAppCard
                      key={app.id}
                      app={app}
                      processing={processing}
                      onAccept={handleAccept}
                      onReject={(id) => setRejectModal({ id, reason: "" })}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-emerald-700">
                Đã xử lý ({reviewed.length})
              </p>
              {reviewed.length === 0 ? (
                <p className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-950/5">
                  Chưa có đơn nào được xử lý.
                </p>
              ) : (
                <div className="space-y-3">
                  {reviewed.map((app) => (
                    <ReviewerAppCard
                      key={app.id}
                      app={app}
                      processing={processing}
                      readOnly
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-2xl ring-1 ring-slate-950/5 backdrop-blur-2xl">
            <div className="border-b border-white/70 p-6">
              <h2 className="text-xl font-black text-slate-950">
                Lý do từ chối
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Nhập lý do để Customer biết đơn của họ chưa đạt.
              </p>
            </div>

            <div className="p-6">
              <textarea
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal({ ...rejectModal, reason: e.target.value })
                }
                rows={4}
                className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm ring-1 ring-slate-950/5 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15"
                placeholder="Ví dụ: Thông tin chưa đầy đủ, chưa có kinh nghiệm thực tế..."
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-white/70 p-4">
              <Button
                variant="outline"
                onClick={() => setRejectModal(null)}
                className="rounded-2xl"
              >
                Huỷ
              </Button>
              <Button
                onClick={() => void handleReject()}
                disabled={!!processing}
                className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </StaffShell>
  );
}

function ReviewerAppCard({
  app,
  processing,
  readOnly = false,
  onAccept,
  onReject,
}: {
  app: ReviewerApp;
  processing: string | null;
  readOnly?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const id = app.id ?? "";
  const isProcessing = processing === id;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-950/5 ring-1 ring-slate-950/5 backdrop-blur-xl">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-300/10 blur-2xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-100">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-950">
              Customer ID: {app.customerId ?? "-"}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              Gửi lúc {formatDate(app.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {app.motivation && (
        <p className="relative mt-3 text-sm leading-6 text-slate-600">
          <span className="font-black text-slate-800">Động lực: </span>
          {app.motivation}
        </p>
      )}

      {app.rejectionReason && (
        <p className="relative mt-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
          Lý do từ chối: {app.rejectionReason}
        </p>
      )}

      <div className="relative mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        {app.facebookUrl && (
          <a
            href={app.facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700 hover:bg-blue-100"
          >
            Facebook ↗
          </a>
        )}
        {app.tiktokUrl && (
          <a
            href={app.tiktokUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 hover:bg-slate-100"
          >
            TikTok ↗
          </a>
        )}
        {app.youtubeUrl && (
          <a
            href={app.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1 text-rose-700 hover:bg-rose-100"
          >
            YouTube ↗
          </a>
        )}
        {app.otherSocialUrl && (
          <a
            href={app.otherSocialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 hover:bg-slate-100"
          >
            Link khác ↗
          </a>
        )}
      </div>

      {!readOnly && (
        <div className="relative mt-4 flex gap-2">
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => onAccept?.(id)}
            className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-md hover:bg-emerald-700"
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Chấp thuận
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isProcessing}
            onClick={() => onReject?.(id)}
            className="h-9 rounded-xl border-rose-200 px-4 text-xs font-black text-rose-700 hover:bg-rose-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Từ chối
          </Button>
        </div>
      )}
    </div>
  );
}
