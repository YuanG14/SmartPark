-- SmartPark admin bootstrap helper
-- 1) Register/login a normal account in the SmartPark UI first.
-- 2) Replace the email below with that account's email.
-- 3) Run this in the Supabase SQL Editor once.
--
-- This changes ONLY an existing authenticated user's profile role. It does not
-- create or store a plaintext password in SQL.

update public.profiles p
set role = 'admin', updated_at = now()
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('chavezyuan14@gmail.com');

-- Verify the result:
select u.email, p.full_name, p.role
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower('chavezyuan14@gmail.com');
