import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../features/auth/AuthProvider";
import type { Notification } from "../types/database";

const NOTIFICATIONS_CHANGED_EVENT = "smartpark:notifications-changed";

function broadcastNotificationsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
  }
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) {
      setNotifications((data ?? []) as Notification[]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  // Navbar, Dashboard, and NotificationsPage each use this hook separately.
  // This lightweight browser event keeps those instances synchronized after
  // a notification is marked as read without introducing a realtime channel
  // that can fail during app startup.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNotificationsChanged = () => {
      void refresh();
    };

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged);
    };
  }, [refresh]);

  async function markAsRead(id: string) {
    if (!user) return;

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification,
      ),
    );

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("profile_id", user.id);

    if (error) {
      await refresh();
      return;
    }

    broadcastNotificationsChanged();
  }

  async function markAllAsRead() {
    if (!user) return;

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, is_read: true })),
    );

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", user.id)
      .eq("is_read", false);

    if (error) {
      await refresh();
      return;
    }

    broadcastNotificationsChanged();
  }

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh };
}
