import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { useReservations } from "../hooks/useReservations";
import { ReservationCard } from "../components/reservation/ReservationCard";
import { Tabs } from "../components/ui/Tabs";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";

export default function ReservationsPage() {
  const { upcoming, history, loading, error, refresh } = useReservations();
  const [tab, setTab] = useState("upcoming");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900">Your reservations</h1>

      <Tabs
        tabs={[
          { id: "upcoming", label: `Upcoming (${upcoming.length})` },
          { id: "history", label: `History (${history.length})` },
        ]}
        onChange={setTab}
      />

      {loading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {!loading && error && <ErrorState description={error} onRetry={refresh} />}

      {!loading && !error && tab === "upcoming" && upcoming.length === 0 && (
        <EmptyState
          icon={<CalendarClock className="h-10 w-10" />}
          title="No upcoming reservations"
          description="The booking flow arrives in Phase 8 — this list will populate with real reservations once it's built."
        />
      )}
      {!loading && !error && tab === "upcoming" && upcoming.length > 0 && (
        <div className="flex flex-col gap-3">
          {upcoming.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}

      {!loading && !error && tab === "history" && history.length === 0 && (
        <EmptyState
          icon={<CalendarClock className="h-10 w-10" />}
          title="No reservation history yet"
        />
      )}
      {!loading && !error && tab === "history" && history.length > 0 && (
        <div className="flex flex-col gap-3">
          {history.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}
