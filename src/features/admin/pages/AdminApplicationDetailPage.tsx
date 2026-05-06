import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  ImageOff,
  Loader2,
  Mail,
  Phone,
  Store,
  UserRound,
  Utensils,
  XCircle,
} from "lucide-react";
import {
  acceptApplication,
  rejectApplication,
} from "../services/applicationService";
import { getApplicationsQueryKey } from "../hooks/useApplications";
import type { Application } from "../types";
import { notify } from "@/shared/lib/notify";
import { UserAccountMenu } from "@/shared/components";
import { getCurrentUser } from "@/features/auth";
import { getCategories } from "@/shared/services/categoryService";
import type { Category } from "@/shared/types";

type SubmitAction = "accept" | "reject";

function formatDate(value?: string | null, fallback = "-") {
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

function formatMoney(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Chưa nhập";
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Có lỗi xảy ra, vui lòng thử lại.";
}

function getStatusMeta(status?: string) {
  if (status === "Approved" || status === "Accepted") {
    return {
      label: "Đã duyệt",
      icon: BadgeCheck,
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      soft: "bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "Rejected") {
    return {
      label: "Đã từ chối",
      icon: XCircle,
      badge: "border-rose-200 bg-rose-50 text-rose-700",
      soft: "bg-rose-50 text-rose-700",
    };
  }

  return {
    label: "Chờ duyệt",
    icon: Clock3,
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    soft: "bg-amber-50 text-amber-700",
  };
}

function getInitials(name?: string) {
  const parts = (name || "UGem").trim().split(/\s+/).filter(Boolean);

  return parts
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function parseApplicationDescription(description?: string) {
  const lines = (description || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const markerIndex = lines.findIndex((line) =>
    line.toLowerCase().includes("thông tin ui bổ sung"),
  );
  const knownLabels = [
    "Loại hình quán",
    "Loại món chính",
    "Khoảng giá trung bình",
  ];

  const metaLines =
    markerIndex >= 0
      ? lines.slice(markerIndex + 1)
      : lines.filter((line) =>
          knownLabels.some((label) => line.startsWith(`${label}:`)),
        );
  const summaryLines =
    markerIndex >= 0
      ? lines.slice(0, markerIndex)
      : lines.filter(
          (line) => !knownLabels.some((label) => line.startsWith(`${label}:`)),
        );

  const facts = metaLines
    .map((line) => {
      const [label, ...valueParts] = line.split(":");
      return {
        label: label.trim(),
        value: valueParts.join(":").trim(),
      };
    })
    .filter((item) => item.label && item.value);

  return {
    summary: summaryLines.join("\n") || "Chưa có mô tả quán.",
    facts,
  };
}

function isGuidLike(value?: string | null) {
  return Boolean(
    value?.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    ),
  );
}

type ApplicationDetailPageProps = {
  basePath?: string;
  fallbackName?: string;
  canReview?: boolean;
};

export default function AdminApplicationDetailPage({
  basePath = "/staff/applications",
  fallbackName = "Staff",
  canReview = true,
}: ApplicationDetailPageProps) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserRole = getCurrentUser()?.Role;
  const applicationsQueryKey = getApplicationsQueryKey(currentUserRole);

  const application = location.state?.application as Application | undefined;

  const [reason, setReason] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [submittingAction, setSubmittingAction] = useState<SubmitAction | null>(
    null,
  );

  const descriptionInfo = useMemo(
    () => parseApplicationDescription(application?.description),
    [application?.description],
  );
  const categoryNameById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => {
        console.error("Không tải được danh mục:", error);
      });
  }, []);

  if (!application) {
    return (
      <main className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-10">
        <div className="mx-auto mb-5 flex max-w-xl justify-end">
          <UserAccountMenu fallbackName={fallbackName} />
        </div>
        <section className="mx-auto max-w-xl rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-xl shadow-cyan-950/10 backdrop-blur">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <FileText className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black text-slate-950">
            Không có dữ liệu hồ sơ
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Hãy quay lại danh sách và mở lại hồ sơ cần duyệt.
          </p>
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-900/15 transition hover:bg-cyan-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </button>
        </section>
      </main>
    );
  }

  const name = application.name || "Không tên";
  const statusMeta = getStatusMeta(application.status);
  const StatusIcon = statusMeta.icon;
  const isPendingStatus =
    !application.status || application.status.toLowerCase() === "pending";
  const menuItems = application.applicationMenus ?? [];
  const heroImage = menuItems.find((item) => item.imageUrl)?.imageUrl;
  const applicant = application.applicant;
  const submitting = submittingAction !== null;

  function getCategoryLabel(category?: string) {
    const trimmedCategory = category?.trim();
    if (!trimmedCategory) return "";

    return categoryNameById.get(trimmedCategory) ?? trimmedCategory;
  }

  async function refreshApplicationsCache(nextStatus: "Approved" | "Rejected") {
    const reviewedAt = new Date().toISOString();

    queryClient.setQueryData<Application[]>(applicationsQueryKey, (current) =>
      current?.map((item) =>
        item.id === id ? { ...item, status: nextStatus, reviewedAt } : item,
      ),
    );

    await queryClient.invalidateQueries({
      queryKey: applicationsQueryKey,
    });
  }

  async function handleAccept() {
    if (!id || !isPendingStatus) return;

    const toastId = notify.loading("Đang duyệt hồ sơ...", {
      description: `UGem đang tạo hồ sơ merchant cho ${name}.`,
    });

    setSubmittingAction("accept");

    try {
      await acceptApplication(id);
      notify.success("Duyệt hồ sơ thành công", {
        id: toastId,
        description: `${name} đã được chuyển sang trạng thái merchant.`,
      });
      await refreshApplicationsCache("Approved");
      navigate(basePath);
    } catch (error) {
      console.error(error);
      notify.error("Duyệt hồ sơ thất bại", {
        id: toastId,
        description: getErrorMessage(error),
      });
    } finally {
      setSubmittingAction(null);
    }
  }

  async function handleReject() {
    if (!id || !isPendingStatus) return;

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      notify.error("Thiếu lý do từ chối", {
        description: "Nhập lý do rõ ràng để merchant biết cần chỉnh gì.",
      });
      return;
    }

    const toastId = notify.loading("Đang từ chối hồ sơ...", {
      description: `Đang gửi phản hồi cho ${name}.`,
    });

    setSubmittingAction("reject");

    try {
      await rejectApplication(id, trimmedReason);
      notify.success("Đã từ chối hồ sơ", {
        id: toastId,
        description: "Lý do từ chối đã được ghi nhận.",
      });
      await refreshApplicationsCache("Rejected");
      navigate(basePath);
    } catch (error) {
      console.error(error);
      notify.error("Từ chối hồ sơ thất bại", {
        id: toastId,
        description: getErrorMessage(error),
      });
    } finally {
      setSubmittingAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-2 text-sm font-bold text-cyan-800 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
          <UserAccountMenu fallbackName={fallbackName} />
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-cyan-950/10 backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
            <div className="relative min-h-72 bg-slate-100">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={name}
                  className="h-full min-h-72 w-full object-cover"
                />
              ) : (
                <div className="grid h-full min-h-72 place-items-center bg-linear-to-br from-cyan-100 via-white to-amber-100 text-cyan-800">
                  <Store className="h-16 w-16" />
                </div>
              )}
              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-slate-900 shadow-sm backdrop-blur">
                <StatusIcon className="h-4 w-4" />
                {statusMeta.label}
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                    Hồ sơ Merchant
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    {name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold ${statusMeta.badge}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {statusMeta.label}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-bold text-slate-700">
                      {application.type || "Merchant"}
                    </span>
                  </div>
                </div>

                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white shadow-lg shadow-cyan-900/20">
                  {getInitials(name)}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <CalendarClock className="mb-3 h-5 w-5 text-cyan-700" />
                  <p className="text-xs font-bold text-slate-500">Ngày gửi</p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {formatDate(application.createdAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <ClipboardList className="mb-3 h-5 w-5 text-cyan-700" />
                  <p className="text-xs font-bold text-slate-500">Menu</p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {menuItems.length} món gửi kèm
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <Clock3 className="mb-3 h-5 w-5 text-cyan-700" />
                  <p className="text-xs font-bold text-slate-500">Rà soát</p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {isPendingStatus
                      ? "Chưa xử lý"
                      : formatDate(application.reviewedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-lg shadow-cyan-950/5 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-800">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Tổng quan hồ sơ
                  </h2>
                  <p className="text-sm text-slate-500">
                    Thông tin merchant gửi để staff thẩm định.
                  </p>
                </div>
              </div>

              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                {descriptionInfo.summary}
              </p>

              {descriptionInfo.facts.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {descriptionInfo.facts.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4"
                    >
                      <p className="text-xs font-bold text-cyan-700">
                        {item.label}
                      </p>
                      <p className="mt-1 wrap-break-word text-sm font-black text-slate-950">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-lg shadow-cyan-950/5 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Menu gửi kèm
                  </h2>
                  <p className="text-sm text-slate-500">
                    Kiểm tra ảnh, giá, mô tả và danh mục món.
                  </p>
                </div>
              </div>

              {menuItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {menuItems.map((item, index) => (
                    <article
                      key={item.id || `${item.name}-${index}`}
                      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-44 w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-44 place-items-center bg-slate-50 px-4 text-center text-slate-400">
                          <div>
                            <ImageOff className="mx-auto h-9 w-9" />
                            <p className="mt-2 text-xs font-bold">
                              Chưa có ảnh món
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              {item.name || `Món #${index + 1}`}
                            </p>
                            {(() => {
                              const rawCategory = item.category?.trim() ?? "";
                              const categoryLabel =
                                getCategoryLabel(rawCategory);

                              if (!categoryLabel) return null;

                              return (
                                <p className="mt-1 wrap-break-word text-xs font-bold text-cyan-700">
                                  {categoryLabel}
                                  {isGuidLike(rawCategory) &&
                                    !categoryNameById.has(rawCategory) &&
                                    " (chưa map được tên)"}
                                </p>
                              );
                            })()}
                          </div>
                          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                            {formatMoney(item.price)}
                          </span>
                        </div>

                        {item.description && (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                  Không có menu gửi kèm.
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-lg shadow-cyan-950/5 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Người nộp
                  </h2>
                  <p className="text-sm text-slate-500">Tài khoản gửi hồ sơ.</p>
                </div>
              </div>

              {applicant ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-cyan-700 text-sm font-black text-white">
                      {applicant.avatarUrl ? (
                        <img
                          src={applicant.avatarUrl}
                          alt={applicant.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(applicant.fullName)
                      )}
                    </div>
                    <div>
                      <p className="font-black text-slate-950">
                        {applicant.fullName || "Chưa cập nhật"}
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        Merchant applicant
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2 break-all text-slate-700">
                      <Mail className="h-4 w-4 shrink-0 text-cyan-700" />
                      {applicant.email || "Chưa có email"}
                    </p>
                    <p className="flex items-center gap-2 text-slate-700">
                      <Phone className="h-4 w-4 shrink-0 text-cyan-700" />
                      {applicant.phoneNumber || "Chưa có số điện thoại"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Hồ sơ chưa có thông tin người nộp.
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-lg shadow-cyan-950/5 backdrop-blur">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Xử lý hồ sơ
                  </h2>
                  <p className="text-sm text-slate-500">
                    Duyệt khi thông tin hợp lệ, từ chối nếu cần bổ sung.
                  </p>
                </div>
                <span
                  className={`grid h-10 w-10 place-items-center rounded-2xl ${statusMeta.soft}`}
                >
                  <StatusIcon className="h-5 w-5" />
                </span>
              </div>

              {!canReview ? (
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm font-semibold leading-6 text-cyan-800">
                  Admin đang xem job ở chế độ quản lý. Quyền duyệt hoặc từ chối
                  hồ sơ được tách cho Staff xử lý.
                </div>
              ) : (
                <>
                  {!isPendingStatus && (
                    <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                      Hồ sơ này đã được xử lý, không thể thao tác lại.
                    </div>
                  )}

                  <label className="block">
                    <span className="text-sm font-bold text-slate-800">
                      Lý do từ chối
                    </span>
                    <textarea
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Ví dụ: Cần bổ sung ảnh món rõ hơn hoặc thông tin quán chưa đủ tin cậy..."
                      className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 disabled:bg-slate-50"
                      disabled={submitting || !isPendingStatus}
                    />
                  </label>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={submitting || !isPendingStatus}
                      onClick={handleAccept}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingAction === "accept" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Duyệt
                    </button>

                    <button
                      type="button"
                      disabled={submitting || !isPendingStatus}
                      onClick={handleReject}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 text-sm font-black text-white shadow-lg shadow-rose-900/15 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingAction === "reject" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                      Từ chối
                    </button>
                  </div>
                </>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
