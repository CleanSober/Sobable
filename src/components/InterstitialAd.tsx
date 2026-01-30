import { useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { useAdMob } from "@/hooks/useAdMob";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface UseInterstitialAdReturn {
  showAd: () => Promise<boolean>;
  isReady: boolean;
}

/**
 * Hook to show interstitial ads at natural break points
 * Premium users don't see ads
 */
export const useInterstitialAd = (): UseInterstitialAdReturn => {
  const { isPremium } = usePremiumStatus();
  const { loadInterstitial, showInterstitial, isInterstitialLoaded, isInitialized } = useAdMob();

  // Pre-load interstitial when component mounts
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || isPremium) return;
    
    if (isInitialized && !isInterstitialLoaded) {
      loadInterstitial();
    }
  }, [isInitialized, isInterstitialLoaded, isPremium, loadInterstitial]);

  const showAd = useCallback(async (): Promise<boolean> => {
    // Don't show ads on web or for premium users
    if (!Capacitor.isNativePlatform() || isPremium) {
      return true; // Return true so app flow continues
    }

    const shown = await showInterstitial();
    
    // Pre-load the next interstitial
    if (shown) {
      setTimeout(() => loadInterstitial(), 1000);
    }
    
    return shown;
  }, [isPremium, showInterstitial, loadInterstitial]);

  return {
    showAd,
    isReady: isInterstitialLoaded,
  };
};

/**
 * Component wrapper for interstitial ad trigger points
 * Shows ad when action is triggered, then executes callback
 */
interface InterstitialTriggerProps {
  children: (triggerAd: () => Promise<void>) => React.ReactNode;
  onAdComplete?: () => void;
}

export const InterstitialTrigger = ({ children, onAdComplete }: InterstitialTriggerProps) => {
  const { showAd } = useInterstitialAd();

  const triggerAd = useCallback(async () => {
    await showAd();
    onAdComplete?.();
  }, [showAd, onAdComplete]);

  return <>{children(triggerAd)}</>;
};
