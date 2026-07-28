import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../features/auth/AuthProvider";
import type { Notification } from "../types/database";

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
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error) setNotifications(data as Notification[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function markAsRead(id: string) {
    // Optimistic update — notifications are low-stakes, so we don't wait
    // on the round trip before reflecting the change.
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  async function markAllAsRead() {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", user.id)
      .eq("is_read", false);
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh };
}
