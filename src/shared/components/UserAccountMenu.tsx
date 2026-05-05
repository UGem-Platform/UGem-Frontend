import { LogOut } from "lucide-react";

import { clearAuth, getCurrentUser } from "@/features/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { NotificationBellMenu } from "@/shared/components/NotificationBellMenu";
import { notify } from "@/shared/lib/notify";

type UserAccountMenuProps = {
  fallbackName: string;
  className?: string;
};

function getRoleLabel(role?: string) {
  if (role === "Customer") return "Customer";
  if (role === "Merchant") return "Merchant";
  if (role === "Staff") return "Staff";
  if (role === "Admin") return "Admin";
  return role || "";
}

export function UserAccountMenu({
  fallbackName,
  className,
}: UserAccountMenuProps) {
  const user = getCurrentUser();
  const displayName = user?.Name || fallbackName;
  const email = user?.Email || "";
  const roleLabel = getRoleLabel(user?.Role);
  const initial = (displayName || email || "U").trim().charAt(0).toUpperCase();

  function handleLogout() {
    notify.confirmLogout(() => {
      clearAuth();
      window.location.href = "/login";
    });
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl border border-cyan-100 bg-white/85 px-3 py-2 shadow-sm backdrop-blur",
        className,
      )}
    >
      <NotificationBellMenu />

      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">
        {initial}
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-950">
            {displayName}
          </p>
          {roleLabel ? (
            <span className="shrink-0 rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">
              {roleLabel}
            </span>
          ) : null}
        </div>
        {email ? (
          <p className="truncate text-xs text-slate-500">{email}</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="h-8 shrink-0 gap-1.5 text-xs"
      >
        <LogOut className="h-3.5 w-3.5" />
        Logout
      </Button>
    </div>
  );
}
