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
