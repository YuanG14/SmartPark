import { EmptyState } from "../components/ui/EmptyState";
import { Car } from "lucide-react";

export default function VehiclesPage() {
  return (
    <EmptyState
      icon={<Car className="h-10 w-10" />}
      title="Vehicle management arrives in Phase 5"
      description="You'll be able to add and manage vehicles once real Supabase data is wired up."
    />
  );
}
