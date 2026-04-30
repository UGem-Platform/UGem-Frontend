import { useEffect, useState } from "react";
import { getNotifications } from "../services";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
      alert("Không tải được thông báo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-5 text-2xl font-bold">Thông báo</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-medium">
                  {item.title || item.message || "Thông báo"}
                </p>

                {item.content && (
                  <p className="mt-1 text-sm text-gray-500">{item.content}</p>
                )}

                {item.createdAt && (
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
            ))}

            {notifications.length === 0 && (
              <p className="text-center text-gray-500">Chưa có thông báo.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
