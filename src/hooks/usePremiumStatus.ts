import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

  return { isPremium: isPremium ?? false, loading, refreshPremiumStatus: () => checkPremiumStatus(true) };
};
