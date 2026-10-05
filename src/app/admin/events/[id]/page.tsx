import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Panel, StatusPill } from "@/components/portal-ui";
import { canManageEvents, requireCapability } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isoToChicagoLocal } from "@/lib/time";
import { checkIn } from "../actions";
import { EventForm } from "../event-form";
import { flyerImages } from "../flyers";

export const metadata: Metadata = { title: "Event" };

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  await requireCapability(canManageEvents, "/admin/events");
  const { id } = await params;
  const isNew = id === "new";
  let initial = { title: "", blurb: "", details: "", starts: "", ends: "", location: "", image_path: "", capacity: 0, requires_registration: false, is_published: true } as Parameters<typeof EventForm>[0]["initial"];
  let regs: { id: string; name: string; email: string; phone: string | null; guests: number; checked_in_at: string | null }[] = [];
  if (!isNew) {
    const supabase = await createClient();
    const { data: e } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
    if (!e) notFound();
    initial = {
      id, title: e.title, blurb: e.blurb ?? "", details: e.details ?? "", starts: isoToChicagoLocal(e.starts_at), ends: e.ends_at ? isoToChicagoLocal(e.ends_at) : "",
      location: e.location ?? "", image_path: e.image_path ?? "", capacity: e.capacity ?? 0, requires_registration: e.requires_registration, is_published: e.is_published,
    };
    const { data: r } = await supabase.from("event_registrations").select("id, name, email, phone, guests, checked_in_at").eq("event_id", id).eq("status", "registered").order("created_at");
    regs = (r ?? []) as typeof regs;
  }
  const heads = regs.reduce((s, r) => s + 1 + r.guests, 0);
  const arrived = regs.filter((r) => r.checked_in_at).reduce((s, r) => s + 1 + r.guests, 0);
  return (
    <div className="grid gap-6">
      <DashboardBand title={isNew ? "New event" : initial.title}>
        <Link href="/admin/events" className="btn border border-white/25 text-white hover:bg-white/10">All events</Link>
      </DashboardBand>
      <Panel id="details" title="Details"><EventForm initial={initial} images={flyerImages} /></Panel>
      {!isNew && (
        <Panel id="roster" title={`Registrations (${regs.length} · ${heads} people · ${arrived} checked in)`}>
          {regs.length === 0 ? <p className="px-2 text-[15px] text-muted">No one has registered yet.</p> : (
            <ul>{regs.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-2 py-3 first:border-t-0">
                <span>
                  <span className="block font-semibold">{r.name}{r.guests ? ` +${r.guests}` : ""}</span>
                  <span className="text-sm text-muted">{r.email}{r.phone ? ` · ${r.phone}` : ""}</span>
                </span>
                <ActionForm action={checkIn} className="flex items-center gap-3">
                  <input type="hidden" name="id" value={r.id} /><input type="hidden" name="event" value={id} />
                  {r.checked_in_at && <StatusPill status="completed" />}
                  <SubmitButton name="in" value={r.checked_in_at ? "0" : "1"} className={r.checked_in_at ? "text-sm font-semibold text-muted underline" : "btn-primary"}>{r.checked_in_at ? "Undo" : "Check in"}</SubmitButton>
                </ActionForm>
              </li>
            ))}</ul>
          )}
        </Panel>
      )}
    </div>
  );
}
