import { cn } from "@/lib/utils";

/**
 * Skeleton placeholder used across all loading states.
 *
 * Combines a soft pulse (low-contrast opacity wobble) with a horizontal
 * shimmer sweep — softer than the default Tailwind `animate-pulse` so
 * stacked skeletons don't strobe, and the shimmer keeps the eye engaged
 * without implying any specific progress.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/70 animate-pulse-soft",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.06] before:to-transparent",
        "before:animate-[shimmer-sweep_1.8s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
