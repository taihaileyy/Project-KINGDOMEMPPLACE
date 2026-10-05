"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Super admins only: who is staff, and closing accounts. The database checks the
// same rule, so these can't be used by anyone else even with a crafted request.

export type PersonState = { error?: string; notice?: string };

const generic = "We couldn't do that just now. Please try again.";
const friendly = (e: { code?: string; message: string }) => (e.code === "22023" ? e.message : e.code === "42501" ? "Only super admins can do that." : generic);

// The role picker sends one value: a staff role, or "program:all", "program:studio",
// "program:paradise" or "program:<program id>".
export async function grantRole(_: PersonState, form: FormData): Promise<PersonState> {
  await requireStaff(["super_admin"]);
  const parsed = z.object({ person: z.string().uuid(), role: z.string().min(1).max(60) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Choose a role." };
  const { person, role } = parsed.data;

  let staffRole = role;
  let program: string | null = null;
  let scope: string | null = null;
  if (role.startsWith("program:")) {
    staffRole = "program_staff";
    const which = role.slice("program:".length);
    if (which === "studio" || which === "paradise") scope = which;
    else if (which !== "all") {
      if (!z.string().uuid().safeParse(which).success) return { error: "Choose a role." };
      program = which;
    }
  } else if (!["super_admin", "church_staff", "housing_staff", "finance_admin"].includes(role)) {
    return { error: "Choose a role." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("grant_staff_role", { p_person: person, p_role: staffRole, p_program: program, p_scope: scope });
  if (error) return { error: friendly(error) };
  revalidatePath(`/admin/people/${person}`);
  return { notice: "Access added. It takes effect the next time they open a page." };
}

export async function revokeRole(_: PersonState, form: FormData): Promise<PersonState> {
  await requireStaff(["super_admin"]);
  const parsed = z.object({ id: z.string().uuid(), person: z.string().uuid() }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: generic };
  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_staff_role", { p_id: parsed.data.id });
  if (error) return { error: friendly(error) };
  revalidatePath(`/admin/people/${parsed.data.person}`);
  return { notice: "Access removed." };
}

export async function deleteAccount(_: PersonState, form: FormData): Promise<PersonState> {
  await requireStaff(["super_admin"]);
  const parsed = z.object({ person: z.string().uuid(), confirm: z.string() }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: generic };
  if (parsed.data.confirm.trim() !== "DELETE") return { error: "Type DELETE in capital letters to confirm." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_person_account", { p_person: parsed.data.person });
  if (error) {
    // 42883 / PGRST202: the database function hasn't been installed yet.
    if (error.code === "42883" || error.code === "PGRST202") return { error: "Account deletion isn't switched on in the database yet. See the setup note from your developer." };
    return { error: friendly(error) };
  }
  revalidatePath("/admin/people");
  redirect("/admin/people?deleted=1");
}
