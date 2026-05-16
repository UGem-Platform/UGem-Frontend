import { useEffect, useState } from "react";
import { Bell, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import {
  getNotifications,
  type NotificationItem,
} from "@/features/notifications/services";
import {
  formatNotificationTime,
  getNotificationBody,
  getNotificationMeta,
  getNotificationTitle,
  getToneClasses,
} from "@/features/notifications/notificationPresentation";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { notify } from "@/shared/lib/notify";

type NotificationBellMenuProps = {
  className?: string;
};

export function NotificationBellMenu({ className }: NotificationBellMenuProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const loadNotifications = async (showError = true) => {
    setLoading(true);

    try {
      const data = await getNotifications();
      setNotifications(data ?? []);
    } catch (error) {
      console.error(error);
      if (showError) {
        notify.error("Không tải được thông báo.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications(false);

    const interval = window.setInterval(() => {
      void loadNotifications(false);
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      void loadNotifications(false);
    });
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "relative h-10 w-10 rounded-full border-cyan-100 bg-white/90 p-0 text-cyan-700 shadow-sm hover:bg-cyan-50",
            className,
          )}
          aria-label="Xem thông báo"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[26rem] rounded-2xl p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <DropdownMenuLabel className="p-0 text-sm font-semibold text-slate-900">
              Thông báo
            </DropdownMenuLabel>
            <p className="text-xs text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : "Tất cả thông báo của tài khoản hiện tại"}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void loadNotifications()}
            className="h-8 gap-1.5 px-2 text-xs text-slate-600"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Làm mới
          </Button>
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-[24rem] overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Chưa có thông báo nào.
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((item, index) => (
                <BellNotificationItem
                  key={item.id ?? `${item.title}-${index}`}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="p-2">
          <Button asChild variant="ghost" className="w-full justify-center">
            <Link to="/notifications">Xem tất cả thông báo</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BellNotificationItem({ item }: { item: NotificationItem }) {
  const meta = getNotificationMeta(item);
  const tone = getToneClasses(meta.tone);
  const Icon = meta.icon;
  const body = getNotificationBody(item);
  const time = formatNotificationTime(item.createdAt);
  const content = (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        item.isRead ? "border-slate-200 bg-white" : tone.border,
        !item.isRead && tone.panel,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1",
            tone.icon,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-black ring-1",
                tone.badge,
              )}
            >
              {meta.categoryLabel}
            </span>
            {!item.isRead ? (
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
            ) : null}
          </div>

          <p className="mt-1 text-sm font-black text-slate-950">
            {getNotificationTitle(item)}
          </p>

          {body ? (
            <p className="mt-1 line-clamp-3 text-sm leading-5 text-slate-600">
              {body}
            </p>
          ) : null}

          <div className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
            <span>{time || "Mới cập nhật"}</span>
            {meta.actionTo ? (
              <span className="inline-flex items-center gap-1 text-cyan-700">
                {meta.actionLabel}
                <ExternalLink className="h-3 w-3" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (!meta.actionTo) return content;

  return (
    <Link to={meta.actionTo} className="block">
      {content}
    </Link>
  );
}
