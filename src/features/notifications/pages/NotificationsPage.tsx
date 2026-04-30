import { useEffect, useState } from "react";
import { getNotifications } from "../services";
import type { NotificationItem } from "../services";
import { Bell, RefreshCw } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);

    try {
      const data = await getNotifications();
      setNotifications(data ?? []);
    } catch (error) {
      console.error(error);
      alert("Không tải được thông báo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      const data = await getNotifications();
      setNotifications(data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    // Polling every 10 seconds for new notifications
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 10000);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, []);

  const getNotificationStyles = (type?: string) => {
    switch (type) {
      case "success":
        return "border-l-4 border-emerald-500 bg-emerald-50";
      case "warning":
        return "border-l-4 border-amber-500 bg-amber-50";
      case "error":
        return "border-l-4 border-rose-500 bg-rose-50";
      default:
        return "border-l-4 border-blue-500 bg-blue-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-cyan-600" />
            <h1 className="text-2xl font-bold">Thông báo</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            {refreshing ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">Đang tải thông báo...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg p-4 shadow-sm ${getNotificationStyles(item.type)}`}
              >
                <p className="font-semibold text-gray-800">
                  {item.title || item.message || "Thông báo"}
                </p>

                {item.content && (
                  <p className="mt-2 text-sm text-gray-600">{item.content}</p>
                )}

                {item.createdAt && (
                  <p className="mt-3 text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <Bell className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                <p className="text-gray-500">Chưa có thông báo nào.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
