import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Global event for child components to trigger feedback without prop drilling
export const FEEDBACK_TRIGGER_EVENT = "sober_club:feedback-trigger";
export function emitFeedbackTrigger() {
  window.dispatchEvent(new CustomEvent(FEEDBACK_TRIGGER_EVENT));
}

const FEEDBACK_DISMISSED_KEY = "feedback_prompt_dismissed";
const FEEDBACK_TRIGGERS_KEY = "feedback_trigger_count";
const MIN_TRIGGERS_BEFORE_PROMPT = 3; // Need at least 3 meaningful actions before prompting
const DISMISS_COOLDOWN_DAYS = 30; // Don't show again for 30 days after dismissal

export function useFeedbackPrompt() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const hasCheckedRef = useRef(false);
  const hasSubmittedRef = useRef<boolean | null>(null);

  // Check if user has already submitted feedback (from DB)
  useEffect(() => {
    if (!user || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    (async () => {
      const { data } = await (supabase.from("feedback_submissions" as any) as any)
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      hasSubmittedRef.current = !!(data && data.length > 0);
    })();
  }, [user]);

  const isDismissedRecently = useCallback(() => {
    const dismissed = localStorage.getItem(FEEDBACK_DISMISSED_KEY);
    if (!dismissed) return false;
    const elapsed = Date.now() - parseInt(dismissed, 10);
    return elapsed < DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  }, []);

  const incrementTrigger = useCallback(() => {
    const count = parseInt(localStorage.getItem(FEEDBACK_TRIGGERS_KEY) || "0", 10);
    localStorage.setItem(FEEDBACK_TRIGGERS_KEY, (count + 1).toString());
    return count + 1;
  }, []);

  // Call this after meaningful actions (mood check-in, journal, milestone, etc.)
  const triggerFeedback = useCallback((reason?: string) => {
    if (!user) return;
    // Already submitted → never show
    if (hasSubmittedRef.current === true) return;
    // Still loading check → skip
    if (hasSubmittedRef.current === null) return;
    // Already dismissed recently
    if (isDismissedRecently()) return;
    // Already showing
    if (showPrompt) return;

    const count = incrementTrigger();
    if (count >= MIN_TRIGGERS_BEFORE_PROMPT) {
      // Show with a slight delay so it doesn't interrupt the current action
      setTimeout(() => setShowPrompt(true), 1500);
    }
  }, [user, showPrompt, isDismissedRecently, incrementTrigger]);

  // Listen for global trigger events from child components
  useEffect(() => {
    const handler = () => triggerFeedback();
    window.addEventListener(FEEDBACK_TRIGGER_EVENT, handler);
    return () => window.removeEventListener(FEEDBACK_TRIGGER_EVENT, handler);
  }, [triggerFeedback]);

  const dismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(FEEDBACK_DISMISSED_KEY, Date.now().toString());
  }, []);

  const markSubmitted = useCallback(() => {
    hasSubmittedRef.current = true;
    setShowPrompt(false);
    localStorage.removeItem(FEEDBACK_TRIGGERS_KEY);
  }, []);

  return { showPrompt, triggerFeedback, dismiss, markSubmitted };
}
