import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in development rather than silently hitting undefined endpoints.
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase project values."
  );
}

// This is the PUBLIC anon key — safe to ship to the browser because
// every table it can reach is protected by Row Level Security (Phase 3+).
// The service-role key must NEVER appear in frontend code.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
