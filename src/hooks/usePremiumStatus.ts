import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isPreviewPassActive } from "@/hooks/usePreviewPass";

const BYPASS_PAYWALL = false;

export const usePremiumStatus = () => {
  const { user, session } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(BYPASS_PAYWALL ? true : null);
  const [loading, setLoading] = useState(!BYPASS_PAYWALL);

  const checkPremiumStatus = useCallback(async (forceRefresh = false) => {
    if (BYPASS_PAYWALL) {
      setIsPremium(true);
      setLoading(false);
      return;
    }

    if (!user) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan_type, status")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .in("plan_type", ["premium", "pro"])
        .maybeSingle();

      setIsPremium(!error && !!data);
    } catch {
      setIsPremium(false);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  // Refresh premium state on tab focus and on global "premium-status-refresh"
  // events (dispatched after a successful in-app purchase or restore). This
  // ensures every gated component unlocks immediately, not just the one that
  // initiated the purchase.
  useEffect(() => {
    const refresh = () => checkPremiumStatus(true);
    window.addEventListener("focus", refresh);
    window.addEventListener("premium-status-refresh", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("premium-status-refresh", refresh);
    };
  }, [checkPremiumStatus]);

  return { isPremium: isPremium ?? false, loading, refreshPremiumStatus: () => checkPremiumStatus(true) };
};
