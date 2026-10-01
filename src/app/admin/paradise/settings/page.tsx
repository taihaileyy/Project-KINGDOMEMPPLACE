import type { Metadata } from "next";
import { saveSettings } from "@/app/admin/paradise/actions";
import { Field, Notice, ParadiseAdminTabs } from "@/components/paradise/admin-ui";
import { SETTING_FIELDS, resolveSettings } from "@/lib/paradise/settings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Create Your World settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("paradise_settings").select("setting_key, setting_value");
  const s = resolveSettings(Object.fromEntries((data ?? []).map((r) => [r.setting_key, r.setting_value])));

  return (
    <div>
      <ParadiseAdminTabs current="/admin/paradise/settings" />
      <Notice saved={sp.saved} error={sp.error} />
      <form action={saveSettings} className="card grid max-w-2xl gap-5 p-5">
        {SETTING_FIELDS.map((f) => {
          const v = s[f.key];
          if (f.type === "boolean")
            return (
              <div key={f.key}>
                <label className="flex items-start gap-3 text-sm font-semibold">
                  <input type="checkbox" name={f.key} defaultChecked={v as boolean} className="mt-0.5 size-5 accent-[var(--kep-blue)]" />
                  <span>{f.label}{f.help && <span className="mt-0.5 block text-xs font-normal text-muted">{f.help}</span>}</span>
                </label>
              </div>
            );
          return (
            <Field key={f.key} label={f.label} hint={f.help} htmlFor={f.key}>
              {f.type === "number" && <input id={f.key} name={f.key} type="number" min={f.min} max={f.max} step={f.step} defaultValue={v as number} className="field-input !w-40" />}
              {f.type === "choice" && (
                <select id={f.key} name={f.key} defaultValue={v as string} className="field-input">
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
              {f.type === "text" && <input id={f.key} name={f.key} maxLength={f.max} defaultValue={v as string} className="field-input" />}
            </Field>
          );
        })}
        <div><button className="btn-primary">Save settings</button></div>
      </form>
    </div>
  );
}
