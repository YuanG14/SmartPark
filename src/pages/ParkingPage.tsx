import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  CircleParking,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useParkingOverview } from "../hooks/useParkingOverview";
import { supabase } from "../lib/supabase";
import type { ParkingRateRule, ParkingSpace, ParkingSpaceStatus, VehicleType } from "../types/database";

type FilterStatus = "all" | ParkingSpaceStatus;
type VehicleFilter = "all" | VehicleType;

const statusConfig: Record<
  ParkingSpaceStatus,
  { label: string; dot: string; card: string; icon: string }
> = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    card: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300",
    icon: "text-emerald-600",
  },
  reserved: {
    label: "Reserved",
    dot: "bg-amber-400",
    card: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "text-amber-600",
  },
  occupied: {
    label: "Occupied",
    dot: "bg-rose-500",
    card: "border-rose-200 bg-rose-50 text-rose-900",
    icon: "text-rose-600",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-sky-500",
    card: "border-sky-200 bg-sky-50 text-sky-900",
    icon: "text-sky-600",
  },
  blocked: {
    label: "Blocked",
    dot: "bg-neutral-500",
    card: "border-neutral-200 bg-neutral-100 text-neutral-600",
    icon: "text-neutral-500",
  },
};

const vehicleIcon: Record<VehicleType, typeof Car> = {
  car: Car,
  motorcycle: Bike,
  van: Car,
  truck: Truck,
};

function formatPeso(value: number | null | undefined) {
  if (value == null) return "Rate unavailable";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ParkingPage() {
  const { overview, lots, loading: lotsLoading, error, refresh } = useParkingOverview();
  const [query, setQuery] = useState("");
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [rates, setRates] = useState<ParkingRateRule[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>("all");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  const filteredLots = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return lots;
    return lots.filter((lot) =>
      [lot.name, lot.address, lot.operating_hours]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [lots, query]);

  useEffect(() => {
    if (!selectedLotId && filteredLots.length > 0) {
      setSelectedLotId(filteredLots[0].id);
    }
  }, [filteredLots, selectedLotId]);

  useEffect(() => {
    if (!selectedLotId) {
      setSpaces([]);
      setRates([]);
      return;
    }

    let active = true;
    setSpacesLoading(true);
    setSelectedSpaceId(null);

    Promise.all([
      supabase
        .from("parking_spaces")
        .select("*")
        .eq("parking_lot_id", selectedLotId)
        .order("zone")
        .order("space_number"),
      supabase
        .from("parking_rate_rules")
        .select("*")
        .eq("parking_lot_id", selectedLotId)
        .order("vehicle_type"),
    ]).then(([spacesRes, ratesRes]) => {
      if (!active) return;
      setSpaces((spacesRes.data as ParkingSpace[] | null) ?? []);
      setRates((ratesRes.data as ParkingRateRule[] | null) ?? []);
      setSpacesLoading(false);
    });

    return () => {
      active = false;
    };
  }, [selectedLotId]);

  const selectedLot = lots.find((lot) => lot.id === selectedLotId) ?? null;
  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId) ?? null;

  const visibleSpaces = useMemo(
    () =>
      spaces.filter((space) => {
        const statusMatches = statusFilter === "all" || space.status === statusFilter;
        const vehicleMatches = vehicleFilter === "all" || space.vehicle_type_supported === vehicleFilter;
        return statusMatches && vehicleMatches;
      }),
    [spaces, statusFilter, vehicleFilter]
  );

  const zones = useMemo(
    () => Array.from(new Set(spaces.map((space) => space.zone))).sort(),
    [spaces]
  );

  const selectedRate = selectedSpace
    ? rates.find((rate) => rate.vehicle_type === selectedSpace.vehicle_type_supported)
    : rates.find((rate) => rate.vehicle_type === "car") ?? rates[0];

  const utilization = overview.total
    ? Math.round(((overview.occupied + overview.reserved) / overview.total) * 100)
    : 0;

  return (
    <div className="space-y-7 pb-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <Sparkles className="h-3.5 w-3.5" />
            Live parking availability
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">Find your parking space</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
            Browse facilities, compare live availability, and choose a space that fits your vehicle.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
          <label className="relative min-w-0 flex-1 xl:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <span className="sr-only">Search parking facilities</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search parking or location..."
              className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <Link to="/reservations">
            <Button size="lg" className="w-full rounded-2xl px-5 sm:w-auto">
              Reservations <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CircleParking className="h-5 w-5" />} label="Available" value={overview.available} note="Ready to reserve" tone="emerald" loading={lotsLoading} />
        <StatCard icon={<Car className="h-5 w-5" />} label="Occupied" value={overview.occupied} note="Currently parked" tone="rose" loading={lotsLoading} />
        <StatCard icon={<Clock3 className="h-5 w-5" />} label="Reserved" value={overview.reserved} note="Upcoming use" tone="amber" loading={lotsLoading} />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Network utilization" value={`${utilization}%`} note={`${lots.length} parking ${lots.length === 1 ? "facility" : "facilities"}`} tone="brand" loading={lotsLoading} />
      </section>

      {error ? (
        <div className="flex flex-col gap-3 rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-rose-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Parking data could not be loaded.</p>
            <p className="mt-1 text-sm text-rose-700">Check your connection and try again.</p>
          </div>
          <Button variant="secondary" onClick={refresh}>Try again</Button>
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[0.74fr_1.45fr]">
        <aside className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm shadow-neutral-200/60">
          <div className="border-b border-neutral-100 px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Facilities</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">Nearby parking</h2>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">{filteredLots.length}</span>
            </div>
          </div>

          <div className="max-h-[640px] space-y-3 overflow-y-auto p-4">
            {lotsLoading ? (
              <>
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
              </>
            ) : filteredLots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-10 text-center">
                <MapPin className="mx-auto h-8 w-8 text-neutral-300" />
                <p className="mt-3 font-semibold text-neutral-900">No parking found</p>
                <p className="mt-1 text-sm text-neutral-500">Try another facility name or location.</p>
              </div>
            ) : (
              filteredLots.map((lot) => {
                const selected = lot.id === selectedLotId;
                const percent = lot.total_count ? Math.round((lot.available_count / lot.total_count) * 100) : 0;
                return (
                  <button
                    key={lot.id}
                    type="button"
                    onClick={() => setSelectedLotId(lot.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-lg shadow-neutral-300/50"
                        : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md hover:shadow-neutral-200/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`truncate font-semibold ${selected ? "text-white" : "text-neutral-950"}`}>{lot.name}</p>
                        <p className={`mt-1 flex items-center gap-1.5 text-xs ${selected ? "text-neutral-400" : "text-neutral-500"}`}>
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{lot.address || "Parking facility"}</span>
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${selected ? "bg-white/10 text-brand-200" : "bg-emerald-50 text-emerald-700"}`}>
                        {lot.available_count} free
                      </span>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className={`text-2xl font-semibold tracking-tight ${selected ? "text-white" : "text-neutral-950"}`}>
                          {lot.available_count}<span className={`ml-1 text-sm font-medium ${selected ? "text-neutral-500" : "text-neutral-400"}`}>/ {lot.total_count}</span>
                        </p>
                        <p className={`text-xs ${selected ? "text-neutral-400" : "text-neutral-500"}`}>available spaces</p>
                      </div>
                      <div className="w-24">
                        <div className={`h-2 overflow-hidden rounded-full ${selected ? "bg-white/10" : "bg-neutral-100"}`}>
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
                        </div>
                        <p className={`mt-1 text-right text-[11px] font-medium ${selected ? "text-neutral-500" : "text-neutral-400"}`}>{percent}% free</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm shadow-neutral-200/60">
          <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Parking layout</p>
                <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight text-neutral-950">
                  {selectedLot?.name || "Select a parking facility"}
                </h2>
                {selectedLot ? (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{selectedLot.address || "Location unavailable"}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{selectedLot.operating_hours || "Hours unavailable"}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterSelect
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as FilterStatus)}
                  label="Status"
                  options={[
                    ["all", "All statuses"],
                    ["available", "Available"],
                    ["reserved", "Reserved"],
                    ["occupied", "Occupied"],
                    ["maintenance", "Maintenance"],
                    ["blocked", "Blocked"],
                  ]}
                />
                <FilterSelect
                  value={vehicleFilter}
                  onChange={(value) => setVehicleFilter(value as VehicleFilter)}
                  label="Vehicle"
                  options={[
                    ["all", "All vehicles"],
                    ["car", "Car"],
                    ["motorcycle", "Motorcycle"],
                    ["van", "Van"],
                    ["truck", "Truck"],
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 rounded-2xl bg-neutral-50 px-4 py-3">
              {(Object.keys(statusConfig) as ParkingSpaceStatus[]).map((status) => (
                <span key={status} className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusConfig[status].dot}`} />
                  {statusConfig[status].label}
                </span>
              ))}
            </div>

            {spacesLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)}
              </div>
            ) : !selectedLot ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
                <CircleParking className="mx-auto h-10 w-10 text-neutral-300" />
                <p className="mt-4 font-semibold text-neutral-950">Select a parking facility</p>
                <p className="mt-1 text-sm text-neutral-500">Its parking spaces and live availability will appear here.</p>
              </div>
            ) : visibleSpaces.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
                <SlidersHorizontal className="mx-auto h-10 w-10 text-neutral-300" />
                <p className="mt-4 font-semibold text-neutral-950">No spaces match your filters</p>
                <p className="mt-1 text-sm text-neutral-500">Try a different status or vehicle type.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(zones.length ? zones : ["A"]).map((zone) => {
                  const zoneSpaces = visibleSpaces.filter((space) => space.zone === zone);
                  if (zoneSpaces.length === 0) return null;
                  return (
                    <div key={zone}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-800">{zone}</span>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">Zone {zone}</p>
                            <p className="text-xs text-neutral-400">{zoneSpaces.length} visible spaces</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {zoneSpaces.map((space) => {
                          const Icon = vehicleIcon[space.vehicle_type_supported];
                          const isSelected = selectedSpaceId === space.id;
                          const canSelect = space.status === "available";
                          return (
                            <button
                              key={space.id}
                              type="button"
                              disabled={!canSelect}
                              onClick={() => canSelect && setSelectedSpaceId(space.id)}
                              className={`group relative min-h-24 rounded-2xl border p-3 text-left transition ${statusConfig[space.status].card} ${
                                isSelected ? "ring-2 ring-neutral-950 ring-offset-2" : ""
                              } ${canSelect ? "hover:-translate-y-0.5 hover:shadow-md" : "cursor-not-allowed opacity-75"}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-base font-bold tracking-tight">{space.space_number}</span>
                                <span className={`rounded-xl bg-white/70 p-2 shadow-sm ${statusConfig[space.status].icon}`}>
                                  {space.status === "maintenance" ? <Wrench className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                </span>
                              </div>
                              <div className="mt-4 flex items-center gap-2 text-[11px] font-medium capitalize">
                                <span className={`h-2 w-2 rounded-full ${statusConfig[space.status].dot}`} />
                                {statusConfig[space.status].label}
                              </div>
                              <p className="mt-1 text-[11px] capitalize opacity-70">{space.vehicle_type_supported}</p>
                              {isSelected ? (
                                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 text-white shadow-md">
                                  <CheckCircle2 className="h-4 w-4" />
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/60 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Selected space</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                {selectedSpace ? `${selectedLot?.name} · ${selectedSpace.space_number}` : "Choose an available space"}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                {selectedSpace
                  ? `This space supports ${selectedSpace.vehicle_type_supported} parking and is currently available.`
                  : "Select a green available space above to preview the rate and continue to your reservation."}
              </p>
            </div>

            {selectedSpace ? (
              <div className="flex flex-col gap-3 sm:items-end">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Starting rate</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
                    {formatPeso(selectedRate?.base_rate)}
                    {selectedRate ? <span className="ml-1 text-sm font-medium text-neutral-400">base</span> : null}
                  </p>
                </div>
                <Link to="/reservations">
                  <Button size="lg" className="w-full rounded-2xl px-6 sm:w-auto">
                    Continue to reservation <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[28px] bg-neutral-950 p-6 text-white shadow-lg shadow-neutral-300/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">Parking tips</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">Reserve with confidence</h2>
            </div>
            <span className="rounded-2xl bg-white/10 p-2.5 text-brand-300"><ShieldCheck className="h-5 w-5" /></span>
          </div>
          <div className="mt-5 space-y-3 text-sm text-neutral-300">
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />Availability comes directly from your parking database.</p>
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />Unavailable spaces cannot be selected from this page.</p>
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />Parking rates are displayed in Philippine Peso.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  tone,
  loading,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  note: string;
  tone: "emerald" | "rose" | "amber" | "brand";
  loading: boolean;
}) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    brand: "bg-brand-50 text-brand-800",
  };

  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/50">
      <div className="flex items-start gap-4">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          {loading ? <Skeleton className="mt-2 h-8 w-16" /> : <p className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">{value}</p>}
          <p className="mt-1 truncate text-xs text-neutral-400">{note}</p>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: [string, string][];
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 appearance-none rounded-xl border border-neutral-200 bg-white pl-9 pr-9 text-sm font-medium text-neutral-700 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      >
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
      <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </label>
  );
}
