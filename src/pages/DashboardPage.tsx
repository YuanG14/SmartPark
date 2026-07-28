import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

// MOCK DATA — this whole page is hardcoded for the Phase 2 layout preview.
// Real Supabase-backed data replaces this in Phase 5 (user dashboard) and
// Phase 12 (admin analytics).
const mockOverview = { available: 24, occupied: 31, reserved: 8, total: 63 };
const mockCurrentParking = {
  facility: "SmartPark Demo Lot",
  space: "A17",
  plate: "ABC 1234",
  startedAt: "10:00 AM",
};
const mockNearby = [
  { name: "Downtown Plaza Parking", spacesAvailable: 24, distance: "250m", rate: 30 },
  { name: "Riverside Parking", spacesAvailable: 12, distance: "500m", rate: 25 },
];

function peso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Welcome back 👋</h1>
          <p className="text-sm text-neutral-500">
            This preview uses mock data — real reservations arrive in Phase 5.
          </p>
        </div>
        <Button>Find Parking</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Parking Overview" />
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full bg-brand-500"
              style={{
                width: `${((mockOverview.occupied + mockOverview.reserved) / mockOverview.total) * 100}%`,
              }}
            />
          </div>
          <dl className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-neutral-500">Available</dt>
              <dd className="text-lg font-semibold text-neutral-900">{mockOverview.available}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Occupied</dt>
              <dd className="text-lg font-semibold text-neutral-900">{mockOverview.occupied}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Reserved</dt>
              <dd className="text-lg font-semibold text-neutral-900">{mockOverview.reserved}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader
            title="Current Parking"
            action={<Badge tone="danger">🔴 Occupied</Badge>}
          />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-neutral-500">Facility</dt>
              <dd className="font-medium text-neutral-900">{mockCurrentParking.facility}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Space</dt>
              <dd className="font-medium text-neutral-900">{mockCurrentParking.space}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Vehicle</dt>
              <dd className="font-medium text-neutral-900">{mockCurrentParking.plate}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Started</dt>
              <dd className="font-medium text-neutral-900">{mockCurrentParking.startedAt}</dd>
            </div>
          </dl>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="secondary">
              View reservation
            </Button>
            <Button size="sm" variant="ghost">
              Extend parking
            </Button>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title="Nearby Parking" />
          <div className="grid gap-4 sm:grid-cols-2">
            {mockNearby.map((lot) => (
              <div
                key={lot.name}
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-4"
              >
                <div>
                  <p className="font-medium text-neutral-900">{lot.name}</p>
                  <p className="text-sm text-neutral-500">
                    {lot.spacesAvailable} spaces available · {lot.distance} · {peso(lot.rate)}/hr
                  </p>
                </div>
                <Button size="sm" variant="secondary">
                  View
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
