import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const usePremiumStatus = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
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
          .eq("status", "active")
          .maybeSingle();

        if (!error && data) {
          setIsPremium(data.plan_type === "premium" || data.plan_type === "pro");
        } else {
          setIsPremium(false);
        }
      } catch {
        setIsPremium(false);
      }
      setLoading(false);
    };

    checkPremiumStatus();
  }, [user?.id]);

  return { isPremium: isPremium ?? false, loading };
};
