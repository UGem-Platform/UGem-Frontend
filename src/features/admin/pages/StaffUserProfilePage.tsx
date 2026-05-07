import { useEffect, useState, type FormEvent } from "react";
import {
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
import { StaffShell } from "../components/StaffShell";

function getInitial(name?: string) {
  return (name || "S").trim().charAt(0).toUpperCase() || "S";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Có lỗi xảy ra, vui lòng thử lại.";
}

export default function StaffUserProfilePage() {
  const currentUser = getCurrentUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const displayName =
    profile?.fullName || profile?.name || currentUser?.Name || "Staff";
  const email = profile?.email || currentUser?.Email || "-";
  const roleLabel = profile?.role || currentUser?.Role || "Staff";
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
          notify.error("Không tải được hồ sơ Staff.");
          setFullName(currentUser?.Name || "");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [currentUser?.Name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedAvatar = avatarUrl.trim();

    if (!trimmedName) {
      notify.error("Tên Staff không được để trống.");
      return;
    }

    const toastId = notify.loading("Đang cập nhật hồ sơ Staff...");
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

      notify.success("Đã cập nhật hồ sơ Staff.", { id: toastId });
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
    <StaffShell activeItem="profile">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Profile Staff</h1>
            <p className="mt-1 text-sm text-slate-600">
              Quản lý thông tin hiển thị và tài khoản Staff đang đăng nhập.
            </p>
          </div>

          <UserAccountMenu fallbackName="Staff" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-xl shadow-cyan-950/10 backdrop-blur">
            <div className="border-b border-slate-100 p-6">
              <div className="grid place-items-center text-center">
                <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-cyan-100 text-3xl font-black text-cyan-800">
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
                <h2 className="mt-4 max-w-full truncate text-xl font-black text-slate-950">
                  {displayName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{email}</p>
              </div>
            </div>

            <div className="space-y-3 p-5 text-sm">
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

          <section className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-cyan-950/10 backdrop-blur">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-800">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Thông tin hiển thị
                </h2>
                <p className="text-sm text-slate-500">
                  Tên và avatar sẽ được dùng trong menu tài khoản.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-3">
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="text-sm font-bold text-slate-800">
                    Tên Staff
                  </span>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                    placeholder="Nhập tên hiển thị"
                    disabled={isSaving}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-800">
                    Avatar URL
                  </span>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/15">
                    <Image className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      value={avatarUrl}
                      onChange={(event) => setAvatarUrl(event.target.value)}
                      className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      placeholder="https://..."
                      disabled={isSaving}
                    />
                  </div>
                </label>

                <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-6 text-cyan-900">
                  Email, role và số điện thoại đang là thông tin đồng bộ từ hệ
                  thống nên chỉ hiển thị tại đây.
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 bg-cyan-600 px-5 font-bold text-white hover:bg-cyan-700"
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
        </div>
      </div>
    </StaffShell>
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
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-cyan-700">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 break-all font-bold text-slate-950">{value}</p>
      </div>
    </div>
  );
}
