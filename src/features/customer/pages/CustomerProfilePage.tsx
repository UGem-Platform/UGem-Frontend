import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  IdCard,
  Image,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { getCurrentUser } from "@/features/auth";
import { UserAccountMenu } from "@/shared/components";
import { Button } from "@/shared/components/ui/button";
import { notify } from "@/shared/lib/notify";
import {
  getUserProfile,
  updateUserProfile,
  type UserProfile,
} from "@/shared/services";
import {
  getMyReviewerApplication,
  type ReviewerApplication,
} from "@/features/review/services";

function getInitial(name?: string) {
  return (name || "C").trim().charAt(0).toUpperCase() || "C";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Có lỗi xảy ra, vui lòng thử lại.";
}

export default function CustomerProfilePage() {
  const currentUser = getCurrentUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewerApp, setReviewerApp] = useState<ReviewerApplication | null>(
    null,
  );

  const displayName =
    profile?.fullName || profile?.name || currentUser?.Name || "Customer";

  const email = profile?.email || currentUser?.Email || "-";

  const roleLabel = profile?.role || currentUser?.Role || "Customer";

  const phoneNumber = profile?.phoneNumber || "Chưa cập nhật";

  const userId = currentUser?.UserId || profile?.userId || profile?.id || "-";

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setIsLoading(true);

      try {
        const data = await getUserProfile();

        if (!active) return;

        setProfile(data ?? null);
        setFullName(data?.fullName || data?.name || currentUser?.Name || "");
        setAvatarUrl(data?.avatarUrl || "");
      } catch (error) {
        console.error(error);

        if (active) {
          notify.error("Không tải được hồ sơ Customer.");
          setFullName(currentUser?.Name || "");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    const loadReviewerApp = async () => {
      try {
        const data = await getMyReviewerApplication();
        if (active) setReviewerApp(data);
      } catch {
        // reviewer application not found is normal for most customers
      }
    };

    void loadProfile();
    void loadReviewerApp();

    return () => {
      active = false;
    };
  }, [currentUser?.Name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedAvatar = avatarUrl.trim();

    if (!trimmedName) {
      notify.error("Tên Customer không được để trống.");
      return;
    }

    const toastId = notify.loading("Đang cập nhật hồ sơ Customer...");
    setIsSaving(true);

    try {
      await updateUserProfile({
        fullName: trimmedName,
        avatarUrl: trimmedAvatar || undefined,
      });

      const nextProfile = await getUserProfile();

      setProfile(nextProfile ?? null);

      setFullName(nextProfile?.fullName || nextProfile?.name || trimmedName);

      setAvatarUrl(nextProfile?.avatarUrl || trimmedAvatar);

      window.dispatchEvent(new Event("ugem:profile-updated"));

      notify.success("Đã cập nhật hồ sơ Customer.", {
        id: toastId,
      });
    } catch (error) {
      console.error(error);

      notify.error("Cập nhật hồ sơ thất bại.", {
        id: toastId,
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#edfafa_0%,#f7fbfc_34%,#ffffff_100%)] text-slate-950">
      <header className="border-b border-white/80 bg-white/75 shadow-sm shadow-cyan-950/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-3xl font-black">UGem</h1>
            <p className="text-sm font-medium text-slate-500">
              Quản lý thông tin tài khoản Customer
            </p>
          </div>

          <UserAccountMenu fallbackName="Customer" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-5">
        <div className="relative">
          <div className="sticky top-4 z-30 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/55 p-3 backdrop-blur-xl ring-1 ring-slate-950/5">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700 shadow-sm shadow-cyan-950/5">
                Customer Profile
              </div>

              <h2 className="break-words text-3xl font-black tracking-tight text-slate-950">
                Profile Customer
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Tên và avatar sẽ được dùng trong menu tài khoản.
              </p>
            </div>

            <Button
              asChild
              type="button"
              variant="outline"
              className="h-10 shrink-0 gap-2 rounded-2xl border-white/70 bg-white/80 px-4 font-black shadow-sm ring-1 ring-slate-950/5"
            >
              <Link to="/customer">
                <ArrowLeft className="h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 shadow-2xl shadow-cyan-950/10 ring-1 ring-slate-950/5 backdrop-blur-2xl">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/25 blur-2xl" />
              <div className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-amber-300/25 blur-2xl" />

              <div className="relative border-b border-white/70 p-6">
                <div className="grid place-items-center text-center">
                  <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-[28px] bg-cyan-100 text-4xl font-black text-cyan-800 shadow-xl shadow-cyan-900/10 ring-1 ring-white/70">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitial(displayName)
                    )}
                  </div>

                  <h3 className="mt-5 max-w-full truncate text-2xl font-black tracking-tight text-slate-950">
                    {displayName}
                  </h3>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                    {email}
                  </p>

                  <span className="mt-4 inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 shadow-sm">
                    {roleLabel}
                  </span>
                </div>
              </div>

              <div className="relative space-y-3 p-5 text-sm">
                <ProfileInfoRow
                  icon={ShieldCheck}
                  label="Vai trò"
                  value={roleLabel}
                />

                <ProfileInfoRow icon={Mail} label="Email" value={email} />

                <ProfileInfoRow
                  icon={Phone}
                  label="Số điện thoại"
                  value={phoneNumber}
                />

                <ProfileInfoRow icon={IdCard} label="User ID" value={userId} />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-cyan-950/10 ring-1 ring-slate-950/5 backdrop-blur-2xl">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
              <div className="absolute -bottom-14 -left-14 h-36 w-36 rounded-full bg-amber-300/20 blur-2xl" />

              <div className="relative mb-6 flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-800 shadow-sm ring-1 ring-cyan-100">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-black text-slate-950">
                    Thông tin hiển thị
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Bạn có thể cập nhật tên hiển thị và avatar.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-12 animate-pulse rounded-2xl bg-slate-100/80" />
                  <div className="h-12 animate-pulse rounded-2xl bg-slate-100/80" />
                  <div className="h-28 animate-pulse rounded-2xl bg-slate-100/80" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative space-y-5">
                  <label className="block">
                    <span className="text-sm font-black text-slate-800">
                      Tên Customer
                    </span>

                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/80 px-4 text-sm font-semibold text-slate-950 shadow-sm ring-1 ring-slate-950/5 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                      placeholder="Nhập tên hiển thị"
                      disabled={isSaving}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-slate-800">
                      Avatar URL
                    </span>

                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 shadow-sm ring-1 ring-slate-950/5 transition focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/15">
                      <Image className="h-4 w-4 shrink-0 text-slate-400" />

                      <input
                        value={avatarUrl}
                        onChange={(event) => setAvatarUrl(event.target.value)}
                        className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                        placeholder="https://..."
                        disabled={isSaving}
                      />
                    </div>
                  </label>

                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-6 text-cyan-900 shadow-sm">
                    Email, role và số điện thoại đang là thông tin đồng bộ từ hệ
                    thống nên chỉ hiển thị tại đây.
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-12 rounded-2xl bg-cyan-600 px-5 font-black text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:hover:translate-y-0"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Lưu thay đổi
                  </Button>
                </form>
              )}
            </section>

            {/* Reviewer application status */}
            {reviewerApp && (
              <section className="relative col-span-full overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-violet-950/10 ring-1 ring-slate-950/5 backdrop-blur-2xl">
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-300/20 blur-2xl" />
                <div className="relative mb-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-100">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      Đơn đăng ký Reviewer
                    </h3>
                    <p className="text-xs text-slate-500">
                      Trạng thái đơn đăng ký làm Reviewer của bạn
                    </p>
                  </div>
                  <ReviewerStatusBadge status={reviewerApp.status} />
                </div>
                {reviewerApp.motivation && (
                  <p className="relative text-sm text-slate-600">
                    <span className="font-black text-slate-800">
                      Động lực:{" "}
                    </span>
                    {reviewerApp.motivation}
                  </p>
                )}
                {reviewerApp.rejectionReason && (
                  <p className="relative mt-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                    Lý do từ chối: {reviewerApp.rejectionReason}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm ring-1 ring-slate-950/5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-cyan-100">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-black text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function ReviewerStatusBadge({ status }: { status?: string }) {
  const v = status?.toLowerCase();
  if (v === "accepted" || v === "approved") {
    return (
      <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700 shadow-sm">
        <ShieldCheck className="h-3.5 w-3.5" />
        Đã chấp thuận
      </span>
    );
  }
  if (v === "rejected") {
    return (
      <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-black text-rose-700 shadow-sm">
        Đã từ chối
      </span>
    );
  }
  return (
    <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700 shadow-sm">
      Chờ duyệt
    </span>
  );
}
