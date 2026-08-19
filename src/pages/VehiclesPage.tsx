import { FormEvent, useMemo, useState } from "react";
import {
  Car,
  CheckCircle2,
  Clock3,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { useVehicles } from "../hooks/useVehicles";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Dialog } from "../components/ui/Dialog";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";
import type { VehicleType } from "../types/database";

const vehicleTypeIcon: Record<VehicleType, string> = {
  car: "🚗",
  motorcycle: "🏍️",
  van: "🚐",
  truck: "🚚",
};

const vehicleTypeLabel: Record<VehicleType, string> = {
  car: "Car",
  motorcycle: "Motorcycle",
  van: "Van",
  truck: "Truck",
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

  const vehicleCounts = useMemo(() => {
    return vehicles.reduce<Record<VehicleType, number>>(
      (acc, vehicle) => {
        acc[vehicle.vehicle_type] += 1;
        return acc;
      },
      { car: 0, motorcycle: 0, van: 0, truck: 0 }
    );
  }, [vehicles]);

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
    setVehicleType("car");
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10">
      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
              <Car className="h-4 w-4" />
              Vehicle garage
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Your vehicles
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
              Keep your vehicles ready for faster parking reservations and a smoother check-in experience.
            </p>
          </div>

          <Button size="lg" className="w-full sm:w-auto" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add vehicle
          </Button>
        </div>

        <div className="grid border-t border-neutral-100 bg-neutral-50/70 sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-neutral-100 px-6 py-4 sm:border-b-0 sm:border-r">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Registered</p>
              <p className="text-lg font-semibold text-neutral-900">{vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-neutral-100 px-6 py-4 sm:border-b-0 sm:border-r">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Status</p>
              <p className="text-lg font-semibold text-neutral-900">Ready to reserve</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Privacy</p>
              <p className="text-lg font-semibold text-neutral-900">Securely stored</p>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
        </div>
      )}

      {!loading && error && <ErrorState description={error} onRetry={refresh} />}

      {!loading && !error && vehicles.length === 0 && (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="relative overflow-hidden p-0">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-50 blur-3xl" aria-hidden="true" />
            <div className="relative flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center sm:px-12">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-brand-100 bg-brand-50 text-brand-600 shadow-sm">
                <Car className="h-9 w-9" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">Your garage is empty</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Add your first vehicle to unlock quicker reservations, personalized parking options, and easier QR check-ins.
              </p>
              <Button size="lg" className="mt-6" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add your first vehicle
              </Button>
              <p className="mt-4 text-xs text-neutral-400">Plate number, vehicle type, make and model only.</p>
            </div>
          </Card>

          <div className="grid gap-4">
            <Card className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Faster booking</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500">Select a saved vehicle instead of entering its details every time.</p>
              </div>
            </Card>
            <Card className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Better recommendations</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500">SmartPark can match suitable spaces with your vehicle type.</p>
              </div>
            </Card>
            <Card className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Easy management</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500">Keep all your registered vehicles organized in one secure place.</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {!loading && !error && vehicles.length > 0 && (
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-600">My garage</p>
              <h2 className="mt-1 text-xl font-semibold text-neutral-900">Registered vehicles</h2>
            </div>
            <p className="text-sm text-neutral-500">
              {vehicleCounts.car} car{vehicleCounts.car === 1 ? "" : "s"} · {vehicleCounts.motorcycle} motorcycle{vehicleCounts.motorcycle === 1 ? "" : "s"} · {vehicleCounts.van + vehicleCounts.truck} larger vehicle{vehicleCounts.van + vehicleCounts.truck === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((v) => (
              <Card key={v.id} className="group overflow-hidden p-0 transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between border-b border-neutral-100 bg-gradient-to-br from-brand-50/80 to-white p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-white text-2xl shadow-sm">
                      {vehicleTypeIcon[v.vehicle_type]}
                    </div>
                    <div>
                      <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100">
                        {vehicleTypeLabel[v.vehicle_type]}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold tracking-wide text-neutral-950">{v.plate_number}</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(v.id)}
                    className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    aria-label={`Remove ${v.plate_number}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Vehicle details</p>
                  <p className="mt-2 font-medium text-neutral-800">
                    {[v.make, v.model].filter(Boolean).join(" ") || "Make and model not specified"}
                  </p>
                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <CheckCircle2 className="h-4 w-4 text-brand-600" />
                      Ready for booking
                    </div>
                    <span className="text-xs font-medium text-brand-700">Active</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Card className="border-brand-100 bg-brand-50/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Driving a different vehicle?</h3>
              <p className="mt-1 text-sm text-neutral-500">You can register cars, motorcycles, vans, and trucks in SmartPark.</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add another vehicle
          </Button>
        </div>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add a vehicle">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-sm font-medium text-brand-800">Vehicle information</p>
            <p className="mt-1 text-xs leading-5 text-brand-700/80">Add the vehicle you normally use when making parking reservations.</p>
          </div>
          <Input
            label="Plate number"
            required
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="e.g. ABC 1234"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Make (optional)" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" />
            <Input label="Model (optional)" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Vios" />
          </div>
          {formError && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              <Plus className="h-4 w-4" />
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
        <div className="rounded-2xl bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">This action can’t be undone.</p>
          <p className="mt-1 text-sm leading-5 text-red-600">The vehicle will be removed from your SmartPark garage and will no longer be available for new reservations.</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPendingDeleteId(null)}>
            Keep vehicle
          </Button>
          <Button variant="danger" onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}>
            <Trash2 className="h-4 w-4" />
            Remove vehicle
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
