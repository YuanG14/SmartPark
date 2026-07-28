import { EmptyState } from "../components/ui/EmptyState";
import { CalendarClock } from "lucide-react";

export default function ReservationsPage() {
  return (
    <EmptyState
      icon={<CalendarClock className="h-10 w-10" />}
      title="Reservations arrive in Phase 8"
      description="The full reservation engine — availability, conflict detection, and cancellation — is built once auth and the database are in place."
    />
  );
}
