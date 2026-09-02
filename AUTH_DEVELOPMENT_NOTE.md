# Temporary Authentication Mode

SmartPark currently uses **local demo authentication** only.

Supabase Auth is intentionally disabled while the rest of the application is being developed.

## Demo access

- **Parking user** — opens the normal user experience as `Yuan Chavez`.
- **Administrator** — opens the admin experience as `SmartPark Admin`.

The selected demo session is stored in browser `localStorage` under `smartpark.dev-auth` and is cleared when the user logs out.

## Important

This is not production authentication. Do not rely on the local role for security.

The project still contains Supabase as its database/data layer. Features protected by Supabase Row Level Security or database functions that depend on `auth.uid()` may require Supabase Auth again before they can work securely in production.

When authentication is implemented later, replace `src/features/auth/AuthProvider.tsx` with the real provider and reconnect the login/register pages.
