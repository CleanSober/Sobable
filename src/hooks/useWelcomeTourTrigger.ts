import { useEffect, useState, useCallback, useRef } from "react";

export const TOUR_PENDING_USER_KEY = "sober_club_welcome_tour_pending_user";
export const TOUR_PENDING_GUEST_KEY = "sober_club_welcome_tour_pending_guest";
export const TOUR_PENDING_LEGACY_KEY = "sober_club_welcome_tour_pending";
export const TOUR_FIRST_SEEN_USER_KEY = "sober_club_welcome_tour_first_seen_user";
export const TOUR_FIRST_SEEN_GUEST_KEY = "sober_club_welcome_tour_first_seen_guest";
export const GUEST_PROFILE_KEY = "sober_club_guest_profile";
export const TOUR_OPEN_DELAY_MS = 800;

interface Args {
  user: { id: string } | null;
  isGuest: boolean;
  onboardingComplete: boolean | undefined;
}

export type TourUserType = "guest" | "authed";

export interface TourContext {
  userType: TourUserType;
  isFirstTime: boolean;
}

/**
 * Decides whether to show the post-onboarding welcome tour.
 * - For authed users: triggers when profile.onboarding_complete is true AND
 *   the pending_user flag is set in localStorage.
 * - For guests: triggers when a guest profile exists in localStorage AND
 *   the pending_guest flag is set.
 * Also tracks whether this is the user's first time seeing the tour (vs. a
 * replay from settings) via a separate `first_seen` localStorage flag, so
 * analytics can distinguish first-time signup tours from manual replays.
 */
export function useWelcomeTourTrigger({ user, isGuest, onboardingComplete }: Args) {
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [tourContext, setTourContext] = useState<TourContext | null>(null);
  const tourPendingKey = user ? TOUR_PENDING_USER_KEY : TOUR_PENDING_GUEST_KEY;
  const firstSeenKey = user ? TOUR_FIRST_SEEN_USER_KEY : TOUR_FIRST_SEEN_GUEST_KEY;
  const firstSeenKeyRef = useRef(firstSeenKey);
  firstSeenKeyRef.current = firstSeenKey;

  useEffect(() => {
    const onboardingDone = user
      ? onboardingComplete
      : isGuest && !!localStorage.getItem(GUEST_PROFILE_KEY);
    if (!onboardingDone) return;
    if (localStorage.getItem(tourPendingKey) !== "true") return;
    const timer = setTimeout(() => {
      const isFirstTime = localStorage.getItem(firstSeenKey) !== "true";
      setTourContext({ userType: user ? "authed" : "guest", isFirstTime });
      setShowWelcomeTour(true);
    }, TOUR_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [user, isGuest, onboardingComplete, tourPendingKey, firstSeenKey]);

  const completeWelcomeTour = useCallback(() => {
    // Mark first-seen for this scope so subsequent opens (e.g. Profile replay)
    // are tagged as replays in analytics.
    try { localStorage.setItem(firstSeenKeyRef.current, "true"); } catch { /* noop */ }
    localStorage.removeItem(TOUR_PENDING_USER_KEY);
    localStorage.removeItem(TOUR_PENDING_GUEST_KEY);
    localStorage.removeItem(TOUR_PENDING_LEGACY_KEY);
    setShowWelcomeTour(false);
    setTourContext(null);
  }, []);

  return { showWelcomeTour, completeWelcomeTour, tourContext };
}
