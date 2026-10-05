"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { saveEvent, type EventFormState } from "./actions";
import { FlyerField } from "./flyer-field";

type Initial = { id?: string; title: string; blurb: string; details: string; starts: string; ends: string; location: string; image_path: string; capacity: number; requires_registration: boolean; is_published: boolean };

export function EventForm({ initial, images }: { initial: Initial; images: { path: string; label: string }[] }) {
  const [state, action, pending] = useActionState<EventFormState, FormData>(saveEvent, {});
  return (
    <form action={action} className="grid gap-4 px-2">
      <input type="hidden" name="id" value={initial.id ?? ""} />
      <FormMessage error={state.error} notice={state.notice} />
      <div><label className="field-label" htmlFor="title">Title</label><input id="title" name="title" required maxLength={160} defaultValue={initial.title} className="field-input" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="field-label" htmlFor="starts">Starts (Baton Rouge time)</label><input id="starts" name="starts" type="datetime-local" required defaultValue={initial.starts} className="field-input" /></div>
        <div><label className="field-label" htmlFor="ends">Ends (optional)</label><input id="ends" name="ends" type="datetime-local" defaultValue={initial.ends} className="field-input" /></div>
      </div>
      <div><label className="field-label" htmlFor="location">Where</label><input id="location" name="location" maxLength={200} defaultValue={initial.location} className="field-input" /></div>
      <div><label className="field-label" htmlFor="blurb">One-line description</label><input id="blurb" name="blurb" maxLength={400} defaultValue={initial.blurb} className="field-input" /></div>
      <div><label className="field-label" htmlFor="details">More details (optional)</label><textarea id="details" name="details" rows={4} maxLength={4000} defaultValue={initial.details} className="field-input" /></div>
      <FlyerField defaultValue={initial.image_path} presets={images} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="field-label" htmlFor="capacity">Spots (0 = no limit)</label><input id="capacity" name="capacity" type="number" min={0} defaultValue={initial.capacity} className="field-input" /></div>
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" name="requires_registration" defaultChecked={initial.requires_registration} className="size-4" /> People register ahead</label>
        <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" name="is_published" defaultChecked={initial.is_published} className="size-4" /> Show on the website</label>
      </div>
      <div><button className="btn-primary" disabled={pending}>{pending ? "Saving..." : initial.id ? "Save changes" : "Create event"}</button></div>
    </form>
  );
}
