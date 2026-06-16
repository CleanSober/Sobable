import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  SKELETON_CONTAINER,
  SKELETON_GAP,
  SKELETON_HEIGHT,
  SKELETON_RADIUS,
} from "./tokens";
import {
  SkeletonBlock,
  SkeletonCaption,
  SkeletonCard,
  SkeletonCircle,
  SkeletonLine,
  SkeletonSectionTitle,
} from "./primitives";

/* ------------------------------------------------------------------ */
/* Page chrome                                                         */
/* ------------------------------------------------------------------ */

const AmbientBackdrop = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[60px] rounded-full" />
    <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 blur-[60px] rounded-full" />
  </div>
);

/** Shared sticky app header (matches Index.tsx motion.header). */
const HeaderBar = () => (
  <header className="sticky top-0 z-40 safe-area-top">
    <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
    <div className={cn(SKELETON_CONTAINER, "py-2 flex items-center justify-between relative")}>
      <SkeletonLine height="heading" width="w-20" />
      <div className="flex items-center gap-0.5">
        <SkeletonCircle size="w-8 h-8" />
        <SkeletonCircle size="w-8 h-8" />
      </div>
    </div>
  </header>
);

/** Bottom tab bar matching BottomTabs (5 items). */
const BottomTabBar = () => (
  <div className="fixed bottom-0 inset-x-0 safe-area-bottom">
    <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/30" />
    <div className="container max-w-lg mx-auto px-4 py-3 flex items-center justify-between relative">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <Skeleton className={cn("w-6 h-6", SKELETON_RADIUS.sm)} />
          <SkeletonLine height="caption" width="w-10" />
        </div>
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Home tab skeleton                                                   */
/* ------------------------------------------------------------------ */

/**
 * Layout-matching skeleton for the home dashboard.
 * If you change the home composition in `src/pages/Index.tsx`, keep
 * these blocks in sync (see the "home" case in `renderTabContent`).
 */
export const HomeSkeleton = () => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      <AmbientBackdrop />
      <HeaderBar />

      <main className={cn(SKELETON_CONTAINER, "py-3 relative", SKELETON_GAP.md)}>
        {/* Date + greeting */}
        <SkeletonCard padding="sm" gap="xs" className="flex flex-col items-center">
          <SkeletonLine height="caption" width="w-32" />
          <SkeletonLine height="title" width="w-48" />
        </SkeletonCard>

        {/* Sobriety counter — hero card */}
        <SkeletonCard padding="lg" gap="lg" radius="hero">
          <div className="flex items-center justify-between">
            <SkeletonLine height="body" width="w-24" />
            <SkeletonLine height="heading" width="w-16" className={SKELETON_RADIUS.pill} />
          </div>
          <div className="flex flex-col items-center gap-2 py-2">
            <Skeleton className="h-14 w-32" />
            <SkeletonLine height="body" width="w-20" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <SkeletonBlock height="button" radius="lg" />
            <SkeletonBlock height="button" radius="lg" />
            <SkeletonBlock height="button" radius="lg" />
          </div>
          <Skeleton className={cn("h-2 w-full", SKELETON_RADIUS.pill)} />
        </SkeletonCard>

        <SkeletonBlock height="cardSm" radius="card" /> {/* CheckInProgress */}
        <SkeletonBlock height="cardLg" radius="card" /> {/* DailyRitual */}
        <SkeletonBlock height="hero" radius="card" />   {/* QuickActions grid */}
        <SkeletonBlock height="listRow" radius="card" /> {/* AI Coach pill */}
        <SkeletonBlock height="cardLg" radius="card" /> {/* WeeklyRecap */}
        <SkeletonBlock height="cardXl" radius="card" /> {/* AchievementBadges */}
      </main>

      <BottomTabBar />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Generic Suspense fallback                                           */
/* ------------------------------------------------------------------ */

export const PageSkeleton = () => (
  <div className="min-h-screen min-h-[100dvh] bg-background">
    <HeaderBar />
    <main className={cn(SKELETON_CONTAINER, "py-3", SKELETON_GAP.md)}>
      <SkeletonSectionTitle />
      <SkeletonBlock height="cardMd" radius="card" />
      <SkeletonBlock height="cardSm" radius="card" />
      <SkeletonBlock height="cardLg" radius="card" />
      <SkeletonBlock height="cardSm" radius="card" />
    </main>
  </div>
);

/* ------------------------------------------------------------------ */
/* Tab skeletons                                                       */
/* ------------------------------------------------------------------ */

/** Check-In tab skeleton — title + DailyAffirmation + 3 trackers + Journal + 2 calm tools. */
export const CheckInSkeleton = () => (
  <div className={SKELETON_GAP.lg}>
    <SkeletonSectionTitle size="md" />
    <SkeletonBlock height="cardSm" radius="card" />

    <SkeletonCaption width="w-20" />
    <SkeletonBlock height="cardLg" radius="card" />
    <SkeletonBlock height="cardMd" radius="card" />
    <SkeletonBlock height="cardMd" radius="card" />

    <SkeletonCaption width="w-16" />
    <SkeletonBlock height="cardXl" radius="card" />

    <SkeletonCaption width="w-20" />
    <SkeletonBlock height="cardMd" radius="card" />
    <SkeletonBlock height="cardLg" radius="card" />
  </div>
);

/** Triggers & Coping tab skeleton. */
export const TriggersSkeleton = () => (
  <div className={SKELETON_GAP.lg}>
    <SkeletonSectionTitle size="lg" />

    <SkeletonCaption width="w-24" />
    <SkeletonBlock height="cardLg" radius="card" />
    <SkeletonBlock height="cardMd" radius="card" />

    <SkeletonCaption width="w-24" />
    <SkeletonBlock height="cardXl" radius="card" />
    <SkeletonBlock height="cardMd" radius="card" />

    <SkeletonCaption width="w-20" />
    <SkeletonBlock height="cardXl" radius="card" />
    <SkeletonBlock height="cardMd" radius="card" />
  </div>
);

/** Progress tab skeleton. */
export const ProgressSkeleton = () => (
  <div className={SKELETON_GAP.lg}>
    <SkeletonSectionTitle size="md" />

    <SkeletonCaption width="w-24" />
    <SkeletonBlock height="hero" radius="card" />

    <SkeletonCaption width="w-28" />
    <SkeletonBlock height="hero" radius="card" />

    <SkeletonCaption width="w-28" />
    <SkeletonBlock height="cardLg" radius="card" />
    <SkeletonBlock height="hero" radius="card" />
  </div>
);

/**
 * Mini skeleton used as the Suspense fallback for the *late* part of the
 * home tab (AI Coach pill + Achievement Badges preview). Matches the exact
 * layout so there is zero shift when the lazy chunks resolve.
 */
export const HomeLateSkeleton = () => (
  <div className={SKELETON_GAP.md}>
    <div className={cn("flex items-center gap-3 p-3", SKELETON_RADIUS.card, "border border-border/30 bg-card/40")}>
      <Skeleton className={cn("w-10 h-10", SKELETON_RADIUS.lg)} />
      <div className="flex-1 space-y-1.5 min-w-0">
        <SkeletonLine height="title" width="w-32" />
        <SkeletonLine height="caption" width="w-48" />
      </div>
      <SkeletonCircle size="w-4 h-4" />
    </div>
    <SkeletonBlock height="cardXl" radius="card" />
  </div>
);

/** Community tab skeleton — segmented tabs row + 4 forum/chat rows. */
export const CommunityHubSkeleton = () => (
  <div className={SKELETON_GAP.md}>
    <div className={cn("grid grid-cols-6 gap-1 p-1", SKELETON_RADIUS.lg, "border border-border/30 bg-card/40")}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className={cn("h-8", SKELETON_RADIUS.md)} />
      ))}
    </div>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={cn("flex items-center gap-3 p-3", SKELETON_RADIUS.card, "border border-border/30 bg-card/40")}
      >
        <SkeletonCircle size="w-10 h-10" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <SkeletonLine height="title" width="w-2/5" />
          <SkeletonLine height="caption" width="w-3/5" />
        </div>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* Profile skeleton                                                    */
/* ------------------------------------------------------------------ */

export const ProfileSkeleton = () => (
  <div className="min-h-screen min-h-[100dvh] bg-background">
    <AmbientBackdrop />

    <header className="sticky top-0 z-40 safe-area-top">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
      <div className={cn(SKELETON_CONTAINER, "py-2 flex items-center gap-3 relative")}>
        <Skeleton className={cn("w-9 h-9", SKELETON_RADIUS.lg)} />
        <SkeletonLine height="title" width="w-16" className="flex-1" />
        <Skeleton className={cn("h-8 w-16", SKELETON_RADIUS.sm)} />
      </div>
    </header>

    <main className={cn(SKELETON_CONTAINER, "py-4 relative pb-32")}>
      <div className={SKELETON_GAP.lg}>
        {/* Avatar + name */}
        <SkeletonCard padding="lg" gap="md" className="flex flex-col items-center">
          <SkeletonCircle size="w-20 h-20" />
          <SkeletonLine height="title" width="w-32" />
          <SkeletonLine height="body" width="w-44" />
        </SkeletonCard>

        {/* Subscription */}
        <SkeletonCard>
          <div className="flex items-center gap-3">
            <Skeleton className={cn("w-10 h-10", SKELETON_RADIUS.lg)} />
            <div className="flex-1 space-y-1.5">
              <SkeletonLine height="title" width="w-28" />
              <SkeletonLine height="body" width="w-40" />
            </div>
          </div>
          <SkeletonBlock height="input" radius="lg" />
        </SkeletonCard>

        {/* Personal info */}
        <SkeletonCard padding="md" gap="sm">
          <SkeletonLine height="subtitle" width="w-32" />
          <SkeletonLine height="body" width="w-48" />
          <div className="space-y-3 pt-1">
            <SkeletonBlock height="input" radius="lg" />
            <SkeletonBlock height="input" radius="lg" />
            <SkeletonBlock height="input" radius="lg" />
          </div>
        </SkeletonCard>

        {/* Notifications */}
        <SkeletonCard padding="md" gap="sm">
          <SkeletonLine height="subtitle" width="w-28" />
          <SkeletonLine height="body" width="w-52" />
          <div className="space-y-3 pt-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <SkeletonLine height="title" width="w-40" />
                <Skeleton className={cn("h-6 w-10", SKELETON_RADIUS.pill)} />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Account */}
        <SkeletonCard padding="md" gap="sm">
          <SkeletonLine height="subtitle" width="w-24" />
          <SkeletonLine height="body" width="w-44" />
          <div className="space-y-2 pt-1">
            <SkeletonBlock height="input" radius="lg" />
            <SkeletonBlock height="input" radius="lg" />
          </div>
        </SkeletonCard>
      </div>
    </main>
  </div>
);
