/**
 * End-to-end style test for the first-time guest welcome tour trigger.
 *
 * Simulates the full guest sign-up journey:
 *   1. User completes onboarding as a guest -> Index.tsx writes
 *      `sober_club_guest_profile` and `sober_club_welcome_tour_pending_guest=true`
 *      to localStorage and reloads the page.
 *   2. After the reload, Index.tsx mounts and uses `useWelcomeTourTrigger`,
 *      which must open the welcome tour exactly once.
 *   3. After the tour completes, both pending flags are cleared so the tour
 *      never reappears for the returning guest.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  useWelcomeTourTrigger,
  TOUR_PENDING_GUEST_KEY,
  TOUR_PENDING_USER_KEY,
  GUEST_PROFILE_KEY,
  TOUR_OPEN_DELAY_MS,
} from "@/hooks/useWelcomeTourTrigger";

describe("first-time guest sign-up -> welcome tour", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("opens the welcome tour after a first-time guest finishes onboarding and reloads", () => {
    // Step 1: simulate what handleOnboardingComplete writes before reload.
    localStorage.setItem(
      GUEST_PROFILE_KEY,
      JSON.stringify({ name: "Guest", substances: ["alcohol"] }),
    );
    localStorage.setItem(TOUR_PENDING_GUEST_KEY, "true");

    // Step 2: simulate the post-reload mount of Index.tsx as a guest.
    const { result } = renderHook(() =>
      useWelcomeTourTrigger({
        user: null,
        isGuest: true,
        onboardingComplete: undefined,
      }),
    );

    expect(result.current.showWelcomeTour).toBe(false);

    act(() => {
      vi.advanceTimersByTime(TOUR_OPEN_DELAY_MS);
    });

    expect(result.current.showWelcomeTour).toBe(true);
  });

  it("does NOT open the tour for a returning guest (no pending flag)", () => {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify({ name: "Guest" }));
    // No pending flag -> returning guest.

    const { result } = renderHook(() =>
      useWelcomeTourTrigger({
        user: null,
        isGuest: true,
        onboardingComplete: undefined,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(TOUR_OPEN_DELAY_MS * 5);
    });

    expect(result.current.showWelcomeTour).toBe(false);
  });

  it("does NOT open the tour when the guest has no guest profile yet (mid-onboarding)", () => {
    localStorage.setItem(TOUR_PENDING_GUEST_KEY, "true");

    const { result } = renderHook(() =>
      useWelcomeTourTrigger({
        user: null,
        isGuest: true,
        onboardingComplete: undefined,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(TOUR_OPEN_DELAY_MS * 5);
    });

    expect(result.current.showWelcomeTour).toBe(false);
  });

  it("clears both pending flags when the tour is completed so it never reopens", () => {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify({ name: "Guest" }));
    localStorage.setItem(TOUR_PENDING_GUEST_KEY, "true");
    localStorage.setItem(TOUR_PENDING_USER_KEY, "true"); // stale cross-flow flag

    const { result } = renderHook(() =>
      useWelcomeTourTrigger({
        user: null,
        isGuest: true,
        onboardingComplete: undefined,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(TOUR_OPEN_DELAY_MS);
    });
    expect(result.current.showWelcomeTour).toBe(true);

    act(() => {
      result.current.completeWelcomeTour();
    });

    expect(result.current.showWelcomeTour).toBe(false);
    expect(localStorage.getItem(TOUR_PENDING_GUEST_KEY)).toBeNull();
    expect(localStorage.getItem(TOUR_PENDING_USER_KEY)).toBeNull();

  it("does NOT open the tour for an authed user after guest->account migration (onboarding already complete, no pending flag)", () => {
    // Migration cleared the guest profile and pending flags, then set
    // onboarding_complete = true on the new account.
    const { result } = renderHook(() =>
      useWelcomeTourTrigger({
        user: { id: "user-1" },
        isGuest: false,
        onboardingComplete: true,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(TOUR_OPEN_DELAY_MS * 5);
    });

    expect(result.current.showWelcomeTour).toBe(false);
  });
});
