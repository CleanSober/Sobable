import { useEffect, useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, InterstitialAdPluginEvents } from "@capacitor-community/admob";
import { admobConfig } from "@/lib/admobConfig";

interface UseAdMobReturn {
  isInitialized: boolean;
  isBannerVisible: boolean;
  isInterstitialLoaded: boolean;
  showBanner: (position?: "top" | "bottom") => Promise<void>;
  hideBanner: () => Promise<void>;
  loadInterstitial: () => Promise<void>;
  showInterstitial: () => Promise<boolean>;
  error: string | null;
}

export const useAdMob = (): UseAdMobReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize AdMob on native platforms
  useEffect(() => {
    const initializeAdMob = async () => {
      if (!Capacitor.isNativePlatform()) {
        console.log("AdMob: Not running on native platform, skipping initialization");
        return;
      }

      const initializationError = admobConfig.getInitializationError();
      if (initializationError) {
        console.warn(`AdMob: ${initializationError}`);
        setError(initializationError);
        return;
      }

      try {
        await AdMob.initialize({
          initializeForTesting: false,
        });
        
        // Set up event listeners
        AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
          console.log("AdMob: Banner loaded");
        });

        AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => {
          console.log("AdMob: Banner size changed", info);
        });

        AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
          console.error("AdMob: Banner failed to load", error);
          setError("Banner ad failed to load");
        });

        AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
          console.log("AdMob: Interstitial loaded");
          setIsInterstitialLoaded(true);
        });

        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
          console.log("AdMob: Interstitial dismissed");
          setIsInterstitialLoaded(false);
        });

        AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
          console.error("AdMob: Interstitial failed to load", error);
          setError("Interstitial ad failed to load");
          setIsInterstitialLoaded(false);
        });

        setIsInitialized(true);
        console.log("AdMob: Initialized successfully");
      } catch (err) {
        console.error("AdMob: Failed to initialize", err);
        setError(err instanceof Error ? err.message : "Failed to initialize AdMob");
      }
    };

    initializeAdMob();

  }, []);

  // Show banner ad
  const showBanner = useCallback(async (position: "top" | "bottom" = "bottom") => {
    if (!Capacitor.isNativePlatform()) return;

    const unitIdError = admobConfig.getUnitIdError("banner");
    if (unitIdError) {
      setError(unitIdError);
      return;
    }

    const adUnitIds = admobConfig.getUnitIds();
    
    try {
      await AdMob.showBanner({
        adId: adUnitIds.banner!,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: position === "top" ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      });
      setIsBannerVisible(true);
      setError(null);
    } catch (err) {
      console.error("AdMob: Failed to show banner", err);
      setError(err instanceof Error ? err.message : "Failed to show banner");
    }
  }, []);

  // Hide banner ad
  const hideBanner = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await AdMob.hideBanner();
      setIsBannerVisible(false);
    } catch (err) {
      console.error("AdMob: Failed to hide banner", err);
    }
  }, []);

  // Load interstitial ad
  const loadInterstitial = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    const unitIdError = admobConfig.getUnitIdError("interstitial");
    if (unitIdError) {
      setError(unitIdError);
      setIsInterstitialLoaded(false);
      return;
    }

    const adUnitIds = admobConfig.getUnitIds();
    
    try {
      await AdMob.prepareInterstitial({
        adId: adUnitIds.interstitial!,
        isTesting: false,
      });
      setError(null);
    } catch (err) {
      console.error("AdMob: Failed to load interstitial", err);
      setError(err instanceof Error ? err.message : "Failed to load interstitial");
    }
  }, []);

  // Show interstitial ad
  const showInterstitial = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false;
    
    if (!isInterstitialLoaded) {
      console.log("AdMob: Interstitial not loaded, loading now...");
      await loadInterstitial();
      // Wait a bit for the ad to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    try {
      await AdMob.showInterstitial();
      setIsInterstitialLoaded(false);
      return true;
    } catch (err) {
      console.error("AdMob: Failed to show interstitial", err);
      setError(err instanceof Error ? err.message : "Failed to show interstitial");
      return false;
    }
  }, [isInterstitialLoaded, loadInterstitial]);

  return {
    isInitialized,
    isBannerVisible,
    isInterstitialLoaded,
    showBanner,
    hideBanner,
    loadInterstitial,
    showInterstitial,
    error,
  };
};
