"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_SCHEDULE, type ScheduleItem } from "@/lib/schedule";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

const Ctx = createContext<ScheduleItem[]>(DEFAULT_SCHEDULE);

// Loads the church schedule once per visit. Until it arrives (or if it can't),
// the built-in defaults show, so pages stay fast and never blank.
export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${SUPABASE_URL}/rest/v1/schedule_items?select=id,kind,title,detail,frequency,weekday,start_time,note,sort_order&is_active=eq.true&order=sort_order`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((rows: ScheduleItem[] | null) => { if (Array.isArray(rows)) setItems(rows); })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return <Ctx.Provider value={items}>{children}</Ctx.Provider>;
}

export const useSchedule = () => useContext(Ctx);
