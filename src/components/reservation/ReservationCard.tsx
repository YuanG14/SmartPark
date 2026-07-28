import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { ReservationWithRelations } from "../../hooks/useReservations";
import type { ReservationStatus } from "../../types/database";

const statusTone: Record<ReservationStatus, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  pending: { tone: "warning", label: "🟡 Pending" },
  confirmed: { tone: "success", label: "🟢 Confirmed" },
  completed: { tone: "neutral", label: "✓ Completed" },
  cancelled: { tone: "neutral", label: "✕ Cancelled" },
  expired: { tone: "danger", label: "⏱ Expired" },
};

function formatRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateStr = startDate.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  const startTime = startDate.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
  const endTime = endDate.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
  return `${dateStr} · ${startTime} – ${endTime}`;
}

export function ReservationCard({ reservation }: { reservation: ReservationWithRelations }) {
  const status = statusTone[reservation.status];
  const lotName = reservation.parking_space?.parking_lot?.name ?? "Unknown facility";
  const spaceNumber = reservation.parking_space?.space_number ?? "—";
  const plate = reservation.vehicle?.plate_number ?? "—";

  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-neutral-900">{lotName}</p>
        <p className="text-sm text-neutral-500">
          Space {spaceNumber} · {plate}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          {formatRange(reservation.start_time, reservation.end_time)}
        </p>
      </div>
      <Badge tone={status.tone}>{status.label}</Badge>
    </Card>
  );
}
