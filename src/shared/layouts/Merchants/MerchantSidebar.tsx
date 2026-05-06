import { NavLink } from "react-router-dom";
import {
  BarChart3,
  HelpCircle,
  Home,
  Megaphone,
  Settings,
  Store,
  Timer,
} from "lucide-react";

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
];

export function MerchantSidebar() {
  return (
    <aside className="merchant-sidebar">
      <div className="merchant-sidebar-logo">
        <strong>Merchant Portal</strong>
      </div>

      <nav className="merchant-sidebar-nav">
        {menuItems.map(({ label, icon: Icon, path, end }) => (
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

      <div className="merchant-sidebar-bottom">
        <button type="button">
          <Settings size={18} />
          <span>Cài đặt</span>
        </button>

        <button type="button">
          <HelpCircle size={18} />
          <span>Trợ giúp</span>
        </button>
      </div>
    </aside>
  );
}
