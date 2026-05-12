/**
 * Shared sizing tokens for all skeleton placeholders.
 *
 * Use these instead of ad-hoc Tailwind values inside skeleton components so
 * every loading state has the same spacing rhythm, radii, and responsive
 * widths as the real UI it replaces.
 *
 * Tokens map to the same values used by `card-enhanced` / `glass-card` and
 * the Tailwind `rounded-*` scale, so swapping a skeleton for the real
 * component never causes a visible shift.
 */

/* ---------- Border radii (match Tailwind + card primitives) ---------- */
export const SKELETON_RADIUS = {
  /** Inline pill / chip / badge */
  pill: "rounded-full",
  /** Buttons, small chips, status badges (`rounded-md`) */
  sm: "rounded-md",
  /** Inputs, list rows, small tiles (`rounded-lg`) */
  md: "rounded-lg",
  /** Standard tile / inner block (`rounded-xl`) */
  lg: "rounded-xl",
  /** Default card surface — matches `.card-enhanced` (`rounded-2xl`) */
  card: "rounded-2xl",
  /** Hero / sobriety counter card (`rounded-3xl`) */
  hero: "rounded-3xl",
} as const;

/* ---------- Vertical spacing between stacked blocks ---------- */
export const SKELETON_GAP = {
  /** Tight stack — items inside a row */
  xs: "space-y-1.5",
  /** Default stack inside a card */
  sm: "space-y-2",
  /** Stack of cards / sections inside a tab body */
  md: "space-y-3",
  /** Loose stack between section groupings */
  lg: "space-y-4",
} as const;

/* ---------- Horizontal padding tokens (mirror real cards) ---------- */
export const SKELETON_PADDING = {
  /** Compact card padding */
  sm: "p-3",
  /** Default card padding */
  md: "p-4",
  /** Hero card padding */
  lg: "p-5",
} as const;

/* ---------- Heights for common building blocks ---------- */
export const SKELETON_HEIGHT = {
  /** Section caption / uppercase label (10-11px) */
  caption: "h-2.5",
  /** Body text line (~12-13px) */
  body: "h-3",
  /** Subtitle line (~14px) */
  subtitle: "h-3.5",
  /** Title line (~16px) */
  title: "h-4",
  /** Page heading (~18px, matches `text-lg font-bold`) */
  heading: "h-5",
  /** Default input / small button row */
  input: "h-10",
  /** Standard touch target (button) */
  button: "h-12",
  /** List row with icon + 2 lines */
  listRow: "h-14",
  /** Compact summary card */
  cardSm: "h-20",
  /** Default content card */
  cardMd: "h-28",
  /** Tall content card */
  cardLg: "h-32",
  /** Extra-tall card (with chart / list) */
  cardXl: "h-36",
  /** Hero / counter card */
  hero: "h-44",
} as const;

/* ---------- Container max-widths (match the real app shell) ---------- */
/**
 * Mirrors the `container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 md:px-6`
 * pattern used by every page in `src/pages/Index.tsx` and `Profile.tsx`.
 *
 * Use as the outermost wrapper for any full-page skeleton so the card
 * column matches the real layout at every breakpoint.
 */
export const SKELETON_CONTAINER =
  "container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 md:px-6";

/**
 * Title-block widths chosen to feel close to a real heading line at each
 * breakpoint without stretching the skeleton edge to edge.
 */
export const SKELETON_TITLE_WIDTH = {
  sm: "w-32",
  md: "w-40",
  lg: "w-48",
} as const;

export const SKELETON_SUBTITLE_WIDTH = {
  sm: "w-44",
  md: "w-56",
  lg: "w-72",
} as const;

export type SkeletonRadius = keyof typeof SKELETON_RADIUS;
export type SkeletonHeight = keyof typeof SKELETON_HEIGHT;
