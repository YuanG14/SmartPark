import { Link } from "react-router-dom";
import { Card, CardHeader } from "../components/ui/Card";
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

export default function DashboardPage() {
  const { profile } = useAuth();
  const { upcoming, loading: reservationsLoading } = useReservations();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotifications();
  const { overview, lots, loading: overviewLoading } = useParkingOverview();

  const nextReservation = upcoming[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">
          Welcome back, {profile?.full_name.split(" ")[0]} 👋
        </h1>
        <Link to="/parking">
          <Button>Find Parking</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Parking Overview" />
          {overviewLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : overview.total === 0 ? (
            <p className="text-sm text-neutral-500">No parking facilities configured yet.</p>
          ) : (
            <>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full bg-brand-500"
                  style={{
                    width: `${((overview.occupied + overview.reserved) / overview.total) * 100}%`,
                  }}
                />
              </div>
              <dl className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-neutral-500">Available</dt>
                  <dd className="text-lg font-semibold text-neutral-900">{overview.available}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Occupied</dt>
                  <dd className="text-lg font-semibold text-neutral-900">{overview.occupied}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Reserved</dt>
                  <dd className="text-lg font-semibold text-neutral-900">{overview.reserved}</dd>
                </div>
              </dl>
            </>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Upcoming Reservation"
            action={
              nextReservation && (
                <Badge tone="success">🟢 {nextReservation.status}</Badge>
              )
            }
          />
          {reservationsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : nextReservation ? (
            <ReservationCard reservation={nextReservation} />
          ) : (
            <EmptyState
              title="Nothing booked yet"
              description="Booking arrives in Phase 8 — for now this reflects real (empty) reservation data."
              action={
                <Link to="/reservations">
                  <Button size="sm" variant="secondary">
                    View reservations
                  </Button>
                </Link>
              }
            />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Vehicles"
            action={
              <Link to="/vehicles" className="text-sm font-medium text-brand-700 underline">
                Manage
              </Link>
            }
          />
          {vehiclesLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold text-neutral-900">{vehicles.length}</p>
          )}
          <p className="text-sm text-neutral-500">registered vehicle{vehicles.length === 1 ? "" : "s"}</p>
        </Card>

        <Card>
          <CardHeader
            title="Notifications"
            action={
              <Link to="/notifications" className="text-sm font-medium text-brand-700 underline">
                View all
              </Link>
            }
          />
          {notificationsLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : notifications.length === 0 ? (
            <p className="text-sm text-neutral-500">You're all caught up.</p>
          ) : (
            <p className="text-sm text-neutral-700">
              {unreadCount > 0 ? `${unreadCount} unread` : "No unread notifications"}
            </p>
          )}
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title="Nearby Parking" />
          {overviewLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : lots.length === 0 ? (
            <p className="text-sm text-neutral-500">No parking facilities configured yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 p-4"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{lot.name}</p>
                    <p className="text-sm text-neutral-500">
                      {lot.available_count} of {lot.total_count} spaces available
                    </p>
                  </div>
                  <Link to="/parking">
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
