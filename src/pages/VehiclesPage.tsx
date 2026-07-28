import { FormEvent, useState } from "react";
import { Car } from "lucide-react";
import { useVehicles } from "../hooks/useVehicles";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Dialog } from "../components/ui/Dialog";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";
import type { VehicleType } from "../types/database";

const vehicleTypeIcon: Record<VehicleType, string> = {
  car: "🚗",
  motorcycle: "🏍️",
  van: "🚐",
  truck: "🚚",
};

export default function VehiclesPage() {
  const { vehicles, loading, error, addVehicle, deleteVehicle, refresh } = useVehicles();
  const { showToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const { error } = await addVehicle({
      plate_number: plateNumber.trim().toUpperCase(),
      vehicle_type: vehicleType,
      make: make.trim() || undefined,
      model: model.trim() || undefined,
    });
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    setPlateNumber("");
    setMake("");
    setModel("");
    setDialogOpen(false);
    showToast("Vehicle added", "success");
  }

  async function handleDelete(id: string) {
    const { error } = await deleteVehicle(id);
    setPendingDeleteId(null);
    if (error) showToast(error, "error");
    else showToast("Vehicle removed", "success");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Your vehicles</h1>
        <Button onClick={() => setDialogOpen(true)}>Add vehicle</Button>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!loading && error && <ErrorState description={error} onRetry={refresh} />}

      {!loading && !error && vehicles.length === 0 && (
        <EmptyState
          icon={<Car className="h-10 w-10" />}
          title="No vehicles yet"
          description="Add a vehicle so you can reserve parking for it."
          action={<Button onClick={() => setDialogOpen(true)}>Add vehicle</Button>}
        />
      )}

      {!loading && !error && vehicles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {vehicles.map((v) => (
            <Card key={v.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">
                  {vehicleTypeIcon[v.vehicle_type]} {v.plate_number}
                </p>
                <p className="text-sm text-neutral-500">
                  {[v.make, v.model].filter(Boolean).join(" ") || "No make/model on file"}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPendingDeleteId(v.id)}>
                Remove
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add a vehicle">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <Input
            label="Plate number"
            required
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
          />
          <Select
            label="Vehicle type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as VehicleType)}
            options={[
              { value: "car", label: "🚗 Car" },
              { value: "motorcycle", label: "🏍️ Motorcycle" },
              { value: "van", label: "🚐 Van" },
              { value: "truck", label: "🚚 Truck" },
            ]}
          />
          <Input label="Make (optional)" value={make} onChange={(e) => setMake(e.target.value)} />
          <Input label="Model (optional)" value={model} onChange={(e) => setModel(e.target.value)} />
          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Add vehicle
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        title="Remove this vehicle?"
      >
        <p className="text-sm text-neutral-600">This can't be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPendingDeleteId(null)}>
            Keep vehicle
          </Button>
          <Button variant="danger" onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}>
            Remove
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
