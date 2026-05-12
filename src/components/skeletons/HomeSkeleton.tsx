import { Skeleton } from "@/components/ui/skeleton";

/**
 * Layout-matching skeleton for the home dashboard.
 * Rendered while auth + profile are still loading so the app feels instant
 * instead of showing a blank screen with a spinner.
 */
export const HomeSkeleton = () => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      {/* Ambient backdrop (cheap, static) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[60px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 blur-[60px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 safe-area-top">
        <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center gap-3 relative">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
      </header>

      {/* Body */}
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-4 relative">
        {/* Sobriety counter card */}
        <div className="rounded-3xl border border-border/40 bg-card/50 p-6 space-y-4">
          <Skeleton className="h-3 w-32 mx-auto" />
          <Skeleton className="h-16 w-40 mx-auto" />
          <Skeleton className="h-3 w-24 mx-auto" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>

        {/* Daily ritual / quick actions */}
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </main>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 inset-x-0 safe-area-bottom">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/30" />
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center justify-between relative">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-6 h-6 rounded-md" />
              <Skeleton className="h-2 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Generic full-page skeleton used as a Suspense fallback for lazy routes.
 * Avoids the jarring "Loading…" text flash.
 */
export const PageSkeleton = () => (
  <div className="min-h-screen min-h-[100dvh] bg-background">
    <div className="container max-w-lg mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  </div>
);
