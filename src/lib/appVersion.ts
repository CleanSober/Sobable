/**
 * App version + storage schema migrations.
 *
 * Runs once on app boot. Safely upgrades any data whose shape has changed
 * across App Store / web releases so existing users never see a crash after
 * updating. Each migration is idempotent and wrapped in try/catch — a bad
 * key for one user must never break the entire app.
 */

// Bump this when adding a new migration step below.
export const CURRENT_SCHEMA_VERSION = 2;

const VERSION_KEY = "app_schema_version";

type Migration = (from: number) => void;

/** Safely read + parse a JSON localStorage value. */
export function safeReadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupted value — drop it so we don't keep crashing on every read.
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return fallback;
  }
}

/** Safely write a JSON value (silently no-ops if storage is full / disabled). */
export function safeWriteJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

const migrations: Record<number, Migration> = {
  // v0 -> v1: legacy outcome value "resisted" renamed to "stayed_sober".
  // analyzePatterns() already accepts both, but normalize on disk.
  1: () => {
    const KEY = "cleanSober_triggerEntries";
    const entries = safeReadJSON<Array<{ outcome?: string }>>(KEY, []);
    if (!Array.isArray(entries) || entries.length === 0) return;
    let changed = false;
    for (const e of entries) {
      if (e && e.outcome === "resisted") {
        e.outcome = "stayed_sober";
        changed = true;
      }
    }
    if (changed) safeWriteJSON(KEY, entries);
  },

  // v1 -> v2: ensure userData has required defaults so a partial object
  // from an older release doesn't crash newer code that assumes them.
  2: () => {
    const KEY = "cleanSober_userData";
    const data = safeReadJSON<Record<string, unknown> | null>(KEY, null);
    if (!data || typeof data !== "object") return;
    const patched = {
      ...data,
      substances: Array.isArray(data.substances) ? data.substances : [],
      dailySpending: typeof data.dailySpending === "number" ? data.dailySpending : 0,
      onboardingComplete:
        typeof data.onboardingComplete === "boolean" ? data.onboardingComplete : false,
    };
    safeWriteJSON(KEY, patched);
  },
};

/**
 * Run any migrations between the user's stored schema version and the current
 * one. Called once at app startup before render.
 */
export function runStorageMigrations(): void {
  let from = 0;
  try {
    const raw = localStorage.getItem(VERSION_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    from = Number.isFinite(parsed) ? parsed : 0;
  } catch {
    from = 0;
  }

  if (from >= CURRENT_SCHEMA_VERSION) return;

  for (let v = from + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const step = migrations[v];
    if (!step) continue;
    try {
      step(from);
    } catch (err) {
      // Never let a migration error prevent the app from booting.
      console.warn(`[migrations] step v${v} failed`, err);
    }
  }

  try {
    localStorage.setItem(VERSION_KEY, String(CURRENT_SCHEMA_VERSION));
  } catch {
    /* ignore */
  }
}
