import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useAdMob } from "@/hooks/useAdMob";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface AdBannerProps {
  position?: "top" | "bottom";
}

/**
 * AdBanner component - Shows banner ads for non-premium users on native platforms
 * Premium users don't see ads (ad-free experience)
 */
export const AdBanner = ({ position = "bottom" }: AdBannerProps) => {
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const { showBanner, hideBanner, isInitialized, error } = useAdMob();

  useEffect(() => {
    // Don't show ads on web or if still checking premium status
    if (!Capacitor.isNativePlatform() || premiumLoading) {
      return;
    }

    // Premium users get ad-free experience
    if (isPremium) {
      hideBanner();
      return;
    }

    // Show banner for non-premium users
    if (isInitialized) {
      showBanner(position);
    }

    return () => {
      hideBanner();
    };
  }, [isInitialized, isPremium, premiumLoading, position, showBanner, hideBanner]);

  // This component doesn't render anything visible
  // The AdMob plugin renders the native banner ad
  if (error && import.meta.env.DEV) {
    console.warn("AdBanner error:", error);
  }

  return null;
};
