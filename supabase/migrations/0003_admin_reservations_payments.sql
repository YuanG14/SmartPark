-- =============================================================================
-- SmartPark — Admin reservation review + payment tracking
-- =============================================================================

-- A rejected state is distinct from a user cancellation, so the UI and audit
-- trail can tell who made the decision.
alter type reservation_status add value if not exists 'rejected';

-- Payments are tracked internally. This does NOT integrate a real payment
-- gateway; it records the amount/status for admin operations and future gateway
-- integration.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end $$;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references reservations (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  status payment_status not null default 'pending',
  method text,
  reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_profile_id on payments (profile_id);
create index if not exists idx_payments_status on payments (status);

alter table payments enable row level security;

-- Drivers may only read their own payment records. Admins can read all.
drop policy if exists "payments_owner_read" on payments;
create policy "payments_owner_read" on payments
  for select using (profile_id = auth.uid());

drop policy if exists "payments_admin_all" on payments;
create policy "payments_admin_all" on payments
  for all using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

-- Automatically create one payment ledger row for every new reservation.
create or replace function create_payment_for_reservation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into payments (reservation_id, profile_id, amount, status)
  values (new.id, new.profile_id, coalesce(new.estimated_cost, 0), 'pending')
  on conflict (reservation_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_create_payment_for_reservation on reservations;
create trigger trg_create_payment_for_reservation
after insert on reservations
for each row execute function create_payment_for_reservation();

-- Backfill payment records for reservations created before this migration.
insert into payments (reservation_id, profile_id, amount, status)
select r.id, r.profile_id, coalesce(r.estimated_cost, 0),
       case when r.status = 'completed' then 'paid'::payment_status else 'pending'::payment_status end
from reservations r
on conflict (reservation_id) do nothing;

-- Admin-only reservation decision. Keeps reservation update, user notification,
-- and audit logging together so the frontend cannot partially apply a decision.
create or replace function admin_decide_reservation(
  p_reservation_id uuid,
  p_decision text
)
returns reservation_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation reservations%rowtype;
  v_new_status reservation_status;
begin
  if current_user_role() <> 'admin' then
    raise exception 'Admin access required';
  end if;

  if p_decision = 'accept' then
    v_new_status := 'confirmed';
  elsif p_decision = 'reject' then
    v_new_status := 'rejected';
  else
    raise exception 'Decision must be accept or reject';
  end if;

  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation not found';
  end if;

  if v_reservation.status <> 'pending' then
    raise exception 'Only pending reservations can be reviewed';
  end if;

  update reservations
  set status = v_new_status, updated_at = now()
  where id = p_reservation_id;

  insert into notifications (profile_id, type, message)
  values (
    v_reservation.profile_id,
    case when v_new_status = 'confirmed' then 'reservation_approved' else 'reservation_rejected' end,
    case when v_new_status = 'confirmed'
      then 'Your parking reservation has been approved by SmartPark.'
      else 'Your parking reservation was not approved. Please choose another parking space or schedule.'
    end
  );

  insert into audit_logs (actor_id, action, resource_type, resource_id, metadata)
  values (
    auth.uid(),
    case when v_new_status = 'confirmed' then 'RESERVATION_APPROVED' else 'RESERVATION_REJECTED' end,
    'reservation',
    p_reservation_id,
    jsonb_build_object('previous_status', v_reservation.status, 'new_status', v_new_status)
  );

  return v_new_status;
end;
$$;

grant execute on function admin_decide_reservation(uuid, text) to authenticated;

-- Admin-only payment status update. No real funds move here; this updates the
-- internal ledger only until a payment gateway is integrated.
create or replace function admin_update_payment_status(
  p_payment_id uuid,
  p_status payment_status
)
returns payment_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment payments%rowtype;
begin
  if current_user_role() <> 'admin' then
    raise exception 'Admin access required';
  end if;

  select * into v_payment from payments where id = p_payment_id for update;
  if not found then raise exception 'Payment not found'; end if;

  update payments
  set status = p_status,
      paid_at = case when p_status = 'paid' then coalesce(paid_at, now()) else paid_at end,
      updated_at = now()
  where id = p_payment_id;

  insert into audit_logs (actor_id, action, resource_type, resource_id, metadata)
  values (
    auth.uid(),
    'PAYMENT_STATUS_UPDATED',
    'payment',
    p_payment_id,
    jsonb_build_object('previous_status', v_payment.status, 'new_status', p_status)
  );

  return p_status;
end;
$$;

grant execute on function admin_update_payment_status(uuid, payment_status) to authenticated;
