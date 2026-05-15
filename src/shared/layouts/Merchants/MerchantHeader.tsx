import { clearAuth, getCurrentUser } from "../../../features/auth";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import { NotificationBellMenu } from "../../components/NotificationBellMenu";
import { notify } from "../../lib/notify";

export function MerchantHeader() {
  const user = getCurrentUser();
  const displayName = user?.Name || "Merchant";
  const email = user?.Email || "merchant@gmail.com";

  function handleLogout() {
    notify.confirmLogout(() => {
      clearAuth();
      window.location.href = "/login";
    });
  }

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-white/40 bg-white/40 px-8 backdrop-blur-3xl shadow-[0_4px_24px_0_rgba(31,38,135,0.05)]">
      <div>
        <strong className="text-[16px] font-black tracking-tight text-slate-900 drop-shadow-sm">Quản lý hồ sơ quán ăn</strong>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBellMenu />

        <div className="h-8 w-px bg-white/60" />

        <div className="flex items-center gap-4">
          <div className="text-right">
            <strong className="block text-[13px] font-black text-slate-900">
              Xin chào, {displayName}
            </strong>
            <span className="block text-[11px] font-bold text-slate-500">
              {email}
            </span>
          </div>

          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 text-[16px] font-black text-cyan-800 shadow-sm ring-2 ring-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-2">
          <Link 
            to="/merchant/profile" 
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/80 px-4 text-[13px] font-black text-cyan-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md border border-white/60"
          >
            <UserRound size={16} />
            Profile
          </Link>

          <button 
            type="button" 
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/80 px-4 text-[13px] font-black text-rose-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
