-- =============================================================================
-- SmartPark — Phase 4 addition: auto-create `profiles` row on signup.
--
-- WHY THIS CHANGES PHASE 3:
-- Phase 3 gave `profiles` a SELECT/UPDATE policy for the owner, but no
-- INSERT policy — a signed-up user had no way to create their own profile
-- row from the client, and giving them one directly would mean trusting the
-- client to submit its own `id`/`role`, which we specifically want to avoid.
-- The standard, more secure Supabase pattern is a database trigger on
-- `auth.users` that creates the matching `profiles` row automatically,
-- server-side, the instant a user signs up — no client INSERT policy needed
-- at all, and `role` always starts at 'user' regardless of what the client
-- sends.
-- =============================================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
