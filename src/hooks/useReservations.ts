import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../features/auth/AuthProvider";
import type { ParkingLot, ParkingSpace, Reservation, Vehicle } from "../types/database";

export interface ReservationWithRelations extends Reservation {
  parking_space: (ParkingSpace & { parking_lot: ParkingLot }) | null;
  vehicle: Vehicle | null;
}

export interface NewReservationInput {
  vehicle_id: string;
  parking_space_id: string;
  start_time: string;
  end_time: string;
  estimated_cost: number;
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

  async function createReservation(input: NewReservationInput) {
    if (!user) return { reservation: null, error: "You need to sign in before reserving a space." };

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        profile_id: user.id,
        vehicle_id: input.vehicle_id,
        parking_space_id: input.parking_space_id,
        start_time: input.start_time,
        end_time: input.end_time,
        estimated_cost: input.estimated_cost,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      // PostgreSQL exclusion-constraint violations use 23P01. Supabase may
      // surface the constraint name in the message/details depending on the
      // PostgREST version, so support both forms for a friendly UX.
      const conflict =
        error.code === "23P01" ||
        error.message.toLowerCase().includes("no_overlapping_reservations") ||
        error.details?.toLowerCase().includes("conflicts with existing key");

      return {
        reservation: null,
        error: conflict
          ? "That parking space was just reserved for part of your selected time. Please choose another space or time."
          : "We couldn't create your reservation. Please check the details and try again.",
      };
    }

    // Notification creation is intentionally best-effort: a reservation is
    // still valid even if the non-critical notification write fails.
    await supabase.from("notifications").insert({
      profile_id: user.id,
      type: "reservation_confirmed",
      message: "Your parking reservation has been created successfully.",
    });

    await refresh();
    return { reservation: data as Reservation, error: null };
  }

  const now = new Date();
  // "Upcoming" = still pending/confirmed and hasn't ended yet.
  const upcoming = reservations
    .filter(
      (r) => (r.status === "pending" || r.status === "confirmed") && new Date(r.end_time) >= now
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Everything else (completed, cancelled, expired, or a past confirmed one).
  const history = reservations.filter((r) => !upcoming.includes(r));

  return { reservations, upcoming, history, loading, error, createReservation, refresh };
}
