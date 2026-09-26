// Public values only. The Supabase URL and publishable key are meant to be
// visible in the browser; access is enforced by Row Level Security. The
// defaults point at KEP's live project, so the site works without any
// variables set in Cloudflare. Set the variables to use a different project.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://njnuvgitrryxbdmfuugx.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_x0HqrTsIwWhPLal51HO9vA_oJmaKPt2";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
