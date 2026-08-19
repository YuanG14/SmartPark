# SmartPark

Intelligent Parking Reservation & Management System — portfolio project, built phase-by-phase.

**Current phase:** Phase 1 — Project Setup.

## Stack

React + TypeScript + Vite + Tailwind CSS + React Router + Supabase.

## Setup

```bash
npm install
cp .env.example .env.local
# then edit .env.local with your Supabase project URL + anon key
npm run dev
```

Visit `http://localhost:5173`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## Project structure

See `src/` — organized by `components/` (ui, parking, reservation, dashboard),
`pages/`, `routes/`, `lib/`, `hooks/`, `types/`, `features/`. Full rationale in
the Phase 0 architecture document.

## Status

This is a placeholder shell (home/login/dashboard stub pages, basic nav) to
confirm the toolchain works end-to-end. No real UI, auth, or data yet —
those come in Phases 2–5.

## Admin setup (reservation approval + payments)

The admin UI is available at `/admin` and is protected both by the client-side role guard and Supabase Row Level Security / RPC role checks.

1. Apply all migrations, including `supabase/migrations/0003_admin_reservations_payments.sql`.
2. Register the account you want to use as the administrator through SmartPark normally.
3. Open `supabase/admin_setup.sql`, replace `YOUR_ADMIN_EMAIL@example.com`, and run it once in the Supabase SQL Editor.
4. Sign out and sign back in (or refresh the profile) so the new `admin` role is loaded.
5. Open **Admin** from the navbar.

The Payments tab is an internal payment ledger for now. "Mark paid" and "Refund" update the database record and audit log; they do not charge/refund real money until a payment gateway such as GCash/PayMongo/Stripe is integrated.
