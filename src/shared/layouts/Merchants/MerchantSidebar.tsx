import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Home,
  Megaphone,
  UserRound,
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
  {
    label: "Profile",
    icon: UserRound,
    path: "/merchant/profile",
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
    <aside className="merchant-sidebar">
      <div className="merchant-sidebar-logo">
        <strong>Merchant Portal</strong>
      </div>

      <nav className="merchant-sidebar-nav">
        {visibleMenuItems.map(({ label, icon: Icon, path, end }) => (
          <NavLink
            key={label}
            to={path}
            end={end}
            className={({ isActive }) =>
              `merchant-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
