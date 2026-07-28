import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ParkingLot, ParkingSpaceStatus } from "../types/database";

export interface LotWithAvailability extends ParkingLot {
  available_count: number;
  total_count: number;
}

interface Overview {
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  blocked: number;
  total: number;
}

const emptyOverview: Overview = {
  available: 0,
  occupied: 0,
  reserved: 0,
  maintenance: 0,
  blocked: 0,
  total: 0,
};

/**
 * Parking lots/spaces are publicly readable (Phase 3 RLS), so this works
 * whether or not a user is signed in.
 */
export function useParkingOverview() {
  const [overview, setOverview] = useState<Overview>(emptyOverview);
  const [lots, setLots] = useState<LotWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [lotsRes, spacesRes] = await Promise.all([
      supabase.from("parking_lots").select("*").order("name"),
      supabase.from("parking_spaces").select("parking_lot_id, status"),
    ]);

    if (lotsRes.error || spacesRes.error) {
      setError("Couldn't load parking data.");
      setLoading(false);
      return;
    }

    const spaces = spacesRes.data as { parking_lot_id: string; status: ParkingSpaceStatus }[];

    const counts: Overview = { ...emptyOverview };
    for (const s of spaces) {
      counts[s.status] += 1;
      counts.total += 1;
    }
    setOverview(counts);

    const lotsWithAvailability: LotWithAvailability[] = (lotsRes.data as ParkingLot[]).map(
      (lot) => {
        const lotSpaces = spaces.filter((s) => s.parking_lot_id === lot.id);
        return {
          ...lot,
          available_count: lotSpaces.filter((s) => s.status === "available").length,
          total_count: lotSpaces.length,
        };
      }
    );
    setLots(lotsWithAvailability);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { overview, lots, loading, error, refresh };
}
