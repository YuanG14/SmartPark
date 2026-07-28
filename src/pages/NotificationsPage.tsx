import { Bell } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <EmptyState
          icon={<Bell className="h-10 w-10" />}
          title="No notifications yet"
          description="Reservation confirmations, reminders, and announcements will show up here."
        />
      )}

      {!loading && notifications.length > 0 && (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start justify-between gap-4 ${
                n.is_read ? "" : "border-brand-200 bg-brand-50"
              }`}
            >
              <div>
                <p className="text-sm text-neutral-900">{n.message}</p>
                <p className="mt-1 text-xs text-neutral-500">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                  Mark read
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
