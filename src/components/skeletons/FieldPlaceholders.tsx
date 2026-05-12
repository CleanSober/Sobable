import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  SKELETON_GAP,
  SKELETON_HEIGHT,
  SKELETON_RADIUS,
} from "./tokens";
import { SkeletonLine, SkeletonListRow } from "./primitives";

/**
 * Per-field placeholders.
 *
 * These match the final rendered shape of common UI building blocks (charts,
 * badge rails, lists, calendars, stat grids) so that a section reserves its
 * real height before data hydrates — eliminating layout shift inside cards.
 *
 * All sizing is driven by the shared tokens in `./tokens.ts` so spacing,
 * radii, and responsive widths stay consistent across breakpoints.
 */

type WithClass = { className?: string };

/* ------------------------------------------------------------------ */
/* Charts                                                              */
/* ------------------------------------------------------------------ */

/**
 * Bar chart placeholder — matches typical Recharts BarChart used in
 * PremiumAnalytics / DataInsights.
 */
export const ChartBarPlaceholder = ({
  className = "",
  bars = 7,
  height = SKELETON_HEIGHT.hero, // h-44
}: WithClass & { bars?: number; height?: string }) => {
  // Stable pseudo-random heights for visual rhythm.
  const heights = ["40%", "65%", "55%", "80%", "45%", "70%", "60%", "75%", "50%", "85%"];
  return (
    <div className={cn("w-full flex items-end justify-between gap-2 px-1", height, className)}>
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
 * Line chart placeholder — single muted band with axis ticks at the typical
 * trend-line container height.
 */
export const ChartLinePlaceholder = ({
  className = "",
  height = SKELETON_HEIGHT.cardXl, // h-36
}: WithClass & { height?: string }) => (
  <div className={cn("relative w-full", height, className)}>
    <div className="absolute inset-y-0 left-0 w-full flex flex-col justify-between py-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-px w-full opacity-40" />
      ))}
    </div>
    <Skeleton className={cn("absolute inset-x-0 top-1/3 h-1/3 opacity-70", SKELETON_RADIUS.lg)} />
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
  <div className={cn("flex flex-wrap gap-2", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn("h-7", SKELETON_RADIUS.pill)}
        style={{ width: `${4 + ((i * 7) % 6)}rem` }}
      />
    ))}
  </div>
);

/**
 * Generic stacked list placeholder — for recommendations, insights, log entries.
 */
export const ListPlaceholder = ({
  className = "",
  rows = 3,
  rowHeight,
}: WithClass & { rows?: number; rowHeight?: string }) => {
  // rowHeight is kept as a free-form Tailwind class for backwards compat.
  const heightToken = rowHeight ?? SKELETON_HEIGHT.listRow;
  return (
    <div className={cn(SKELETON_GAP.sm, className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonListRow
          key={i}
          // SkeletonListRow defaults to listRow; only forward when caller customised.
          {...(rowHeight
            ? { className: cn(rowHeight) }
            : { className: heightToken === SKELETON_HEIGHT.listRow ? undefined : heightToken })}
        />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Stat grids                                                          */
/* ------------------------------------------------------------------ */

/**
 * Small stat tile grid (e.g. "Days · Money saved · Streak"). Defaults to a
 * 3-column grid with cardSm tiles so it matches real summary tiles.
 */
export const StatGridPlaceholder = ({
  className = "",
  cols = 3,
  tileHeight = SKELETON_HEIGHT.cardSm.replace("h-20", "h-16"), // slightly tighter
}: WithClass & { cols?: number; tileHeight?: string }) => (
  <div
    className={cn("grid gap-2", className)}
    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
  >
    {Array.from({ length: cols }).map((_, i) => (
      <div
        key={i}
        className={cn(
          tileHeight,
          SKELETON_RADIUS.lg,
          "border border-border/30 bg-card/30 p-2 flex flex-col justify-between",
        )}
      >
        <SkeletonLine height="caption" width="w-12" />
        <SkeletonLine height="title" width="w-3/4" />
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
        <Skeleton key={i} className={cn("aspect-square", SKELETON_RADIUS.md)} />
      ))}
    </div>
  </div>
);
