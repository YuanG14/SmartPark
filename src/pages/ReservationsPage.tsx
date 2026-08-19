import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  History,
  MapPin,
  Plus,
  Search,
  TicketCheck,
} from "lucide-react";
import { useReservations } from "../hooks/useReservations";
import { ReservationCard } from "../components/reservation/ReservationCard";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";

export default function ReservationsPage() {
  const { reservations, upcoming, history, loading, error, refresh } = useReservations();
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [query, setQuery] = useState("");

  const completedCount = reservations.filter((reservation) => reservation.status === "completed").length;
  const pendingCount = upcoming.filter((reservation) => reservation.status === "pending").length;

  const visibleReservations = useMemo(() => {
    const source = tab === "upcoming" ? upcoming : history;
    const term = query.trim().toLowerCase();
    if (!term) return source;

    return source.filter((reservation) => {
      const lotName = reservation.parking_space?.parking_lot?.name ?? "";
      const space = reservation.parking_space?.space_number ?? "";
      const plate = reservation.vehicle?.plate_number ?? "";
      return [lotName, space, plate, reservation.status].some((value) =>
        String(value).toLowerCase().includes(term)
      );
    });
  }, [history, query, tab, upcoming]);

  return (
    <div className="space-y-7 pb-10">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <TicketCheck className="h-3.5 w-3.5" />
            Reservation center
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Your reservations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
            Keep track of upcoming bookings, completed parking sessions, and reservation details in one place.
          </p>
        </div>

        <Link to="/parking">
          <Button size="lg" className="w-full rounded-2xl px-5 sm:w-auto">
            <Plus className="h-4 w-4" />
            New reservation
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<CalendarClock className="h-5 w-5" />}
          label="Upcoming"
          value={upcoming.length}
          note="Active bookings"
          tone="brand"
          loading={loading}
        />
        <SummaryCard
          icon={<Clock3 className="h-5 w-5" />}
          label="Pending"
          value={pendingCount}
          note="Awaiting confirmation"
          tone="amber"
          loading={loading}
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed"
          value={completedCount}
          note="Parking sessions"
          tone="emerald"
          loading={loading}
        />
        <SummaryCard
          icon={<History className="h-5 w-5" />}
          label="Total reservations"
          value={reservations.length}
          note="All time"
          tone="neutral"
          loading={loading}
        />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm shadow-neutral-200/60">
        <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="inline-flex w-fit rounded-2xl bg-neutral-100 p-1.5">
            <button
              type="button"
              onClick={() => setTab("upcoming")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === "upcoming"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Upcoming <span className="ml-1 opacity-80">({upcoming.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("history")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === "history"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              History <span className="ml-1 opacity-80">({history.length})</span>
            </button>
          </div>

          <label className="relative w-full xl:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <span className="sr-only">Search reservations</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search facility, slot or plate..."
              className="h-11 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </label>
        </div>

        <div className="p-5 sm:p-6">
          {loading && (
            <div className="grid gap-4 xl:grid-cols-2">
              <Skeleton className="h-52 rounded-[24px]" />
              <Skeleton className="h-52 rounded-[24px]" />
            </div>
          )}

          {!loading && error && <ErrorState description={error} onRetry={refresh} />}

          {!loading && !error && visibleReservations.length > 0 && (
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}

          {!loading && !error && visibleReservations.length === 0 && (
            <ReservationEmptyState tab={tab} hasQuery={Boolean(query.trim())} />
          )}
        </div>
      </section>
    </div>
  );
}

function ReservationEmptyState({
  tab,
  hasQuery,
}: {
  tab: "upcoming" | "history";
  hasQuery: boolean;
}) {
  if (hasQuery) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-neutral-400 shadow-sm">
          <Search className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-neutral-950">No matching reservations</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
          Try another parking facility, slot number, vehicle plate, or reservation status.
        </p>
      </div>
    );
  }

  if (tab === "history") {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[24px] border border-dashed border-neutral-200 bg-gradient-to-b from-white to-neutral-50 px-6 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <History className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-neutral-950">No reservation history yet</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
          Completed, cancelled, and expired parking reservations will appear here for easy reference.
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-h-[420px] overflow-hidden rounded-[24px] border border-neutral-200 bg-neutral-50 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-center px-7 py-12 sm:px-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <CalendarCheck2 className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-950">No upcoming reservations</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-500 sm:text-base">
          You do not have an active parking booking right now. Find an available space and reserve it when you are ready.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/parking">
            <Button size="lg" className="w-full rounded-2xl sm:w-auto">
              <MapPin className="h-4 w-4" />
              Find parking
            </Button>
          </Link>
          <Link to="/vehicles">
            <Button variant="secondary" size="lg" className="w-full rounded-2xl sm:w-auto">
              Manage vehicles
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative hidden min-h-[420px] overflow-hidden border-l border-neutral-200 bg-white lg:block">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-emerald-50 blur-3xl" />
        <div className="relative flex h-full items-center justify-center p-10">
          <div className="w-full max-w-xs rounded-[28px] border border-neutral-200 bg-white p-6 shadow-xl shadow-neutral-200/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Next booking</p>
                <p className="mt-1 text-lg font-semibold text-neutral-950">Ready when you are</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <CalendarClock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-3 w-4/5 rounded-full bg-neutral-100" />
              <div className="h-3 w-3/5 rounded-full bg-neutral-100" />
              <div className="mt-5 h-24 rounded-2xl border border-dashed border-brand-200 bg-brand-50/60" />
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              Live availability from SmartPark
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  note,
  tone,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note: string;
  tone: "brand" | "amber" | "emerald" | "neutral";
  loading: boolean;
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    neutral: "bg-neutral-100 text-neutral-700",
  };

  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/50">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>{icon}</div>
        <span className="rounded-full bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-400">LIVE</span>
      </div>
      <div className="mt-5">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-14" />
        ) : (
          <p className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">{value}</p>
        )}
        <p className="mt-1 text-xs text-neutral-400">{note}</p>
      </div>
    </div>
  );
}
