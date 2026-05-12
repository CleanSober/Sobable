import { Skeleton } from "@/components/ui/skeleton";

/**
 * Layout-matching skeleton for the home dashboard.
 *
 * Sizes mirror the real Home tab so there is minimal layout shift when
 * data hydrates. If you change the home composition in `src/pages/Index.tsx`
 * (the "home" case in `renderTabContent`), keep these blocks in sync.
 */
export const HomeSkeleton = () => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      {/* Ambient backdrop (cheap, static) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[60px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 blur-[60px] rounded-full" />
      </div>

      {/* Header — matches motion.header in Index.tsx */}
      <header className="sticky top-0 z-40 safe-area-top">
        <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
        <div className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 py-2 flex items-center justify-between relative">
          {/* "Sobable" wordmark */}
          <Skeleton className="h-5 w-20" />
          {/* NotificationCenter + UserProfile icon buttons */}
          <div className="flex items-center gap-0.5">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Body — matches main: px-3 md:px-6 py-3, space-y-3 */}
      <main className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 md:px-6 py-3 space-y-3 relative">
        {/* Date + greeting (glass-card rounded-2xl p-3 text-center) */}
        <div className="rounded-2xl border border-border/30 bg-card/40 p-3 flex flex-col items-center gap-1.5">
          <Skeleton className="h-2.5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Sobriety counter — large hero card */}
        <div className="rounded-3xl border border-border/40 bg-card/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex flex-col items-center gap-2 py-2">
            <Skeleton className="h-14 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* CheckInProgress */}
        <Skeleton className="h-20 rounded-2xl" />

        {/* DailyRitual */}
        <Skeleton className="h-32 rounded-2xl" />

        {/* QuickActions grid */}
        <Skeleton className="h-40 rounded-2xl" />

        {/* AI Recovery Coach pill button */}
        <Skeleton className="h-14 rounded-2xl" />

        {/* WeeklyRecap */}
        <Skeleton className="h-32 rounded-2xl" />

        {/* AchievementBadges */}
        <Skeleton className="h-36 rounded-2xl" />
      </main>

      {/* Bottom tab bar — matches BottomTabs */}
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
 * Mirrors the standard page chrome (sticky header + main container) so
 * lazy-loaded routes don't shift when they mount.
 */
export const PageSkeleton = () => (
  <div className="min-h-screen min-h-[100dvh] bg-background">
    {/* Header stand-in matching the real app header height */}
    <header className="sticky top-0 z-40 safe-area-top">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
      <div className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 py-2 flex items-center justify-between relative">
        <Skeleton className="h-5 w-20" />
        <div className="flex items-center gap-0.5">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </header>

    <main className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 md:px-6 py-3 space-y-3">
      {/* Title + subtitle block */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </main>
  </div>
);
