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
      // First check local DB for fast response
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan_type, status")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .in("plan_type", ["premium", "pro"])
        .maybeSingle();

      if (!error && data) {
        setIsPremium(true);
      } else {
        setIsPremium(false);
      }

      // Then trigger Stripe sync in the background to keep DB up to date
      if (session?.access_token) {
        supabase.functions.invoke("check-subscription", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).then(({ data: stripeData }) => {
          if (stripeData?.subscribed !== undefined) {
            setIsPremium(stripeData.subscribed);
          }
        }).catch(() => {
          // Silently fail - local DB check is the fallback
        });
      }
    } catch {
      setIsPremium(false);
    }
    setLoading(false);
  }, [user?.id, session?.access_token]);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  return { isPremium: isPremium ?? false, loading, refreshPremiumStatus: () => checkPremiumStatus(true) };
};
