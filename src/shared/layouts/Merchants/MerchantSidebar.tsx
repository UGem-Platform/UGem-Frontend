import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ClipboardPlus,
  Home,
  Megaphone,
  Store,
  Timer,
} from "lucide-react";
import { getCurrentUser } from "../../../features/auth";

const menuItems = [
  {
    label: "Nhà hàng của bạn",
    icon: Store,
    path: "/merchant/restaurant",
  },
  {
    label: "Tạo đơn tại quán",
    icon: ClipboardPlus,
    path: "/merchant/create-order",
  },
  {
    label: "Hồ sơ quán",
    icon: Home,
    path: "/merchant",
    end: true,
  },
  {
    label: "Trạng thái xét duyệt",
    icon: Timer,
    path: "/merchant/application/status",
  },
  {
    label: "Campaign",
    icon: Megaphone,
    path: "/merchant/campaigns",
  },
  {
    label: "Thống kê lượt xem",
    icon: BarChart3,
    path: "/merchant/view-statistics",
  },
];

export function MerchantSidebar() {
  const user = getCurrentUser();
  const visibleMenuItems =
    user?.Role === "Customer"
      ? [
          {
            label: "Gửi hồ sơ quán",
            icon: Store,
            path: "/merchant/application/create",
          },
          {
            label: "Trạng thái xét duyệt",
            icon: Timer,
            path: "/merchant/application/status",
          },
        ]
      : menuItems;

  return (
    <aside className="w-[280px] shrink-0 border-r border-white/40 bg-white/40 backdrop-blur-3xl shadow-[4px_0_24px_0_rgba(31,38,135,0.05)] sticky top-0 h-screen flex flex-col z-20">
      <div className="flex h-20 items-center px-8 border-b border-white/40 bg-white/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-900/20">
            <Store size={20} className="drop-shadow-md" />
          </div>
          <strong className="text-[18px] font-black tracking-tight text-slate-900 drop-shadow-sm">Merchant Portal</strong>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        <p className="px-4 pb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Main Menu</p>
        {visibleMenuItems.map(({ label, icon: Icon, path, end }) => (
          <NavLink
            key={label}
            to={path}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[14px] font-black transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 shadow-sm border border-cyan-200/50"
                  : "text-slate-600 hover:bg-white/60 hover:text-cyan-800 hover:-translate-y-0.5 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`transition-transform duration-300 ${isActive ? "scale-110 text-cyan-600" : "group-hover:scale-110 group-hover:text-cyan-700"}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
