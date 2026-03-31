import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const WELCOME_HUB_URL = "https://cegbfvxrxasvhixsmzyg.supabase.co";
const WELCOME_HUB_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZ2JmdnhyeGFzdmhpeHNtenlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDI0MjIsImV4cCI6MjA1ODY3ODQyMn0.SsREJJBm2VEz4FMTnUtpVOEH5MqlFj-rBbcOfjMNfKo";

/**
 * Reads ?ref= from URL, stores it in localStorage for 30-day attribution,
 * and calls the Welcome Hub's track-referral edge function to record the click.
 */
export const useReferralTracking = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    // Store in localStorage for 30-day attribution (don't overwrite existing)
    const existing = localStorage.getItem("sober_club_ref");
    if (!existing) {
      localStorage.setItem("sober_club_ref", ref);
      localStorage.setItem("sober_club_ref_at", Date.now().toString());
    }

    // Track the click via Welcome Hub's edge function
    fetch(`${WELCOME_HUB_URL}/functions/v1/track-referral`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": WELCOME_HUB_ANON_KEY,
        "Authorization": `Bearer ${WELCOME_HUB_ANON_KEY}`,
      },
      body: JSON.stringify({
        referral_code: ref,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      }),
    }).catch(console.error);
  }, [searchParams]);
};

/**
 * Get the stored referral code if still within 30-day window.
 */
export const getStoredReferralCode = (): string | null => {
  const code = localStorage.getItem("sober_club_ref");
  const timestamp = localStorage.getItem("sober_club_ref_at");

  if (!code || !timestamp) return null;

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - parseInt(timestamp) > thirtyDaysMs) {
    // Expired — clean up
    localStorage.removeItem("sober_club_ref");
    localStorage.removeItem("sober_club_ref_at");
    return null;
  }

  return code;
};
