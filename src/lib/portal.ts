import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Which parts of "My KEP" a person has. A section appears in the menu only
// when the person has a matching record, and its address is blocked for
// everyone else (requireAccess). The database enforces the same limits: each
// query below runs as the signed-in person, so it only ever sees their own rows.
export type PortalArea = "church" | "programs" | "events" | "giving" | "housing";
export type PortalAccess = Record<PortalArea, boolean>;

export const getPortalAccess = cache(async (): Promise<PortalAccess> => {
  const supabase = await createClient();
  const count = async (q: PromiseLike<{ count: number | null }>) => ((await q).count ?? 0) > 0;
  const head = { count: "exact", head: true } as const;
  const [church, programs, events, giving] = await Promise.all([
    count(supabase.from("church_memberships").select("id", head).eq("status", "active")),
    count(supabase.from("program_enrollments").select("id", head).in("status", ["pending", "approved", "completed"])),
    count(supabase.from("event_registrations").select("id", head)),
    count(supabase.from("gifts").select("id", head)),
  ]);
  return { church, programs, events, giving, housing: false };
});

export async function requireAccess(area: PortalArea, next = "/portal"): Promise<void> {
  await requireUser(next);
  const access = await getPortalAccess();
  if (!access[area]) redirect(`/portal?missing=${area}`);
}
