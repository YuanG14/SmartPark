import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../features/auth/AuthProvider";
import type { Notification } from "../types/database";

const NOTIFICATIONS_CHANGED_EVENT = "smartpark:notifications-changed";

function broadcastNotificationsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
  }
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (showLoading = false) => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) setNotifications((data ?? []) as Notification[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh(true);
  }, [refresh]);

  // Keep every useNotifications() instance in the current tab in sync.
  // This matters because Navbar and NotificationsPage use the hook separately.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleChanged = () => {
      void refresh(false);
    };

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleChanged);
  }, [refresh]);

  // Also listen for database changes so notification counts remain correct
  // across multiple tabs/devices and when an admin action creates a notification.
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${user.id}`,
        },
        () => {
          void refresh(false);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  async function markAsRead(id: string) {
    if (!user) return;

    // Update this component immediately.
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
      // Roll back to the database state when the write fails.
      await refresh(false);
      return;
    }

    // Tell Navbar/Dashboard hook instances to refresh their unread count now.
    broadcastNotificationsChanged();
  }

  async function markAllAsRead() {
    if (!user) return;

    setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", user.id)
      .eq("is_read", false);

    if (error) {
      await refresh(false);
      return;
    }

    broadcastNotificationsChanged();
  }

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh };
}
