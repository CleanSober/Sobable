import { Skeleton } from "@/components/ui/skeleton";

/**
 * Per-field placeholders.
 *
 * These match the final rendered shape of common UI building blocks (charts,
 * badge rails, lists, calendars, stat grids) so that a section reserves its
 * real height before data hydrates — eliminating layout shift inside cards.
 *
 * Every placeholder accepts an optional `className` so callers can tune
 * spacing/padding to fit the surrounding card.
 */

type WithClass = { className?: string };

/* ------------------------------------------------------------------ */
/* Charts                                                              */
/* ------------------------------------------------------------------ */

/**
 * Bar chart placeholder — matches typical Recharts BarChart used in
 * PremiumAnalytics / DataInsights (height ~h-48).
 */
export const ChartBarPlaceholder = ({
  className = "",
  bars = 7,
  height = "h-48",
}: WithClass & { bars?: number; height?: string }) => {
  // Pseudo-random but stable bar heights for visual rhythm.
  const heights = ["40%", "65%", "55%", "80%", "45%", "70%", "60%", "75%", "50%", "85%"];
  return (
    <div className={`w-full ${height} flex items-end justify-between gap-2 px-1 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-md"
          style={{ height: heights[i % heights.length] }}
        />
      ))}
    </div>
  );
};

/**
 * Line chart placeholder — single muted band that takes the typical
 * trend-line container height.
 */
export const ChartLinePlaceholder = ({
  className = "",
  height = "h-40",
}: WithClass & { height?: string }) => (
  <div className={`relative w-full ${height} ${className}`}>
    {/* Faint axis ticks */}
    <div className="absolute inset-y-0 left-0 w-full flex flex-col justify-between py-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-px w-full opacity-40" />
      ))}
    </div>
    {/* Trend band */}
    <Skeleton className="absolute inset-x-0 top-1/3 h-1/3 rounded-xl opacity-70" />
  </div>
);

/* ------------------------------------------------------------------ */
/* Badges & lists                                                      */
/* ------------------------------------------------------------------ */

/**
 * Horizontal/wrapping badge rail — for achievements, tags, chips.
 */
export const BadgeRailPlaceholder = ({
  className = "",
  count = 6,
}: WithClass & { count?: number }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-7 rounded-full"
        style={{ width: `${4 + ((i * 7) % 6)}rem` }}
      />
    ))}
  </div>
);

/**
 * Generic stacked list placeholder — for recommendations, insights, log
 * entries. Each row has a left icon, a title line, and a sub-line.
 */
export const ListPlaceholder = ({
  className = "",
  rows = 3,
  rowHeight = "h-14",
}: WithClass & { rows?: number; rowHeight?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className={`flex items-center gap-3 ${rowHeight} rounded-xl border border-border/30 bg-card/30 px-3`}
      >
        <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <Skeleton className="h-3 w-3/5" />
          <Skeleton className="h-2.5 w-4/5" />
        </div>
        <Skeleton className="w-12 h-5 rounded-full shrink-0" />
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* Stat grids                                                          */
/* ------------------------------------------------------------------ */

/**
 * Small stat tile grid (e.g. "Days · Money saved · Streak"). Defaults to
 * a 3-column grid with chunky 14-unit tiles.
 */
export const StatGridPlaceholder = ({
  className = "",
  cols = 3,
  tileHeight = "h-16",
}: WithClass & { cols?: number; tileHeight?: string }) => (
  <div
    className={`grid gap-2 ${className}`}
    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
  >
    {Array.from({ length: cols }).map((_, i) => (
      <div
        key={i}
        className={`${tileHeight} rounded-xl border border-border/30 bg-card/30 p-2 flex flex-col justify-between`}
      >
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* Calendar / heatmap                                                  */
/* ------------------------------------------------------------------ */

/**
 * 7-column month grid placeholder (matches CalendarHeatmap's 6×7 layout).
 */
export const CalendarGridPlaceholder = ({ className = "" }: WithClass) => (
  <div className={className}>
    <div className="grid grid-cols-7 gap-1 mb-1.5">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-2.5 w-6 mx-auto" />
      ))}
    </div>
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 42 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  </div>
);
