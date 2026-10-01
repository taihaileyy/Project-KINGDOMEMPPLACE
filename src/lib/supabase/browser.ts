import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

// For the few things that must happen in the browser, such as sending a large
// video straight to storage. It acts as the signed-in staff member, so storage
// rules decide what it may do.
export function createBrowserSupabase() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
