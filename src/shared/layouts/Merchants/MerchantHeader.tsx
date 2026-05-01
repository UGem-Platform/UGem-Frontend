import { clearAuth, getCurrentUser } from "../../../features/auth";

export function MerchantHeader() {
  const user = getCurrentUser();

  function handleLogout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <header className="merchant-topbar">
      <div>
        <strong>Quản lý hồ sơ quán ăn</strong>
      </div>

      <div className="merchant-user">
        <div>
          {/* <strong>Xin chào, {user?.Name || "Merchant"}</strong> */}
          <span>{user?.Email || "merchant@gmail.com"}</span>
        </div>

        <div className="merchant-avatar">M</div>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
