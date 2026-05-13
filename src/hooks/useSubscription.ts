import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
  planName: string | null;
  billingSource: "app_store" | "play_store" | null;
}

const EMPTY_STATE: SubscriptionState = {
  subscribed: false,
  productId: null,
  priceId: null,
  subscriptionEnd: null,
  planName: null,
  billingSource: null,
};

const inferBillingSource = (
  subscriptionId: string | null | undefined
): SubscriptionState["billingSource"] => {
  if (!subscriptionId) return null;
  if (subscriptionId.startsWith("iap_ios")) return "app_store";
  if (subscriptionId.startsWith("iap_android")) return "play_store";
  return null;
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(EMPTY_STATE);
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_type, status, current_period_end, stripe_subscription_id")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .in("plan_type", ["premium", "pro"])
        .maybeSingle();

      if (data) {
        setSubscription({
          subscribed: true,
          productId: null,
          priceId: null,
          subscriptionEnd: data.current_period_end ?? null,
          planName: "Sober Club",
          billingSource: inferBillingSource(data.stripe_subscription_id),
        });
      } else {
        setSubscription(EMPTY_STATE);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription(EMPTY_STATE);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh subscription when the tab regains focus (covers IAP flows) or
  // when a successful purchase/restore dispatches the global refresh event.
  useEffect(() => {
    const onRefresh = () => {
      if (user) checkSubscription();
    };
    window.addEventListener("focus", onRefresh);
    window.addEventListener("premium-status-refresh", onRefresh);
    return () => {
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener("premium-status-refresh", onRefresh);
    };
  }, [checkSubscription, user]);

  const openNativeSubscriptionManagement = useCallback(() => {
    const platform = Capacitor.getPlatform();
    if (platform === "ios") {
      window.open("https://apps.apple.com/account/subscriptions", "_blank");
      return;
    }
    if (platform === "android") {
      window.open("https://play.google.com/store/account/subscriptions", "_blank");
      return;
    }
    toast.info("Manage your subscription from the App Store or Google Play app.");
  }, []);

  const openManageSubscription = useCallback(async () => {
    openNativeSubscriptionManagement();
  }, [openNativeSubscriptionManagement]);

  return {
    ...subscription,
    isPremium: subscription.subscribed,
    loading,
    checkoutLoading: false,
    checkSubscription,
    openManageSubscription,
  };
};
