"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const ACCEPT = { video: "video/mp4,video/webm,video/quicktime", image: "image/jpeg,image/png,image/webp", audio: "audio/mpeg,audio/mp4,audio/ogg,audio/wav" } as const;

// A web address field that can also upload a file to KEP's media storage and
// fill the address in. Only the address is saved with the content.
export function MediaField({
  name,
  label,
  kind,
  defaultValue = "",
  hint,
  onValue,
}: {
  name: string;
  label: string;
  kind: keyof typeof ACCEPT;
  defaultValue?: string;
  hint?: string;
  onValue?: (url: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${kind}/${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID()}.${ext}`;
      const { error: err } = await supabase.storage.from("paradise-media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (err) throw err;
      const { data } = supabase.storage.from("paradise-media").getPublicUrl(path);
      setValue(data.publicUrl);
      onValue?.(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The upload didn't work. Files must be under 50 MB; for longer videos, paste a YouTube link instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-semibold" htmlFor={`${name}-field`}>{label}</label>
      <input
        id={`${name}-field`}
        name={name}
        type="url"
        value={value}
        onChange={(e) => { setValue(e.target.value); onValue?.(e.target.value); }}
        placeholder="https://… (or upload a file below)"
        className="field-input"
        maxLength={1000}
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn border border-line bg-paper text-sm font-semibold hover:bg-surface">
          {busy ? "Uploading…" : "Upload a file"}
          <input
            type="file"
            accept={ACCEPT[kind]}
            className="sr-only"
            disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }}
          />
        </label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
