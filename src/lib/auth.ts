import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type StaffRole =
  | "super_admin"
  | "finance_admin"
  | "housing_staff"
  | "program_staff"
  | "church_staff";

export type Person = {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  email: string | null;
  phone: string | null;
};

export type Session = {
  person: Person;
  roles: { role: StaffRole; program_id: string | null; scope: string | null }[];
};

// The current user's person record and staff roles, read through RLS.
// Cached per request so layouts and pages share one lookup.
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: person }, { data: roles }] = await Promise.all([
    supabase
      .from("people")
      .select("id, first_name, last_name, preferred_name, email, phone")
      .eq("auth_user_id", user.id)
      .is("merged_into_id", null)
      .maybeSingle(),
    supabase.rpc("my_roles"),
  ]);
  if (!person) return null;
  return { person, roles: (roles ?? []) as Session["roles"] };
});

export async function requireUser(next = "/portal"): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session;
}

export function hasRole(session: Session, role: StaffRole) {
  return session.roles.some((r) => r.role === role || r.role === "super_admin");
}

// Paradise content is managed by super admins and by program staff given the
// "paradise" scope (the database enforces the same rule).
export function canManageParadise(session: Session) {
  return session.roles.some((r) => r.role === "super_admin" || (r.role === "program_staff" && r.scope === "paradise"));
}

export async function requireParadiseStaff(): Promise<Session> {
  const session = await requireUser("/admin/paradise");
  if (!canManageParadise(session)) redirect("/admin?denied=1");
  return session;
}

// Videos and audio are managed by super admins, church staff and program staff.
export function canManageMedia(session: Session) {
  return session.roles.some((r) => r.role === "super_admin" || r.role === "church_staff" || r.role === "program_staff");
}

export async function requireMediaStaff(): Promise<Session> {
  const session = await requireUser("/admin/videos");
  if (!canManageMedia(session)) redirect("/admin?denied=1");
  return session;
}

// Server-side gate for staff pages. The database enforces the same rules,
// so this is for clear errors, not the only protection.
export async function requireStaff(allowed?: StaffRole[]): Promise<Session> {
  const session = await requireUser("/admin");
  const ok = allowed ? allowed.some((r) => hasRole(session, r)) : session.roles.length > 0;
  if (!ok) redirect("/portal?denied=1");
  return session;
}

export function displayName(p: Person) {
  return p.preferred_name || p.first_name || p.email || "Friend";
}
