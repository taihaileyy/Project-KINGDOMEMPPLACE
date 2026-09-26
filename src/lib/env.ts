// Public values only. The Supabase URL and publishable (anon) key are meant to
// be visible in the browser; access is enforced by Row Level Security.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
