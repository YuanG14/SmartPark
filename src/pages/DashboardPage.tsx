import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Car,
  ChevronRight,
  CircleParking,
  Clock3,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ReservationCard } from "../components/reservation/ReservationCard";
import { useAuth } from "../features/auth/AuthProvider";
import { useReservations } from "../hooks/useReservations";
import { useVehicles } from "../hooks/useVehicles";
import { useNotifications } from "../hooks/useNotifications";
import { useParkingOverview } from "../hooks/useParkingOverview";

const statusStyles = {
  available: "bg-emerald-500",
  occupied: "bg-rose-500",
  reserved: "bg-amber-400",
  maintenance: "bg-sky-500",
  blocked: "bg-neutral-500",
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const { upcoming, loading: reservationsLoading } = useReservations();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotifications();
  const { overview, lots, loading: overviewLoading } = useParkingOverview();

  const nextReservation = upcoming[0];
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const utilization = overview.total
    ? Math.round(((overview.occupied + overview.reserved) / overview.total) * 100)
    : 0;

  const statusData = [
    { label: "Available", value: overview.available, dot: statusStyles.available },
    { label: "Reserved", value: overview.reserved, dot: statusStyles.reserved },
    { label: "Occupied", value: overview.occupied, dot: statusStyles.occupied },
    { label: "Maintenance", value: overview.maintenance, dot: statusStyles.maintenance },
    { label: "Blocked", value: overview.blocked, dot: statusStyles.blocked },
  ];

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <Sparkles className="h-3.5 w-3.5" />
            Smart parking, simpler days
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Welcome back, {firstName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">
            Check live availability, manage your vehicles, and keep your next parking trip organized.
          </p>
        </div>
        <Link to="/parking" className="shrink-0">
          <Button size="lg" className="rounded-full px-6 shadow-sm shadow-brand-200">
            <MapPin className="h-4 w-4" />
            Find Parking
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<CircleParking className="h-5 w-5" />}
          label="Available spaces"
          value={overviewLoading ? undefined : overview.available}
          note={overview.total ? `${overview.total} spaces total` : "Live facility data"}
          tone="available"
        />
        <SummaryCard
          icon={<Car className="h-5 w-5" />}
          label="Occupied spaces"
          value={overviewLoading ? undefined : overview.occupied}
          note={overview.occupied === 1 ? "1 vehicle parked" : `${overview.occupied} vehicles parked`}
          tone="occupied"
        />
        <SummaryCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Reserved spaces"
          value={overviewLoading ? undefined : overview.reserved}
          note={overview.reserved ? "Upcoming reservations" : "No active reservations"}
          tone="reserved"
        />
        <SummaryCard
          icon={<CircleParking className="h-5 w-5" />}
          label="Utilization"
          value={overviewLoading ? undefined : `${utilization}%`}
          note="Occupied + reserved"
          tone="utilization"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm shadow-neutral-200/60">
          <div className="flex flex-col gap-4 border-b border-neutral-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Live network</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">Parking overview</h2>
            </div>
            <Link
              to="/parking"
              className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 transition hover:text-neutral-950"
            >
              View all parking <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-6">
            {overviewLoading ? (
              <div className="space-y-5">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-44 w-full rounded-2xl" />
              </div>
            ) : overview.total === 0 ? (
              <EmptyState
                title="No parking facilities yet"
                description="Parking availability will appear here as soon as facilities and spaces are configured."
                action={
                  <Link to="/parking">
                    <Button size="sm" variant="secondary">Open parking</Button>
                  </Link>
                }
              />
            ) : (
              <>
                <div className="rounded-2xl bg-neutral-950 p-5 text-white">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm text-neutral-400">Current network utilization</p>
                      <p className="mt-1 text-4xl font-semibold tracking-tight">{utilization}%</p>
                    </div>
                    <p className="max-w-xs text-sm leading-6 text-neutral-400">
                      {overview.available} of {overview.total} parking spaces are currently available.
                    </p>
                  </div>

                  <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-white/10" aria-label="Parking status distribution">
                    {statusData.map((item) =>
                      item.value > 0 ? (
                        <span
                          key={item.label}
                          className={item.dot}
                          style={{ width: `${(item.value / overview.total) * 100}%` }}
                          title={`${item.label}: ${item.value}`}
                        />
                      ) : null
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {statusData.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs text-neutral-300">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                        <span>{item.label}</span>
                        <span className="font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {lots.slice(0, 4).map((lot) => {
                    const availablePercent = lot.total_count
                      ? Math.round((lot.available_count / lot.total_count) * 100)
                      : 0;
                    return (
                      <Link
                        key={lot.id}
                        to="/parking"
                        className="group rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-md hover:shadow-neutral-200/60"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-neutral-900">{lot.name}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {lot.address || "Parking facility"}
                            </p>
                          </div>
                          <span className="rounded-full bg-white p-2 text-neutral-500 shadow-sm ring-1 ring-neutral-200 transition group-hover:text-neutral-900">
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="mt-4 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-2xl font-semibold tracking-tight text-neutral-950">
                              {lot.available_count}
                              <span className="ml-1 text-sm font-medium text-neutral-400">/ {lot.total_count}</span>
                            </p>
                            <p className="text-xs text-neutral-500">spaces available</p>
                          </div>
                          <div className="w-24">
                            <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                              <div className="h-full rounded-full bg-brand-500" style={{ width: `${availablePercent}%` }} />
                            </div>
                            <p className="mt-1 text-right text-[11px] font-medium text-neutral-400">{availablePercent}% free</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-200/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Next trip</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">Upcoming reservation</h2>
              </div>
              {nextReservation && <Badge tone="success">{nextReservation.status}</Badge>}
            </div>

            <div className="mt-5">
              {reservationsLoading ? (
                <Skeleton className="h-36 w-full rounded-2xl" />
              ) : nextReservation ? (
                <ReservationCard reservation={nextReservation} />
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <p className="mt-4 font-semibold text-neutral-900">No upcoming reservation</p>
                  <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-neutral-500">
                    Find an available space and your next reservation will appear here.
                  </p>
                  <Link to="/parking" className="mt-5 inline-block">
                    <Button size="sm">Reserve a space</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-brand-600 p-6 text-white shadow-lg shadow-brand-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-700/70">Quick actions</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">What do you need?</h2>
              </div>
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <QuickAction to="/parking" icon={<MapPin className="h-5 w-5" />} label="Find Parking" />
              <QuickAction to="/reservations" icon={<CalendarDays className="h-5 w-5" />} label="Reservations" />
              <QuickAction to="/vehicles" icon={<Car className="h-5 w-5" />} label="My Vehicles" />
              <QuickAction to="/parking" icon={<Plus className="h-5 w-5" />} label="New Booking" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Garage</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">Your vehicles</h2>
            </div>
            <Link to="/vehicles" className="text-sm font-semibold text-neutral-600 hover:text-neutral-950">Manage</Link>
          </div>
          {vehiclesLoading ? (
            <Skeleton className="mt-5 h-24 w-full rounded-2xl" />
          ) : vehicles.length === 0 ? (
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-neutral-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-neutral-700 shadow-sm ring-1 ring-neutral-200">
                <Car className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900">No vehicle added yet</p>
                <p className="text-sm text-neutral-500">Add a vehicle to make booking faster.</p>
              </div>
              <Link to="/vehicles" className="rounded-full p-2 text-neutral-500 hover:bg-white hover:text-neutral-900" aria-label="Manage vehicles">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {vehicles.slice(0, 2).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-neutral-700 shadow-sm ring-1 ring-neutral-200">
                    <Car className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-neutral-900">{vehicle.make || "Vehicle"} {vehicle.model || ""}</p>
                    <p className="text-sm uppercase tracking-wide text-neutral-500">{vehicle.plate_number}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Updates</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">Notifications</h2>
            </div>
            <Link to="/notifications" className="text-sm font-semibold text-neutral-600 hover:text-neutral-950">View all</Link>
          </div>

          {notificationsLoading ? (
            <Skeleton className="mt-5 h-24 w-full rounded-2xl" />
          ) : notifications.length === 0 ? (
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-neutral-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">You&apos;re all caught up</p>
                <p className="text-sm text-neutral-500">New parking updates will show up here.</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-neutral-100">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${notification.is_read ? "bg-neutral-300" : "bg-brand-500"}`} />
                  <div className="min-w-0">
                    <p className="text-sm leading-6 text-neutral-700">{notification.message}</p>
                    {!notification.is_read && <p className="mt-1 text-xs font-semibold text-brand-700">New</p>}
                  </div>
                </div>
              ))}
              {unreadCount > 0 && (
                <p className="pt-4 text-xs font-medium text-neutral-400">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-200/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Nearby</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">Parking locations</h2>
          </div>
          <Link to="/parking" className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-neutral-950">
            Explore all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {overviewLoading ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : lots.length === 0 ? (
          <p className="mt-5 text-sm text-neutral-500">No parking facilities configured yet.</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lots.slice(0, 6).map((lot) => (
              <Link
                key={lot.id}
                to="/parking"
                className="group flex items-center gap-4 rounded-2xl border border-neutral-200 p-4 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                  <CircleParking className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-900">{lot.name}</p>
                  <p className="mt-0.5 text-sm text-neutral-500">{lot.available_count} of {lot.total_count} spaces available</p>
                  {lot.operating_hours && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400"><Clock3 className="h-3 w-3" />{lot.operating_hours}</p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-600" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number | string | undefined;
  note: string;
  tone: "available" | "occupied" | "reserved" | "utilization";
}) {
  const tones = {
    available: "bg-emerald-50 text-emerald-700",
    occupied: "bg-rose-50 text-rose-700",
    reserved: "bg-amber-50 text-amber-700",
    utilization: "bg-sky-50 text-sky-700",
  };

  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          {value === undefined ? (
            <Skeleton className="mt-3 h-8 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">{value}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>{icon}</div>
      </div>
      <p className="mt-3 text-xs font-medium text-neutral-400">{note}</p>
    </div>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-white/95 px-3 py-4 text-center text-sm font-semibold text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
    >
      {icon}
      {label}
    </Link>
  );
}
