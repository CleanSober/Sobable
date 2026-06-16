import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Global event for child components to trigger feedback without prop drilling
export const FEEDBACK_TRIGGER_EVENT = "sober_club:feedback-trigger";
export function emitFeedbackTrigger() {
  window.dispatchEvent(new CustomEvent(FEEDBACK_TRIGGER_EVENT));
}

const FEEDBACK_LAST_SHOWN_KEY = "feedback_prompt_last_shown";
const FEEDBACK_COMPLETED_KEY = "feedback_prompt_completed"; // user left a review OR sent feedback → never again
const FEEDBACK_TRIGGERS_KEY = "feedback_trigger_count";
const MIN_TRIGGERS_BEFORE_PROMPT = 3; // Need at least 3 meaningful actions before the FIRST prompt
const PROMPT_COOLDOWN_DAYS = 5; // Show at most once every 5 days

export function useFeedbackPrompt() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const hasCheckedRef = useRef(false);
  const hasSubmittedRef = useRef<boolean | null>(null);

  // Check if user has already submitted feedback (from DB) — survives device changes
  useEffect(() => {
    if (!user || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    (async () => {
      const { data } = await (supabase.from("feedback_submissions" as any) as any)
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      const submittedRemote = !!(data && data.length > 0);
      const submittedLocal = localStorage.getItem(FEEDBACK_COMPLETED_KEY) === "1";
      hasSubmittedRef.current = submittedRemote || submittedLocal;
      if (submittedRemote) localStorage.setItem(FEEDBACK_COMPLETED_KEY, "1");
    })();
  }, [user]);

  const isWithinCooldown = useCallback(() => {
    const last = localStorage.getItem(FEEDBACK_LAST_SHOWN_KEY);
    if (!last) return false;
    const elapsed = Date.now() - parseInt(last, 10);
    return elapsed < PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  }, []);

  const incrementTrigger = useCallback(() => {
    const count = parseInt(localStorage.getItem(FEEDBACK_TRIGGERS_KEY) || "0", 10);
    localStorage.setItem(FEEDBACK_TRIGGERS_KEY, (count + 1).toString());
    return count + 1;
  }, []);

  // Call this after meaningful actions (mood check-in, journal, milestone, etc.)
  const triggerFeedback = useCallback((_reason?: string) => {
    if (!user) return;
    // Permanently suppressed — user already left a review or sent feedback
    if (hasSubmittedRef.current === true) return;
    if (localStorage.getItem(FEEDBACK_COMPLETED_KEY) === "1") return;
    // Still loading remote check → skip this round
    if (hasSubmittedRef.current === null) return;
    // Within 5-day cooldown from the last time we showed the prompt
    if (isWithinCooldown()) return;
    // Already showing
    if (showPrompt) return;

    const count = incrementTrigger();
    if (count >= MIN_TRIGGERS_BEFORE_PROMPT) {
      // Show with a slight delay so it doesn't interrupt the current action
      setTimeout(() => {
        setShowPrompt(true);
        localStorage.setItem(FEEDBACK_LAST_SHOWN_KEY, Date.now().toString());
      }, 1500);
    }
  }, [user, showPrompt, isWithinCooldown, incrementTrigger]);

  // Listen for global trigger events from child components
  useEffect(() => {
    const handler = () => triggerFeedback();
    window.addEventListener(FEEDBACK_TRIGGER_EVENT, handler);
    return () => window.removeEventListener(FEEDBACK_TRIGGER_EVENT, handler);
  }, [triggerFeedback]);

  // "Not now" → close & restart the 5-day cooldown (already stamped on show, restamp here too)
  const dismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(FEEDBACK_LAST_SHOWN_KEY, Date.now().toString());
  }, []);

  // Called when user taps "Leave a Review" OR successfully submits in-app feedback.
  // In both cases we never prompt again.
  const markSubmitted = useCallback(() => {
    hasSubmittedRef.current = true;
    setShowPrompt(false);
    localStorage.setItem(FEEDBACK_COMPLETED_KEY, "1");
    localStorage.removeItem(FEEDBACK_TRIGGERS_KEY);
  }, []);

  return { showPrompt, triggerFeedback, dismiss, markSubmitted };
}
