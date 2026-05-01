import { clearAuth, getCurrentUser } from "../../../features/auth";

export function MerchantHeader() {
  const user = getCurrentUser();
  const displayName = user?.Name || "Merchant";
  const email = user?.Email || "merchant@gmail.com";

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
          <strong>Xin chào, {displayName}</strong>
          <span>{email}</span>
        </div>

        <div className="merchant-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
