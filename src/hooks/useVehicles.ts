import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../features/auth/AuthProvider";
import type { Vehicle, VehicleType } from "../types/database";

interface NewVehicleInput {
  plate_number: string;
  vehicle_type: VehicleType;
  make?: string;
  model?: string;
}

export function useVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // RLS already scopes this to the caller's own rows, but filtering
    // explicitly keeps the query's intent readable and avoids an
    // over-fetch if the policy ever changes.
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (error) setError("Couldn't load your vehicles.");
    else setVehicles(data as Vehicle[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addVehicle(input: NewVehicleInput) {
    if (!user) return { error: "Not signed in." };
    const { error } = await supabase
      .from("vehicles")
      .insert({ profile_id: user.id, ...input });
    if (error) {
      // The `plate_number` unique constraint from Phase 3 is the most
      // likely failure here — translate it to something a driver understands.
      const message = error.message.includes("duplicate key")
        ? "That plate number is already registered."
        : "Couldn't add the vehicle.";
      return { error: message };
    }
    await refresh();
    return { error: null };
  }

  async function deleteVehicle(id: string) {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) {
      // `on delete restrict` from Phase 3 blocks deleting a vehicle that
      // has reservation history — surface that as a plain explanation.
      const message = error.message.includes("foreign key")
        ? "Can't remove a vehicle with reservation history."
        : "Couldn't remove the vehicle.";
      return { error: message };
    }
    await refresh();
    return { error: null };
  }

  return { vehicles, loading, error, addVehicle, deleteVehicle, refresh };
}
