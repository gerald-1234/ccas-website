import { useEffect, useState } from "react";
import { apiRequest } from "../../config/api";

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/notifications?page=1&limit=20");
      setNotifications(res.notifications || res || []);
    } catch (err) {
      console.error("Failed to load notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
        <button
          onClick={fetchNotifications}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-4">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">
          You have no notifications.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`py-4 flex items-start justify-between gap-4 ${
                !n.is_read ? "bg-blue-50/40 -mx-2 px-2 rounded" : ""
              }`}
            >
              <div>
                <p className="text-sm text-slate-900 font-medium">
                  {n.message || n.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                </p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="shrink-0 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 rounded"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
