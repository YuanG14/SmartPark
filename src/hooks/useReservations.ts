import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../features/auth/AuthProvider";
import type { ParkingLot, ParkingSpace, Reservation, Vehicle } from "../types/database";

export interface ReservationWithRelations extends Reservation {
  parking_space: (ParkingSpace & { parking_lot: ParkingLot }) | null;
  vehicle: Vehicle | null;
}

export function useReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setReservations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("reservations")
      .select(
        "*, parking_space:parking_spaces(*, parking_lot:parking_lots(*)), vehicle:vehicles(*)"
      )
      .eq("profile_id", user.id)
      .order("start_time", { ascending: false });

    if (error) setError("Couldn't load your reservations.");
    else setReservations(data as unknown as ReservationWithRelations[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const now = new Date();
  // "Upcoming" = still pending/confirmed and hasn't ended yet.
  const upcoming = reservations
    .filter(
      (r) => (r.status === "pending" || r.status === "confirmed") && new Date(r.end_time) >= now
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Everything else (completed, cancelled, expired, or a past confirmed one).
  const history = reservations.filter((r) => !upcoming.includes(r));

  return { reservations, upcoming, history, loading, error, refresh };
}
