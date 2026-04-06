import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getPlanByPriceId, STRIPE_PLANS } from "@/lib/stripe";
import { toast } from "sonner";
import { getStoredReferralCode } from "@/hooks/useReferralTracking";

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
  planName: string | null;
  billingSource: "stripe" | "app_store" | "play_store" | null;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    priceId: null,
    subscriptionEnd: null,
    planName: null,
    billingSource: null,
  });
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setSubscription({
        subscribed: false,
        productId: null,
        priceId: null,
        subscriptionEnd: null,
        planName: null,
        billingSource: null,
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const plan = data.price_id ? getPlanByPriceId(data.price_id) : null;

      setSubscription({
        subscribed: data.subscribed,
        productId: data.product_id,
        priceId: data.price_id,
        subscriptionEnd: data.subscription_end,
        planName: data.plan_name || plan?.name || (data.subscribed ? "Sober Club" : null),
        billingSource: data.billing_source || null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Check on URL params for checkout success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    
    if (checkoutStatus === "success") {
      toast.success("Welcome to Sober Club! Your subscription is now active.");
      // Remove query params
      window.history.replaceState({}, "", window.location.pathname);
      // Refresh subscription status
      setTimeout(checkSubscription, 2000);
    } else if (checkoutStatus === "cancelled") {
      toast.info("Checkout cancelled. No charges were made.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [checkSubscription]);

  const startCheckout = async (priceId: string) => {
    if (!session?.access_token) {
      toast.error("Please sign in to subscribe");
      return;
    }

    setCheckoutLoading(true);
    try {
      const referralCode = getStoredReferralCode();
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, referralCode },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error starting checkout:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to manage your subscription");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open billing portal. Please try again.");
    }
  };

  const openNativeSubscriptionManagement = useCallback(() => {
    const platform = Capacitor.getPlatform();
    if (platform === "ios") {
      window.open("https://apps.apple.com/account/subscriptions", "_blank");
      return;
    }
    if (platform === "android") {
      window.open("https://play.google.com/store/account/subscriptions", "_blank");
    }
  }, []);

  const openManageSubscription = useCallback(async () => {
    if (subscription.billingSource === "app_store" || subscription.billingSource === "play_store") {
      openNativeSubscriptionManagement();
      return;
    }
    await openCustomerPortal();
  }, [openCustomerPortal, openNativeSubscriptionManagement, subscription.billingSource]);

  return {
    ...subscription,
    isPremium: subscription.subscribed,
    loading,
    checkoutLoading,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    openManageSubscription,
  };
};
