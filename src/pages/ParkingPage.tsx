import { EmptyState } from "../components/ui/EmptyState";
import { CircleParking } from "lucide-react";

export default function ParkingPage() {
  return (
    <EmptyState
      icon={<CircleParking className="h-10 w-10" />}
      title="Parking browsing arrives in Phase 6"
      description="Facility list, space grid, and search/filtering are built once the database schema (Phase 3) is in place."
    />
  );
}
