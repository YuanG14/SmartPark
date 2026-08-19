import {
  CalendarDays,
  Car,
  Clock3,
  MapPin,
  MoreHorizontal,
  ParkingCircle,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import type { ReservationWithRelations } from "../../hooks/useReservations";
import type { ReservationStatus } from "../../types/database";

const statusTone: Record<ReservationStatus, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  pending: { tone: "warning", label: "Pending" },
  confirmed: { tone: "success", label: "Confirmed" },
  completed: { tone: "neutral", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  expired: { tone: "danger", label: "Expired" },
  rejected: { tone: "danger", label: "Rejected" },
};

function formatDate(start: string) {
  return new Date(start).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(start).toLocaleTimeString("en-PH", options)} – ${new Date(end).toLocaleTimeString("en-PH", options)}`;
}

function formatPeso(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

export function ReservationCard({ reservation }: { reservation: ReservationWithRelations }) {
  const status = statusTone[reservation.status];
  const lotName = reservation.parking_space?.parking_lot?.name ?? "Unknown facility";
  const lotAddress = reservation.parking_space?.parking_lot?.address ?? "Parking facility";
  const spaceNumber = reservation.parking_space?.space_number ?? "—";
  const plate = reservation.vehicle?.plate_number ?? "—";
  const vehicleLabel = [reservation.vehicle?.make, reservation.vehicle?.model].filter(Boolean).join(" ") || "Vehicle";

  return (
    <article className="group overflow-hidden rounded-[24px] border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/60">
      <div className="border-b border-neutral-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Badge tone={status.tone}>{status.label}</Badge>
              <span className="text-xs font-medium text-neutral-400">#{reservation.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <h3 className="truncate text-lg font-semibold tracking-tight text-neutral-950">{lotName}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
              <span className="truncate">{lotAddress}</span>
            </p>
          </div>
          <button
            type="button"
            aria-label="Reservation options"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-neutral-100 sm:grid-cols-4">
        <DetailCell icon={<CalendarDays className="h-4 w-4" />} label="Date" value={formatDate(reservation.start_time)} />
        <DetailCell icon={<Clock3 className="h-4 w-4" />} label="Time" value={formatTimeRange(reservation.start_time, reservation.end_time)} />
        <DetailCell icon={<ParkingCircle className="h-4 w-4" />} label="Parking slot" value={`Slot ${spaceNumber}`} />
        <DetailCell icon={<Car className="h-4 w-4" />} label={vehicleLabel} value={plate} />
      </div>

      <div className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">Estimated cost</p>
          <p className="mt-1 text-lg font-semibold text-neutral-950">{formatPeso(reservation.estimated_cost)}</p>
        </div>
        <div className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
          {reservation.status === "confirmed" ? "Ready to park" : reservation.status === "pending" ? "Awaiting confirmation" : "Reservation record"}
        </div>
      </div>
    </article>
  );
}

function DetailCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 bg-white p-4">
      <div className="flex items-center gap-2 text-neutral-400">
        {icon}
        <span className="truncate text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-neutral-800" title={value}>{value}</p>
    </div>
  );
}
