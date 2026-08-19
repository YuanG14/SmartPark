// Hand-written to match supabase/migrations/0001_init.sql.
// In a real workflow you'd run `supabase gen types typescript` against the
// live project instead — noted here since this sandbox has no network
// access to a live Supabase project to generate against.

export type UserRole = "user" | "staff" | "admin";
export type VehicleType = "car" | "motorcycle" | "van" | "truck";
export type ParkingSpaceStatus = "available" | "reserved" | "occupied" | "maintenance" | "blocked";
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed" | "expired" | "rejected";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  profile_id: string;
  plate_number: string;
  vehicle_type: VehicleType;
  make: string | null;
  model: string | null;
  created_at: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  operating_hours: string | null;
  created_at: string;
}

export interface ParkingSpace {
  id: string;
  parking_lot_id: string;
  zone: string;
  space_number: string;
  vehicle_type_supported: VehicleType;
  status: ParkingSpaceStatus;
  created_at: string;
  updated_at: string;
}

export interface ParkingRateRule {
  id: string;
  parking_lot_id: string;
  vehicle_type: VehicleType;
  base_rate: number;
  additional_hour_rate: number;
  daily_maximum: number;
  effective_from: string;
  effective_until: string | null;
  created_at: string;
}

export interface Reservation {
  id: string;
  profile_id: string;
  vehicle_id: string;
  parking_space_id: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  qr_token: string;
  qr_used_at: string | null;
  estimated_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface ParkingEntry {
  id: string;
  reservation_id: string;
  recorded_by: string;
  entered_at: string;
}

export interface ParkingExit {
  id: string;
  reservation_id: string;
  recorded_by: string;
  exited_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface MaintenanceReport {
  id: string;
  parking_space_id: string;
  reported_by: string;
  description: string;
  resolved: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}


export interface Payment {
  id: string;
  reservation_id: string;
  profile_id: string;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
