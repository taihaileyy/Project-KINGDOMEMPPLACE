import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { deleteScheduleItem, saveScheduleItem } from "@/app/admin/schedule/actions";
import { Field, Notice } from "@/components/paradise/admin-ui";
import { requireStaff } from "@/lib/auth";
import { describe, type ScheduleItem } from "@/lib/schedule";
import { createClient } from "@/lib/supabase/server";
import { org } from "@/content/site";

export const metadata: Metadata = { title: "Schedule" };

type Row = ScheduleItem & { is_active: boolean };
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Fields({ it }: { it?: Row }) {
  return (
    <div className="grid gap-4">
      {it && <input type="hidden" name="id" value={it.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`t-${it?.id ?? "new"}`}><input id={`t-${it?.id ?? "new"}`} name="title" required maxLength={120} defaultValue={it?.title ?? ""} className="field-input" /></Field>
        <Field label="Type">
          <select name="kind" defaultValue={it?.kind ?? "other"} className="field-input">
            <option value="bible_study">Bible Study</option><option value="worship">Worship service</option><option value="other">Other</option>
          </select>
        </Field>
      </div>
      <Field label="How often?" hint="Weekly needs a day. 'Varies' and 'Custom' show your note instead of a fixed time.">
        <select name="frequency" defaultValue={it?.frequency ?? "weekly"} className="field-input">
          <option value="weekly">Every week on a set day</option><option value="varies">Varies (changes week to week)</option><option value="custom">Custom (describe it in the note)</option>
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Day (weekly only)">
          <select name="weekday" defaultValue={it?.weekday ?? ""} className="field-input">
            <option value="">None</option>
            {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </Field>
        <Field label="Start time" hint="Leave empty if there isn't a set time."><input name="start_time" type="time" defaultValue={it?.start_time?.slice(0, 5) ?? ""} className="field-input" /></Field>
      </div>
      <Field label="Note shown when the time varies" hint='For example: "Sunday, October 12 at 10:00 AM". Leave empty to show "Worship times vary. Check back soon or call us."'>
        <input name="note" maxLength={200} defaultValue={it?.note ?? ""} className="field-input" />
      </Field>
      <Field label="Short description (optional)"><input name="detail" maxLength={300} defaultValue={it?.detail ?? ""} className="field-input" /></Field>
      <div className="flex flex-wrap items-center gap-6">
        <Field label="Order"><input name="sort_order" type="number" min={0} defaultValue={it?.sort_order ?? 30} className="field-input !w-28" /></Field>
        <label className="flex items-center gap-3 self-end pb-2 text-sm font-semibold">
          <input type="checkbox" name="is_active" defaultChecked={it?.is_active ?? true} className="size-5 accent-[var(--kep-blue)]" /> Show on the website
        </label>
      </div>
    </div>
  );
}

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireStaff(["church_staff"]);
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("schedule_items").select("*").order("sort_order");
  const rows = (data ?? []) as Row[];

  return (
    <div className="grid gap-6">
      <DashboardBand title="Schedule" lead="The times shown across the website: the homepage, Church, Events, Give and the footer. Changes appear right away." />
      <Notice saved={sp.saved} error={sp.error} />
      <ul className="grid gap-3">
        {rows.map((it) => (
          <li key={it.id} className="card">
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                <span className="font-extrabold">{it.title}</span>
                <span className="text-sm text-muted">{describe(it, org.phone).line}</span>
                <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${it.is_active ? "bg-success/15 text-success" : "bg-line text-muted"}`}>{it.is_active ? "Shown" : "Hidden"}</span>
                <span className="text-sm font-semibold text-blue">Edit</span>
              </summary>
              <div className="grid gap-4 border-t border-line p-4">
                <form action={saveScheduleItem} className="grid max-w-2xl gap-4"><Fields it={it} /><div><button className="btn-primary">Save</button></div></form>
                <details className="max-w-2xl">
                  <summary className="cursor-pointer text-sm font-semibold text-danger">Delete</summary>
                  <form action={deleteScheduleItem} className="mt-3 rounded-[var(--radius-card)] border border-danger/40 p-4">
                    <p className="text-sm text-muted">Remove &ldquo;{it.title}&rdquo; for good? To hide it instead, untick &ldquo;Show on the website&rdquo;.</p>
                    <input type="hidden" name="id" value={it.id} />
                    <button className="btn mt-3 bg-danger text-sm font-semibold text-white">Yes, delete</button>
                  </form>
                </details>
              </div>
            </details>
          </li>
        ))}
      </ul>
      <section className="card p-5">
        <h2 className="mb-4 text-lg font-extrabold">+ Add to the schedule</h2>
        <form action={saveScheduleItem} className="grid max-w-2xl gap-4"><Fields /><div><button className="btn-primary">Add</button></div></form>
      </section>
    </div>
  );
}
