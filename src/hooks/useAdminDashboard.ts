import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  ParkingLot,
  ParkingSpace,
  Payment,
  PaymentStatus,
  Profile,
  Reservation,
  Vehicle,
} from "../types/database";

export interface AdminReservation extends Reservation {
  profile: Profile | null;
  vehicle: Vehicle | null;
  parking_space: (ParkingSpace & { parking_lot: ParkingLot | null }) | null;
}

export interface AdminPayment extends Payment {
  profile: Profile | null;
  reservation: (Reservation & {
    vehicle: Vehicle | null;
    parking_space: (ParkingSpace & { parking_lot: ParkingLot | null }) | null;
  }) | null;
}

export function useAdminDashboard() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [reservationResult, paymentResult] = await Promise.all([
      supabase
        .from("reservations")
        .select(
          "*, profile:profiles(*), vehicle:vehicles(*), parking_space:parking_spaces(*, parking_lot:parking_lots(*))"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select(
          "*, profile:profiles(*), reservation:reservations(*, vehicle:vehicles(*), parking_space:parking_spaces(*, parking_lot:parking_lots(*)))"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (reservationResult.error || paymentResult.error) {
      setError("Couldn't load admin data. Make sure the latest Supabase migration has been applied.");
    } else {
      setReservations(reservationResult.data as unknown as AdminReservation[]);
      setPayments(paymentResult.data as unknown as AdminPayment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function decideReservation(id: string, decision: "accept" | "reject") {
    setActionId(id);
    const { error } = await supabase.rpc("admin_decide_reservation", {
      p_reservation_id: id,
      p_decision: decision,
    });
    setActionId(null);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function updatePaymentStatus(id: string, status: PaymentStatus) {
    setActionId(id);
    const { error } = await supabase.rpc("admin_update_payment_status", {
      p_payment_id: id,
      p_status: status,
    });
    setActionId(null);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  const metrics = useMemo(() => {
    const pendingReservations = reservations.filter((item) => item.status === "pending").length;
    const confirmedReservations = reservations.filter((item) => item.status === "confirmed").length;
    const pendingPayments = payments.filter((item) => item.status === "pending").length;
    const paidRevenue = payments
      .filter((item) => item.status === "paid")
      .reduce((total, item) => total + Number(item.amount || 0), 0);
    return { pendingReservations, confirmedReservations, pendingPayments, paidRevenue };
  }, [reservations, payments]);

  return {
    reservations,
    payments,
    loading,
    error,
    actionId,
    metrics,
    refresh,
    decideReservation,
    updatePaymentStatus,
  };
}
