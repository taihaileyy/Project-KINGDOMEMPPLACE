import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PLACEHOLDER_CONTENT } from "@/lib/paradise/placeholder";
import type { PdContent } from "@/lib/paradise/types";

// Loads the game's content from Supabase. If the tables aren't set up or have
// no playable questions yet, the labeled sample is used instead, so /paradise
// never breaks.
export async function loadParadiseContent(): Promise<PdContent> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("paradise_content");
    if (error || !data) return PLACEHOLDER_CONTENT;
    const c = data as { levels?: PdContent["levels"]; settings?: Record<string, unknown> };
    const levels = (c.levels ?? []).filter((l) => l.questions?.length);
    if (levels.length === 0) return { ...PLACEHOLDER_CONTENT, settings: c.settings ?? {} };
    return { levels, settings: c.settings ?? {}, placeholder: false };
  } catch {
    return PLACEHOLDER_CONTENT;
  }
}
