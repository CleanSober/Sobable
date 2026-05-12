import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  SKELETON_GAP,
  SKELETON_HEIGHT,
  SKELETON_PADDING,
  SKELETON_RADIUS,
  SKELETON_TITLE_WIDTH,
  SKELETON_SUBTITLE_WIDTH,
  type SkeletonHeight,
  type SkeletonRadius,
} from "./tokens";

/**
 * Shared skeleton building blocks.
 *
 * All primitives consume the tokens in `./tokens.ts`, so any change to
 * spacing/radii/heights propagates across every skeleton automatically and
 * stays consistent across breakpoints.
 */

/* ------------------------------------------------------------------ */
/* Atoms                                                               */
/* ------------------------------------------------------------------ */

type LineProps = {
  /** Token-based height (defaults to body text). */
  height?: SkeletonHeight;
  /** Tailwind width class (e.g. "w-32", "w-1/2"). */
  width?: string;
  className?: string;
};

/** Single line of skeleton text (caption / body / title / heading). */
export const SkeletonLine = ({ height = "body", width = "w-full", className }: LineProps) => (
  <Skeleton className={cn(SKELETON_HEIGHT[height], width, className)} />
);

/** Round avatar / icon placeholder. */
export const SkeletonCircle = ({
  size = "w-10 h-10",
  className,
}: {
  size?: string;
  className?: string;
}) => <Skeleton className={cn(size, SKELETON_RADIUS.pill, className)} />;

/** Pill / chip / badge placeholder. */
export const SkeletonPill = ({
  width = "w-16",
  height = "h-6",
  className,
}: {
  width?: string;
  height?: string;
  className?: string;
}) => <Skeleton className={cn(height, width, SKELETON_RADIUS.pill, className)} />;

/** Block placeholder (card, tile, button) with token-driven radius. */
export const SkeletonBlock = ({
  height = "cardMd",
  radius = "lg",
  width = "w-full",
  className,
}: {
  height?: SkeletonHeight;
  radius?: SkeletonRadius;
  width?: string;
  className?: string;
}) => (
  <Skeleton
    className={cn(SKELETON_HEIGHT[height], width, SKELETON_RADIUS[radius], className)}
  />
);

/* ------------------------------------------------------------------ */
/* Card scaffolds                                                      */
/* ------------------------------------------------------------------ */

/**
 * Card surface that matches `.card-enhanced` and `gradient-card` —
 * `rounded-2xl border border-border/30 bg-card/40` with `p-4` by default.
 */
export const SkeletonCard = ({
  padding = "md",
  gap = "sm",
  radius = "card",
  className,
  children,
}: {
  padding?: keyof typeof SKELETON_PADDING;
  gap?: keyof typeof SKELETON_GAP;
  radius?: SkeletonRadius;
  className?: string;
  children?: React.ReactNode;
}) => (
  <div
    className={cn(
      SKELETON_RADIUS[radius],
      "border border-border/30 bg-card/40",
      SKELETON_PADDING[padding],
      SKELETON_GAP[gap],
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Section title block — `h1 text-lg font-bold` + `text-xs muted` subtitle,
 * sized at the `md` token by default. Use at the top of every tab skeleton.
 */
export const SkeletonSectionTitle = ({
  size = "md",
  className,
}: {
  size?: keyof typeof SKELETON_TITLE_WIDTH;
  className?: string;
}) => (
  <div className={cn("flex flex-col items-center gap-1.5 py-1", className)}>
    <SkeletonLine height="heading" width={SKELETON_TITLE_WIDTH[size]} />
    <SkeletonLine height="body" width={SKELETON_SUBTITLE_WIDTH[size]} />
  </div>
);

/**
 * Uppercase section caption (e.g. "Today's log", "Stats overview").
 * Matches `text-[11px] font-semibold uppercase` rails used in Index.tsx.
 */
export const SkeletonCaption = ({
  width = "w-24",
  className,
}: {
  width?: string;
  className?: string;
}) => <SkeletonLine height="caption" width={width} className={cn("mx-1 mt-1", className)} />;

/**
 * Standard list row: leading icon, two text lines, trailing pill.
 * Used by ListPlaceholder / SmartInsights / WeeklyReport / etc.
 */
export const SkeletonListRow = ({
  height = "listRow",
  className,
}: {
  height?: SkeletonHeight;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 px-3",
      SKELETON_HEIGHT[height],
      SKELETON_RADIUS.lg,
      "border border-border/30 bg-card/30",
      className,
    )}
  >
    <SkeletonCircle size="w-9 h-9" className="shrink-0 rounded-xl" />
    <div className="flex-1 space-y-1.5 min-w-0">
      <SkeletonLine width="w-3/5" />
      <SkeletonLine height="caption" width="w-4/5" />
    </div>
    <SkeletonPill width="w-12" height="h-5" className="shrink-0" />
  </div>
);
