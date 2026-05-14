import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const QUEUE_KEY = "sober_club_checkin_queue_v1";
const TODAY_CACHE_KEY = "sober_club_checkin_today_v1";

export interface CheckInPayload {
  user_id: string;
  date: string; // YYYY-MM-DD (local)
  mood: number;
  craving_level: number;
  note: string | null;
}

interface QueuedCheckIn extends CheckInPayload {
  queued_at: string;
}

interface TodayCache {
  user_id: string;
  date: string;
  payload: CheckInPayload;
  saved_at: string;
  synced: boolean;
}

const isBrowser = () => typeof window !== "undefined";

function readQueue(): QueuedCheckIn[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedCheckIn[]) {
  if (!isBrowser()) return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function getCachedTodayCheckIn(userId: string, date: string): TodayCache | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(TODAY_CACHE_KEY);
    if (!raw) return null;
    const cached: TodayCache = JSON.parse(raw);
    if (cached.user_id === userId && cached.date === date) return cached;
    return null;
  } catch {
    return null;
  }
}

function cacheToday(payload: CheckInPayload, synced: boolean) {
  if (!isBrowser()) return;
  const cache: TodayCache = {
    user_id: payload.user_id,
    date: payload.date,
    payload,
    saved_at: new Date().toISOString(),
    synced,
  };
  localStorage.setItem(TODAY_CACHE_KEY, JSON.stringify(cache));
}

async function pushOne(payload: CheckInPayload): Promise<boolean> {
  const { error: moodErr } = await supabase
    .from("mood_entries")
    .upsert(
      {
        user_id: payload.user_id,
        date: payload.date,
        mood: payload.mood,
        craving_level: payload.craving_level,
        note: payload.note,
      },
      { onConflict: "user_id,date" }
    );
  if (moodErr) return false;

  const { error: goalErr } = await supabase
    .from("daily_goals")
    .upsert(
      { user_id: payload.user_id, date: payload.date, mood_logged: true },
      { onConflict: "user_id,date" }
    );
  if (goalErr) return false;

  return true;
}

/**
 * Save a check-in: cache locally for instant UI, then try to sync to Supabase.
 * If offline or the request fails, queue it for later.
 *
 * Returns { synced: boolean } so the UI can show a different toast.
 */
export async function saveCheckInOffline(
  payload: CheckInPayload
): Promise<{ synced: boolean }> {
  // Always cache locally first so UI works immediately.
  cacheToday(payload, false);

  const online = isBrowser() ? navigator.onLine : true;
  if (!online) {
    enqueue(payload);
    return { synced: false };
  }

  const ok = await pushOne(payload).catch(() => false);
  if (ok) {
    cacheToday(payload, true);
    return { synced: true };
  }

  enqueue(payload);
  return { synced: false };
}

function enqueue(payload: CheckInPayload) {
  const queue = readQueue();
  // Replace any existing queued item for the same user+date (only one check-in per day).
  const filtered = queue.filter(
    (q) => !(q.user_id === payload.user_id && q.date === payload.date)
  );
  filtered.push({ ...payload, queued_at: new Date().toISOString() });
  writeQueue(filtered);
}

let syncing = false;

/**
 * Drain the offline queue. Safe to call repeatedly; no-op if nothing pending.
 * Shows a toast when items sync successfully.
 */
export async function syncPendingCheckIns(opts: { silent?: boolean } = {}) {
  if (syncing) return;
  if (!isBrowser()) return;
  if (!navigator.onLine) return;

  const queue = readQueue();
  if (queue.length === 0) return;

  syncing = true;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      // Not signed in — leave the queue intact for next time.
      return;
    }

    const remaining: QueuedCheckIn[] = [];
    let synced = 0;
    for (const item of queue) {
      const ok = await pushOne(item).catch(() => false);
      if (ok) {
        synced++;
        // Refresh today's cache if this was today's entry.
        cacheToday(item, true);
      } else {
        remaining.push(item);
      }
    }
    writeQueue(remaining);

    if (synced > 0 && !opts.silent) {
      toast.success(
        synced === 1
          ? "Your offline check-in is synced ✓"
          : `${synced} offline check-ins synced ✓`
      );
    }
  } finally {
    syncing = false;
  }
}

export function hasPendingCheckIns(): boolean {
  return readQueue().length > 0;
}

/**
 * Register listeners that auto-sync when the connection returns or the tab
 * becomes visible. Returns a cleanup function.
 */
export function registerCheckInSync(): () => void {
  if (!isBrowser()) return () => {};

  const onOnline = () => {
    syncPendingCheckIns();
  };
  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      syncPendingCheckIns({ silent: true });
    }
  };

  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisibility);

  // Best-effort sync on registration.
  syncPendingCheckIns({ silent: true });

  return () => {
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
