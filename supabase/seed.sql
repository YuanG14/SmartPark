-- =============================================================================
-- SmartPark — sample seed data for local development/testing only.
-- Not part of the schema migration. Safe to skip in production.
-- =============================================================================

insert into parking_lots (id, name, address, latitude, longitude, operating_hours)
values
  ('11111111-1111-1111-1111-111111111111', 'Downtown Plaza Parking', 'Sample Address 1', 14.5995, 120.9842, '6:00 AM - 10:00 PM'),
  ('22222222-2222-2222-2222-222222222222', 'Riverside Parking', 'Sample Address 2', 14.6091, 121.0223, '24 hours');

insert into parking_spaces (parking_lot_id, zone, space_number, vehicle_type_supported, status)
values
  ('11111111-1111-1111-1111-111111111111', 'A', 'A01', 'car', 'available'),
  ('11111111-1111-1111-1111-111111111111', 'A', 'A02', 'car', 'occupied'),
  ('11111111-1111-1111-1111-111111111111', 'A', 'A03', 'car', 'available'),
  ('11111111-1111-1111-1111-111111111111', 'A', 'A04', 'motorcycle', 'available'),
  ('22222222-2222-2222-2222-222222222222', 'A', 'A01', 'car', 'available'),
  ('22222222-2222-2222-2222-222222222222', 'A', 'A02', 'car', 'maintenance');

insert into parking_rate_rules (parking_lot_id, vehicle_type, base_rate, additional_hour_rate, daily_maximum, effective_from)
values
  ('11111111-1111-1111-1111-111111111111', 'car', 30.00, 20.00, 150.00, current_date),
  ('22222222-2222-2222-2222-222222222222', 'car', 25.00, 15.00, 120.00, current_date);
