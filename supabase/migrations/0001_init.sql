-- =============================================================================
-- SmartPark — Phase 3: Initial schema
-- Run via Supabase CLI (`supabase db push`) or paste into the SQL editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
-- pgcrypto: gen_random_uuid() for primary keys, gen_random_bytes() for QR tokens.
-- btree_gist: required so the reservations EXCLUDE constraint below can mix
--             an equality column (parking_space_id) with a range overlap (&&).
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('user', 'staff', 'admin');
create type vehicle_type as enum ('car', 'motorcycle', 'van', 'truck');
create type parking_space_status as enum ('available', 'reserved', 'occupied', 'maintenance', 'blocked');
create type reservation_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'expired');

-- ---------------------------------------------------------------------------
-- profiles
-- One row per auth.users row. `role` is the single source of truth for
-- authorization — the client never gets to declare its own role.
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'user',
  full_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- vehicles
-- ---------------------------------------------------------------------------
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  plate_number text not null,
  vehicle_type vehicle_type not null default 'car',
  make text,
  model text,
  created_at timestamptz not null default now(),
  unique (plate_number)
);

create index idx_vehicles_profile_id on vehicles (profile_id);

-- ---------------------------------------------------------------------------
-- parking_lots
-- ---------------------------------------------------------------------------
create table parking_lots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  operating_hours text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- parking_spaces
-- ---------------------------------------------------------------------------
create table parking_spaces (
  id uuid primary key default gen_random_uuid(),
  parking_lot_id uuid not null references parking_lots (id) on delete cascade,
  zone text not null,
  space_number text not null,
  vehicle_type_supported vehicle_type not null default 'car',
  status parking_space_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parking_lot_id, space_number)
);

create index idx_parking_spaces_lot_id on parking_spaces (parking_lot_id);
create index idx_parking_spaces_status on parking_spaces (status);

-- ---------------------------------------------------------------------------
-- parking_rate_rules — configurable PHP pricing per lot + vehicle type
-- ---------------------------------------------------------------------------
create table parking_rate_rules (
  id uuid primary key default gen_random_uuid(),
  parking_lot_id uuid not null references parking_lots (id) on delete cascade,
  vehicle_type vehicle_type not null,
  base_rate numeric(10, 2) not null check (base_rate >= 0),
  additional_hour_rate numeric(10, 2) not null check (additional_hour_rate >= 0),
  daily_maximum numeric(10, 2) not null check (daily_maximum >= base_rate),
  effective_from date not null default current_date,
  effective_until date,
  created_at timestamptz not null default now(),
  check (effective_until is null or effective_until >= effective_from)
);

create index idx_rate_rules_lot_vehicle on parking_rate_rules (parking_lot_id, vehicle_type);

-- ---------------------------------------------------------------------------
-- reservations — the critical table. See the EXCLUDE constraint below.
-- ---------------------------------------------------------------------------
create table reservations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  vehicle_id uuid not null references vehicles (id) on delete restrict,
  parking_space_id uuid not null references parking_spaces (id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status reservation_status not null default 'pending',
  -- QR encodes only this token — never reservation details directly.
  qr_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  qr_used_at timestamptz,
  estimated_cost numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index idx_reservations_profile_id on reservations (profile_id);
create index idx_reservations_space_id on reservations (parking_space_id);

-- THE anchor of the reservation system: the database itself rejects any
-- overlapping active reservation for the same space, atomically, regardless
-- of how many concurrent requests race to insert at once. Cancelled/expired/
-- completed reservations are excluded from the check so a freed-up slot can
-- be rebooked.
alter table reservations
  add constraint no_overlapping_reservations
  exclude using gist (
    parking_space_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status in ('pending', 'confirmed'));

-- ---------------------------------------------------------------------------
-- parking_entries / parking_exits
-- ---------------------------------------------------------------------------
create table parking_entries (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references reservations (id) on delete cascade,
  recorded_by uuid not null references profiles (id),
  entered_at timestamptz not null default now()
);

create table parking_exits (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references reservations (id) on delete cascade,
  recorded_by uuid not null references profiles (id),
  exited_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_profile_unread on notifications (profile_id, is_read);

-- ---------------------------------------------------------------------------
-- maintenance_reports
-- ---------------------------------------------------------------------------
create table maintenance_reports (
  id uuid primary key default gen_random_uuid(),
  parking_space_id uuid not null references parking_spaces (id) on delete cascade,
  reported_by uuid not null references profiles (id),
  description text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- audit_logs — never store secrets here, only who/what/when.
-- ---------------------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_actor on audit_logs (actor_id);
create index idx_audit_logs_resource on audit_logs (resource_type, resource_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================

-- Helper: reads the caller's role once, used inside policies below.
-- SECURITY DEFINER so it can read `profiles` even though the calling role
-- itself might not (yet) have a SELECT policy granting that.
create function current_user_role()
returns user_role
language sql
security definer
stable
as $$
  select role from profiles where id = auth.uid();
$$;

alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table parking_lots enable row level security;
alter table parking_spaces enable row level security;
alter table parking_rate_rules enable row level security;
alter table reservations enable row level security;
alter table parking_entries enable row level security;
alter table parking_exits enable row level security;
alter table notifications enable row level security;
alter table maintenance_reports enable row level security;
alter table audit_logs enable row level security;

-- profiles: read own row, or any row if admin/staff (staff need to see
-- driver names at the gate). Only admins may change someone's role.
create policy "profiles_select_own_or_staff" on profiles
  for select using (id = auth.uid() or current_user_role() in ('staff', 'admin'));
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));
create policy "profiles_admin_all" on profiles
  for all using (current_user_role() = 'admin');

-- vehicles: owner-only, admins can see all.
create policy "vehicles_owner_rw" on vehicles
  for all using (profile_id = auth.uid() or current_user_role() = 'admin')
  with check (profile_id = auth.uid() or current_user_role() = 'admin');

-- parking_lots / parking_spaces / parking_rate_rules: public read (anyone
-- browsing before login should see availability), admin-only write.
create policy "parking_lots_public_read" on parking_lots for select using (true);
create policy "parking_lots_admin_write" on parking_lots for insert with check (current_user_role() = 'admin');
create policy "parking_lots_admin_update" on parking_lots for update using (current_user_role() = 'admin');
create policy "parking_lots_admin_delete" on parking_lots for delete using (current_user_role() = 'admin');

create policy "parking_spaces_public_read" on parking_spaces for select using (true);
create policy "parking_spaces_admin_write" on parking_spaces for insert with check (current_user_role() = 'admin');
create policy "parking_spaces_staff_admin_update" on parking_spaces for update
  using (current_user_role() in ('staff', 'admin'));
create policy "parking_spaces_admin_delete" on parking_spaces for delete using (current_user_role() = 'admin');

create policy "rate_rules_public_read" on parking_rate_rules for select using (true);
create policy "rate_rules_admin_write" on parking_rate_rules for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

-- reservations: users manage their own; staff can read all (need to look up
-- a reservation at the gate); admins can do everything.
create policy "reservations_owner_rw" on reservations
  for all using (profile_id = auth.uid() or current_user_role() = 'admin')
  with check (profile_id = auth.uid() or current_user_role() = 'admin');
create policy "reservations_staff_read" on reservations
  for select using (current_user_role() = 'staff');

-- parking_entries / parking_exits: staff and admins only. Drivers read their
-- own reservation's entry/exit records via a join in the app layer, not
-- directly against this table, to keep the policy simple.
create policy "entries_staff_admin_rw" on parking_entries
  for all using (current_user_role() in ('staff', 'admin'))
  with check (current_user_role() in ('staff', 'admin'));
create policy "exits_staff_admin_rw" on parking_exits
  for all using (current_user_role() in ('staff', 'admin'))
  with check (current_user_role() in ('staff', 'admin'));

-- notifications: owner-only.
create policy "notifications_owner_rw" on notifications
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- maintenance_reports: staff/admin can create and read; admin resolves.
create policy "maintenance_staff_admin_read" on maintenance_reports
  for select using (current_user_role() in ('staff', 'admin'));
create policy "maintenance_staff_admin_insert" on maintenance_reports
  for insert with check (current_user_role() in ('staff', 'admin'));
create policy "maintenance_admin_update" on maintenance_reports
  for update using (current_user_role() = 'admin');

-- audit_logs: admin read-only from the client. Writes happen via
-- SECURITY DEFINER functions / Edge Functions, never a direct client insert,
-- so a compromised frontend can't falsify the trail.
create policy "audit_logs_admin_read" on audit_logs
  for select using (current_user_role() = 'admin');
