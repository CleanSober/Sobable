import { useEffect, useState, useCallback } from "react";

export const TOUR_PENDING_USER_KEY = "sober_club_welcome_tour_pending_user";
export const TOUR_PENDING_GUEST_KEY = "sober_club_welcome_tour_pending_guest";
export const TOUR_PENDING_LEGACY_KEY = "sober_club_welcome_tour_pending";
export const GUEST_PROFILE_KEY = "sober_club_guest_profile";
export const TOUR_OPEN_DELAY_MS = 800;

interface Args {
  user: { id: string } | null;
  isGuest: boolean;
  onboardingComplete: boolean | undefined;
}

/**
 * Decides whether to show the post-onboarding welcome tour.
 * - For authed users: triggers when profile.onboarding_complete is true AND
 *   the pending_user flag is set in localStorage.
 * - For guests: triggers when a guest profile exists in localStorage AND
 *   the pending_guest flag is set.
 * The flags are set by the onboarding completion handler before the page
 * reloads, so first-time signups always see the tour exactly once.
 */
export function useWelcomeTourTrigger({ user, isGuest, onboardingComplete }: Args) {
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const tourPendingKey = user ? TOUR_PENDING_USER_KEY : TOUR_PENDING_GUEST_KEY;

  useEffect(() => {
    const onboardingDone = user
      ? onboardingComplete
      : isGuest && !!localStorage.getItem(GUEST_PROFILE_KEY);
    if (!onboardingDone) return;
    if (localStorage.getItem(tourPendingKey) !== "true") return;
    const timer = setTimeout(() => setShowWelcomeTour(true), TOUR_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [user, isGuest, onboardingComplete, tourPendingKey]);

  const completeWelcomeTour = useCallback(() => {
    localStorage.removeItem(TOUR_PENDING_USER_KEY);
    localStorage.removeItem(TOUR_PENDING_GUEST_KEY);
    localStorage.removeItem(TOUR_PENDING_LEGACY_KEY);
    setShowWelcomeTour(false);
  }, []);

  return { showWelcomeTour, completeWelcomeTour };
}
