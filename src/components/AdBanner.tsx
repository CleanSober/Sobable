import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { useAdMob } from "@/hooks/useAdMob";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface AdBannerProps {
  position?: "top" | "bottom";
  enabled?: boolean;
  refreshKey?: string | number;
}

/**
 * AdBanner component - Shows banner ads for non-premium users on native platforms
 * Premium users don't see ads (ad-free experience)
 */
export const AdBanner = ({
  position = "bottom",
  enabled = true,
  refreshKey,
}: AdBannerProps) => {
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const { showBanner, hideBanner, refreshBanner, isInitialized, isBannerVisible, error } = useAdMob();
  const retryDelayRef = useRef(15000);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const shouldShowBanner = enabled && !isPaywallVisible;

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || premiumLoading) {
      return;
    }

    if (isPremium || !shouldShowBanner) {
      hideBanner();
      return;
    }

    if (isInitialized) {
      refreshBanner(position);
    }
  }, [isInitialized, isPremium, premiumLoading, position, refreshKey, shouldShowBanner, refreshBanner, hideBanner]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || premiumLoading || isPremium || !shouldShowBanner || !isInitialized) {
      return;
    }

    const restoreBanner = () => {
      void refreshBanner(position);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        restoreBanner();
      }
    };

    window.addEventListener("focus", restoreBanner);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let cleanupNative: (() => void) | undefined;

    CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        restoreBanner();
      }
    }).then((listener) => {
      cleanupNative = () => {
        void listener.remove();
      };
    });

    return () => {
      window.removeEventListener("focus", restoreBanner);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cleanupNative?.();
    };
  }, [isInitialized, isPremium, premiumLoading, position, shouldShowBanner, refreshBanner]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || premiumLoading || isPremium || !shouldShowBanner || !isInitialized || isBannerVisible) {
      return;
    }

    let cancelled = false;
    let retryId: number | undefined;
    let delay = retryDelayRef.current;

    const scheduleRetry = () => {
      retryId = window.setTimeout(async () => {
        if (cancelled) {
          return;
        }

        await refreshBanner(position);
        delay = Math.min(delay * 2, 120000);
        retryDelayRef.current = delay;
        scheduleRetry();
      }, delay);
    };

    scheduleRetry();

    return () => {
      cancelled = true;
      if (retryId !== undefined) {
        window.clearTimeout(retryId);
      }
    };
  }, [
    isBannerVisible,
    isInitialized,
    isPremium,
    premiumLoading,
    position,
    shouldShowBanner,
    refreshBanner,
  ]);

  useEffect(() => {
    if (isBannerVisible) {
      retryDelayRef.current = 15000;
    }
  }, [isBannerVisible]);

  useEffect(() => {
    const handlePricingVisibility = (event: Event) => {
      const detail = (event as CustomEvent<{ visible?: boolean }>).detail;
      const isVisible = Boolean(detail?.visible);
      setIsPaywallVisible(isVisible);

      if (!isVisible && Capacitor.isNativePlatform() && !premiumLoading && !isPremium && enabled && isInitialized) {
        retryDelayRef.current = 15000;
        void refreshBanner(position);
      }
    };

    window.addEventListener("pricing-plans-visibility", handlePricingVisibility);

    return () => {
      window.removeEventListener("pricing-plans-visibility", handlePricingVisibility);
    };
  }, [enabled, isInitialized, isPremium, position, premiumLoading, refreshBanner]);

  // This component doesn't render anything visible
  // The AdMob plugin renders the native banner ad
  if (error && import.meta.env.DEV) {
    console.warn("AdBanner error:", error);
  }

  return null;
};
