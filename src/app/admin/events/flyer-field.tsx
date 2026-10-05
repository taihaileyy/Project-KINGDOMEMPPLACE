"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

// Pick a flyer from a photo or file on the phone or computer. It goes straight
// to KEP's flyer storage and only its address is saved with the event.
export function FlyerField({ defaultValue, presets }: { defaultValue: string; presets: { path: string; label: string }[] }) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Choose a JPG, PNG or WebP picture.");
    if (file.size > 10 * 1024 * 1024) return setError("That picture is over 10 MB. Try a smaller one.");
    setBusy(true);
    try {
      const supabase = createBrowserSupabase();
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID()}.${ext}`;
      const { error: err } = await supabase.storage.from("event-flyers").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (err) throw err;
      setValue(supabase.storage.from("event-flyers").getPublicUrl(path).data.publicUrl);
    } catch {
      setError("The upload didn't work. Check your connection and that you're signed in as event staff, then try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <span className="field-label">Flyer picture</span>
      <input type="hidden" name="image_path" value={value} />
      {value && (
        // eslint-disable-next-line @next/next/no-img-element -- a preview of whatever was chosen
        <img src={value} alt="Flyer preview" className="max-h-72 w-auto max-w-full rounded-xl border border-line object-contain" />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label className={`btn border border-line bg-paper font-semibold hover:bg-surface ${busy ? "cursor-wait opacity-60" : "cursor-pointer"}`}>
          {busy ? "Uploading..." : value ? "Replace picture" : "Upload a picture"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
        </label>
        {value && <button type="button" onClick={() => setValue("")} className="inline-flex min-h-11 items-center text-sm font-semibold text-muted underline underline-offset-4 hover:text-danger">Remove</button>}
      </div>
      {presets.length > 0 && (
        <details className="text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-blue">Or use an existing flyer</summary>
          <ul className="grid gap-1 pb-2">
            {presets.map((p) => <li key={p.path}><button type="button" onClick={() => setValue(p.path)} className="inline-flex min-h-11 items-center text-left hover:text-blue">{p.label}</button></li>)}
          </ul>
        </details>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
