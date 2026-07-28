import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { useAuthStore } from "../../store/authStore";
import notificationsApi from "../../api/notificationsApi";
import type { Notification } from "../../types/pocketHealth";

export default function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    notificationsApi.getByUser(user.userId).then(setNotifications).finally(() => setLoading(false));
  };

  useEffect(load, [user?.userId]);

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    load();
  };

  const handleMarkAllRead = async () => {
    if (!user?.userId) return;
    await notificationsApi.markAllRead(user.userId);
    load();
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <>
      <PageMeta title="Notifications | PocketHealth" description="Your alerts, reminders and payment confirmations." />
      <PageBreadcrumb pageTitle="Notifications" />

      <div className="mb-5 flex justify-end">
        {hasUnread && (
          <Button size="sm" variant="outline" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>}
      {!loading && notifications.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">You have no notifications yet.</p>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.notificationId}
            onClick={() => !n.isRead && handleMarkRead(n.notificationId)}
            className={`flex w-full flex-col items-start gap-1 rounded-xl border p-4 text-left transition ${
              n.isRead
                ? "border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
                : "border-brand-200 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10"
            }`}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{n.title}</p>
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
            {n.body && <p className="text-sm text-gray-600 dark:text-gray-400">{n.body}</p>}
          </button>
        ))}
      </div>
    </>
  );
}
