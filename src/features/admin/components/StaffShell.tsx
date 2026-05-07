import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  IdCard,
  LayoutDashboard,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useStaffApplications } from "../hooks/useApplications";

export type StaffNavItemKey = "dashboard" | "pending" | "approved" | "profile";

type StaffShellProps = {
  activeItem: StaffNavItemKey;
  children: ReactNode;
};

const staffNavItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/staff/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "pending",
    label: "Hồ sơ chờ duyệt",
    to: "/staff/applications",
    icon: Clock3,
  },
  {
    key: "approved",
    label: "Hồ sơ đã duyệt",
    to: "/staff/applications/approved",
    icon: CheckCircle2,
  },
  {
    key: "profile",
    label: "Profile Staff",
    to: "/staff/profile",
    icon: IdCard,
  },
] satisfies {
  key: StaffNavItemKey;
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}[];

function isPendingStatus(status?: string) {
  return !status || status.toLowerCase() === "pending";
}

export function StaffShell({ activeItem, children }: StaffShellProps) {
  const { data: applications = [] } = useStaffApplications();
  const pendingCount = applications.filter((item) =>
    isPendingStatus(item.status),
  ).length;
  const approvedCount = applications.length - pendingCount;

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 text-slate-950">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-5 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-xl shadow-cyan-950/10 backdrop-blur">
            <div className="border-b border-slate-100 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                UGem Staff
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-950">
                Merchant Review
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Điều phối hồ sơ, KPI và thông tin cá nhân Staff.
              </p>
            </div>

            <nav className="grid gap-1 p-3">
              {staffNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.key;
                const count =
                  item.key === "pending"
                    ? pendingCount
                    : item.key === "approved"
                      ? approvedCount
                      : undefined;

                return (
                  <Link
                    key={item.key}
                    to={item.to}
                    className={cn(
                      "flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-bold transition",
                      isActive
                        ? "bg-cyan-600 text-white shadow-sm shadow-cyan-900/15"
                        : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-800",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {typeof count === "number" ? (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-black",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
