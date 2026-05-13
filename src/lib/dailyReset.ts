import { useEffect, useState } from "react";

/**
 * Local-timezone YYYY-MM-DD (so "today" rolls over at the user's midnight,
 * not at midnight UTC). Used by the daily check-in / habit loop / mood entry
 * so progress resets cleanly each day on the device's clock.
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** ms until next local midnight (with a 1s buffer to be safely past the boundary) */
const msUntilNextLocalMidnight = (): number => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 1, 0);
  return Math.max(1000, next.getTime() - now.getTime());
};

/**
 * Returns the current local date string and re-renders the consumer at local
 * midnight. Also re-checks when the tab/app regains focus so a backgrounded
 * app crossing midnight refreshes immediately.
 */
export const useTodayLocal = (): string => {
  const [today, setToday] = useState<string>(() => getLocalDateString());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextRollover = () => {
      timeoutId = setTimeout(() => {
        setToday(getLocalDateString());
        scheduleNextRollover();
      }, msUntilNextLocalMidnight());
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        const fresh = getLocalDateString();
        setToday((prev) => (prev !== fresh ? fresh : prev));
        if (timeoutId) clearTimeout(timeoutId);
        scheduleNextRollover();
      }
    };

    scheduleNextRollover();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  return today;
};
