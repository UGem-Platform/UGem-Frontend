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
    active: false,
    disabled: true,
  },
  {
    label: "Hồ sơ quán",
    icon: Home,
    active: true,
    disabled: false,
  },
  {
    label: "Trạng thái xét duyệt",
    icon: Timer,
    active: false,
    disabled: false,
  },
  {
    label: "Campaign",
    icon: Megaphone,
    active: false,
    disabled: true,
  },
  {
    label: "Thống kê lượt xem",
    icon: BarChart3,
    active: false,
    disabled: true,
  },
];

export function MerchantSidebar() {
  return (
    <aside className="merchant-sidebar">
      <div className="merchant-sidebar-logo">
        <strong>Merchant Portal</strong>
      </div>

      <nav className="merchant-sidebar-nav">
        {menuItems.map(({ label, icon: Icon, active, disabled }) => (
          <button
            key={label}
            className={`merchant-nav-item ${active ? "active" : ""}`}
            disabled={disabled}
            type="button"
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
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
