import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  CalendarClock,
  Check,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import type { PaymentStatus, ReservationStatus } from "../types/database";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";

const reservationStatus: Record<ReservationStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  pending: { label: "Pending review", tone: "warning" },
  confirmed: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  completed: { label: "Completed", tone: "neutral" },
  expired: { label: "Expired", tone: "danger" },
};

const paymentStatus: Record<PaymentStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  pending: { label: "Pending", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
};

function peso(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const {
    reservations,
    payments,
    loading,
    error,
    actionId,
    metrics,
    refresh,
    decideReservation,
    updatePaymentStatus,
  } = useAdminDashboard();
  const [tab, setTab] = useState<"reservations" | "payments">("reservations");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const filteredReservations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reservations;
    return reservations.filter((item) =>
      [
        item.profile?.full_name,
        item.vehicle?.plate_number,
        item.parking_space?.space_number,
        item.parking_space?.parking_lot?.name,
        item.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [reservations, query]);

  const filteredPayments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((item) =>
      [
        item.profile?.full_name,
        item.reservation?.vehicle?.plate_number,
        item.reservation?.parking_space?.parking_lot?.name,
        item.status,
        item.reference,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [payments, query]);

  async function review(id: string, decision: "accept" | "reject") {
    setMessage(null);
    const result = await decideReservation(id, decision);
    setMessage(result.error ?? `Reservation ${decision === "accept" ? "approved" : "rejected"}.`);
  }

  async function setPayment(id: string, status: PaymentStatus) {
    setMessage(null);
    const result = await updatePaymentStatus(id, status);
    setMessage(result.error ?? `Payment marked ${status}.`);
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-sm shadow-neutral-200/60">
        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
              <ShieldCheck className="h-4 w-4" /> Admin control center
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">Reservations & payments</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Review booking requests, approve or reject pending reservations, and monitor SmartPark payment records.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <p className="font-semibold">Admin access</p>
            <p className="mt-0.5 text-xs text-brand-700">Actions are protected by Supabase role checks and audit logging.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<CalendarClock className="h-5 w-5" />} label="Pending reviews" value={metrics.pendingReservations} note="Need an admin decision" />
        <Metric icon={<BadgeCheck className="h-5 w-5" />} label="Approved" value={metrics.confirmedReservations} note="Active confirmed bookings" />
        <Metric icon={<CreditCard className="h-5 w-5" />} label="Pending payments" value={metrics.pendingPayments} note="Internal payment ledger" />
        <Metric icon={<Banknote className="h-5 w-5" />} label="Paid revenue" value={peso(metrics.paidRevenue)} note="Recorded as paid" />
      </section>

      {message && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">{message}</div>
      )}

      <section className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm shadow-neutral-200/60">
        <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="inline-flex w-fit rounded-2xl bg-neutral-100 p-1.5">
            <button onClick={() => setTab("reservations")} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === "reservations" ? "bg-brand-600 text-white" : "text-neutral-600 hover:text-neutral-950"}`}>
              Reservations ({reservations.length})
            </button>
            <button onClick={() => setTab("payments")} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === "payments" ? "bg-brand-600 text-white" : "text-neutral-600 hover:text-neutral-950"}`}>
              Payments ({payments.length})
            </button>
          </div>
          <label className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <span className="sr-only">Search admin records</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search user, plate, location..." className="h-11 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100" />
          </label>
        </div>

        <div className="p-5 sm:p-6">
          {loading && <div className="space-y-3"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div>}
          {!loading && error && <ErrorState description={error} onRetry={refresh} />}

          {!loading && !error && tab === "reservations" && (
            <div className="space-y-3">
              {filteredReservations.length === 0 && <Empty label="No reservations found" />}
              {filteredReservations.map((item) => {
                const status = reservationStatus[item.status];
                const busy = actionId === item.id;
                return (
                  <article key={item.id} className="rounded-[22px] border border-neutral-200 p-5 transition hover:border-neutral-300 hover:shadow-sm">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={status.tone}>{status.label}</Badge>
                          <span className="text-xs font-semibold text-neutral-400">#{item.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <Info icon={<UserRound className="h-4 w-4" />} label="Driver" value={item.profile?.full_name ?? "Unknown user"} />
                          <Info icon={<MapPin className="h-4 w-4" />} label="Parking" value={`${item.parking_space?.parking_lot?.name ?? "Unknown lot"} · ${item.parking_space?.space_number ?? "—"}`} />
                          <Info icon={<CalendarClock className="h-4 w-4" />} label="Schedule" value={dateTime(item.start_time)} />
                          <Info icon={<Banknote className="h-4 w-4" />} label="Amount" value={peso(Number(item.estimated_cost ?? 0))} />
                        </div>
                        <p className="mt-3 text-xs text-neutral-400">Vehicle: {item.vehicle?.plate_number ?? "—"} · Ends {dateTime(item.end_time)}</p>
                      </div>

                      {item.status === "pending" ? (
                        <div className="flex shrink-0 gap-2">
                          <Button variant="secondary" disabled={busy} onClick={() => review(item.id, "reject")} className="rounded-xl text-rose-700 hover:bg-rose-50">
                            <X className="h-4 w-4" /> Reject
                          </Button>
                          <Button disabled={busy} onClick={() => review(item.id, "accept")} className="rounded-xl">
                            <Check className="h-4 w-4" /> Accept
                          </Button>
                        </div>
                      ) : (
                        <span className="shrink-0 text-xs font-semibold text-neutral-400">Reviewed</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && tab === "payments" && (
            <div className="space-y-3">
              {filteredPayments.length === 0 && <Empty label="No payment records found" />}
              {filteredPayments.map((item) => {
                const status = paymentStatus[item.status];
                const busy = actionId === item.id;
                return (
                  <article key={item.id} className="rounded-[22px] border border-neutral-200 p-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={status.tone}>{status.label}</Badge>
                          <span className="text-xs font-semibold text-neutral-400">Payment #{item.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <Info icon={<UserRound className="h-4 w-4" />} label="Customer" value={item.profile?.full_name ?? "Unknown user"} />
                          <Info icon={<Banknote className="h-4 w-4" />} label="Amount" value={peso(Number(item.amount))} />
                          <Info icon={<CreditCard className="h-4 w-4" />} label="Method" value={item.method ?? "Not specified"} />
                          <Info icon={<CalendarClock className="h-4 w-4" />} label="Created" value={dateTime(item.created_at)} />
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {item.status !== "paid" && (
                          <Button disabled={busy} onClick={() => setPayment(item.id, "paid")} className="rounded-xl">Mark paid</Button>
                        )}
                        {item.status === "paid" && (
                          <Button variant="secondary" disabled={busy} onClick={() => setPayment(item.id, "refunded")} className="rounded-xl">Refund</Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <p className="px-1 text-xs leading-5 text-neutral-400">
        Payment actions in this version update SmartPark's internal ledger only. No real GCash/card charge or refund occurs until a payment gateway is integrated.
      </p>
    </div>
  );
}

function Metric({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string | number; note: string }) {
  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/50">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">{icon}</div>
      <p className="mt-4 text-sm font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">{value}</p>
      <p className="mt-1 text-xs text-neutral-400">{note}</p>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-neutral-50 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">{icon}{label}</div>
      <p className="mt-1.5 truncate text-sm font-semibold text-neutral-800" title={value}>{value}</p>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-[22px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center text-sm font-medium text-neutral-500">{label}</div>;
}
