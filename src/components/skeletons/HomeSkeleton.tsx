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

/**
 * Shared title block for tab skeletons — matches the
 * `text-lg font-bold` h1 + `text-xs muted` subtitle used in Index.tsx.
 */
const TabTitle = ({ titleW = "w-40", subW = "w-56" }: { titleW?: string; subW?: string }) => (
  <div className="flex flex-col items-center gap-1.5 py-1">
    <Skeleton className={`h-5 ${titleW}`} />
    <Skeleton className={`h-3 ${subW}`} />
  </div>
);

const SectionLabel = ({ w = "w-24" }: { w?: string }) => (
  <Skeleton className={`h-2.5 ${w} mx-1 mt-1`} />
);

/**
 * Check-In tab skeleton.
 * Mirrors: title + DailyAffirmation + (Mood, Sleep, Hydration) + Journal + (Breathing, Meditations).
 */
export const CheckInSkeleton = () => (
  <div className="space-y-4">
    <TabTitle titleW="w-36" subW="w-64" />
    {/* DailyAffirmation card */}
    <Skeleton className="h-24 rounded-2xl" />

    <SectionLabel w="w-20" />
    <Skeleton className="h-32 rounded-2xl" /> {/* MoodCheckIn */}
    <Skeleton className="h-28 rounded-2xl" /> {/* SleepTracker */}
    <Skeleton className="h-28 rounded-2xl" /> {/* HydrationTracker */}

    <SectionLabel w="w-16" />
    <Skeleton className="h-36 rounded-2xl" /> {/* Journal */}

    <SectionLabel w="w-20" />
    <Skeleton className="h-28 rounded-2xl" /> {/* BreathingExercise */}
    <Skeleton className="h-32 rounded-2xl" /> {/* GuidedMeditations */}
  </div>
);

/**
 * Triggers & Coping tab skeleton.
 * Mirrors: title + (CravingTimer, RiskPrediction) + (TriggerLogger, PatternAnalysis) + (Plan, CrisisResources).
 */
export const TriggersSkeleton = () => (
  <div className="space-y-4">
    <TabTitle titleW="w-44" subW="w-72" />

    <SectionLabel w="w-24" />
    <Skeleton className="h-32 rounded-2xl" /> {/* CravingTimer */}
    <Skeleton className="h-28 rounded-2xl" /> {/* RiskPrediction (locked) */}

    <SectionLabel w="w-24" />
    <Skeleton className="h-36 rounded-2xl" /> {/* TriggerLogger */}
    <Skeleton className="h-28 rounded-2xl" /> {/* PatternAnalysis (locked) */}

    <SectionLabel w="w-20" />
    <Skeleton className="h-36 rounded-2xl" /> {/* RelapsePreventionPlan */}
    <Skeleton className="h-28 rounded-2xl" /> {/* CrisisResources */}
  </div>
);

/**
 * Progress tab skeleton.
 * Mirrors: title + ProgressView + CalendarHeatmap + premium insights stack.
 */
export const ProgressSkeleton = () => (
  <div className="space-y-4">
    <TabTitle titleW="w-32" subW="w-64" />

    <SectionLabel w="w-24" />
    <Skeleton className="h-44 rounded-2xl" /> {/* ProgressView */}

    <SectionLabel w="w-28" />
    <Skeleton className="h-40 rounded-2xl" /> {/* CalendarHeatmap */}

    <SectionLabel w="w-28" />
    <Skeleton className="h-32 rounded-2xl" /> {/* Premium insights (locked) */}
    <Skeleton className="h-48 rounded-2xl" /> {/* PremiumFeatureSection */}
  </div>
);

/**
 * Profile / Settings page skeleton.
 * Mirrors the Profile page chrome (back button + title + Save) and the
 * stacked card sections used in `src/pages/Profile.tsx`.
 */
export const ProfileSkeleton = () => (
  <div className="min-h-screen min-h-[100dvh] bg-background">
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[60px] rounded-full" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 blur-[60px] rounded-full" />
    </div>

    {/* Header */}
    <header className="sticky top-0 z-40 safe-area-top">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
      <div className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 py-2 flex items-center gap-3 relative">
        <Skeleton className="w-9 h-9 rounded-xl" /> {/* Back */}
        <Skeleton className="h-4 w-16 flex-1" />     {/* "Profile" title */}
        <Skeleton className="h-8 w-16 rounded-md" /> {/* Save button */}
      </div>
    </header>

    <main className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 md:px-6 py-4 relative pb-32">
      <div className="space-y-4">
        {/* Avatar + name card */}
        <div className="rounded-2xl border border-border/30 bg-card/40 p-5 flex flex-col items-center gap-3">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>

        {/* Subscription / Sober Club card */}
        <div className="rounded-2xl border border-border/30 bg-card/40 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Personal info section */}
        <div className="rounded-2xl border border-border/30 bg-card/40">
          <div className="px-4 pt-4 pb-3 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="px-4 pb-4 space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Notifications section */}
        <div className="rounded-2xl border border-border/30 bg-card/40">
          <div className="px-4 pt-4 pb-3 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-52" />
          </div>
          <div className="px-4 pb-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Account section */}
        <div className="rounded-2xl border border-border/30 bg-card/40">
          <div className="px-4 pt-4 pb-3 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="px-4 pb-4 space-y-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  </div>
);
