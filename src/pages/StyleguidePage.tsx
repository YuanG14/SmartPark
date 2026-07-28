import { useState } from "react";
import { Car, CircleParking, TriangleAlert } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Dialog } from "../components/ui/Dialog";
import { useToast } from "../components/ui/Toast";
import { Skeleton } from "../components/ui/Skeleton";
import { Avatar } from "../components/ui/Avatar";
import { Tabs } from "../components/ui/Tabs";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";

export default function StyleguidePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Design system</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Every reusable component built in Phase 2, in one place.
        </p>
      </div>

      <Card>
        <CardHeader title="Buttons" />
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Reserve Parking</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="danger">Delete</Button>
          <Button isLoading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Parking space status badges" />
        <p className="mb-3 text-xs text-neutral-500">
          Icon + text pairs with color — never color alone.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">🟢 Available</Badge>
          <Badge tone="warning">🟡 Reserved</Badge>
          <Badge tone="danger">🔴 Occupied</Badge>
          <Badge tone="neutral">🔧 Maintenance</Badge>
          <Badge tone="neutral" icon={<TriangleAlert className="h-3 w-3" />}>
            Blocked
          </Badge>
        </div>
      </Card>

      <Card>
        <CardHeader title="Form controls" />
        <div className="grid max-w-md gap-4">
          <Input label="Vehicle plate number" placeholder="ABC 1234" />
          <Input
            label="Email"
            type="email"
            error="Enter a valid email address"
            defaultValue="not-an-email"
          />
          <Select
            label="Vehicle type"
            options={[
              { value: "car", label: "🚗 Car" },
              { value: "motorcycle", label: "🏍️ Motorcycle" },
              { value: "van", label: "🚐 Van" },
              { value: "truck", label: "🚚 Truck" },
            ]}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Tabs (zone selector pattern)" />
        <Tabs
          tabs={[
            { id: "a", label: "Zone A" },
            { id: "b", label: "Zone B" },
            { id: "c", label: "Zone C" },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Avatars" />
        <div className="flex items-center gap-3">
          <Avatar name="Danny Hong" size="sm" />
          <Avatar name="Maria Santos" size="md" />
          <Avatar name="Jun Dela Cruz" size="lg" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Dialog & toast" />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Open cancel-reservation dialog
          </Button>
          <Button variant="secondary" onClick={() => showToast("Reservation confirmed", "success")}>
            Trigger success toast
          </Button>
          <Button variant="secondary" onClick={() => showToast("Could not save changes", "error")}>
            Trigger error toast
          </Button>
        </div>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Cancel reservation?">
          <p className="text-sm text-neutral-600">
            This will free up space A-17 for other drivers. This can't be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Keep reservation
            </Button>
            <Button variant="danger" onClick={() => setDialogOpen(false)}>
              Cancel reservation
            </Button>
          </div>
        </Dialog>
      </Card>

      <Card>
        <CardHeader title="Loading skeleton" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Empty state" />
        <EmptyState
          icon={<CircleParking className="h-10 w-10" />}
          title="No reservations yet"
          description="Once you reserve a parking space, it'll show up here."
          action={<Button size="sm">Find parking</Button>}
        />
      </Card>

      <Card>
        <CardHeader title="Error state" />
        <ErrorState
          title="Couldn't load parking spaces"
          description="Check your connection and try again."
          onRetry={() => showToast("Retrying…")}
        />
      </Card>

      <Card>
        <CardHeader title="Icons (lucide-react)" />
        <div className="flex gap-4 text-neutral-700">
          <Car className="h-5 w-5" />
          <CircleParking className="h-5 w-5" />
        </div>
      </Card>
    </div>
  );
}
