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

const IS_TESTING = import.meta.env.DEV;
let globalInitialized = false;
let listenersRegistered = false;
const BOTTOM_TABS_HEIGHT = 76;

const setBannerHeight = (height: number) => {
  document.documentElement.style.setProperty("--admob-banner-height", `${Math.max(0, height)}px`);
};

export const useAdMob = (): UseAdMobReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const waitForInterstitial = useCallback((timeoutMs = 10000) => {
    return new Promise<boolean>((resolve) => {
      const startedAt = Date.now();

      const check = () => {
        if (isInterstitialLoaded) {
          resolve(true);
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          resolve(false);
          return;
        }

        window.setTimeout(check, 250);
      };

      check();
    });
  }, [isInterstitialLoaded]);

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
        if (!globalInitialized) {
          await AdMob.initialize({
            initializeForTesting: IS_TESTING,
          });
          globalInitialized = true;
        }

        if (!listenersRegistered) {
          listenersRegistered = true;

          await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
            console.log("AdMob: Banner loaded");
            window.dispatchEvent(new CustomEvent("admob-banner-loaded"));
          });

          await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => {
            console.log("AdMob: Banner size changed", info);
            setBannerHeight(info.height ?? 0);
          });

          await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
            console.error("AdMob: Banner failed to load", error);
            window.dispatchEvent(
              new CustomEvent("admob-banner-failed", { detail: error })
            );
          });

          await AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
            console.log("AdMob: Interstitial loaded");
            window.dispatchEvent(new CustomEvent("admob-interstitial-loaded"));
          });

          await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
            console.log("AdMob: Interstitial dismissed");
            window.dispatchEvent(new CustomEvent("admob-interstitial-dismissed"));
          });

          await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
            console.error("AdMob: Interstitial failed to load", error);
            window.dispatchEvent(
              new CustomEvent("admob-interstitial-failed", { detail: error })
            );
          });
        }

        const handleInterstitialLoaded = () => {
          setIsInterstitialLoaded(true);
          setError(null);
        };

        const handleInterstitialDismissed = () => {
          setIsInterstitialLoaded(false);
        };

        const handleInterstitialFailed = (event: Event) => {
          const detail = (event as CustomEvent<{ message?: string; errorMessage?: string }>).detail;
          setError(detail?.errorMessage || detail?.message || "Interstitial ad failed to load");
          setIsInterstitialLoaded(false);
        };

        const handleBannerFailed = (event: Event) => {
          const detail = (event as CustomEvent<{ message?: string; errorMessage?: string }>).detail;
          setBannerHeight(0);
          setError(detail?.errorMessage || detail?.message || "Banner ad failed to load");
        };

        window.addEventListener("admob-interstitial-loaded", handleInterstitialLoaded);
        window.addEventListener("admob-interstitial-dismissed", handleInterstitialDismissed);
        window.addEventListener("admob-interstitial-failed", handleInterstitialFailed);
        window.addEventListener("admob-banner-failed", handleBannerFailed);
        setIsInitialized(true);
        console.log("AdMob: Initialized successfully");

        return () => {
          window.removeEventListener("admob-interstitial-loaded", handleInterstitialLoaded);
          window.removeEventListener("admob-interstitial-dismissed", handleInterstitialDismissed);
          window.removeEventListener("admob-interstitial-failed", handleInterstitialFailed);
          window.removeEventListener("admob-banner-failed", handleBannerFailed);
        };
      } catch (err) {
        console.error("AdMob: Failed to initialize", err);
        setError(err instanceof Error ? err.message : "Failed to initialize AdMob");
      }
    };

    let cleanup: (() => void) | undefined;
    initializeAdMob().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
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
        margin: position === "top" ? 0 : BOTTOM_TABS_HEIGHT,
        isTesting: IS_TESTING,
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
      setBannerHeight(0);
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
      setIsInterstitialLoaded(false);
      await AdMob.prepareInterstitial({
        adId: adUnitIds.interstitial!,
        isTesting: IS_TESTING,
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
      const didLoad = await waitForInterstitial();

      if (!didLoad) {
        setError("Interstitial ad not ready yet");
        return false;
      }
    }
    
    try {
      await AdMob.showInterstitial();
      setIsInterstitialLoaded(false);
      setError(null);
      return true;
    } catch (err) {
      console.error("AdMob: Failed to show interstitial", err);
      setError(err instanceof Error ? err.message : "Failed to show interstitial");
      return false;
    }
  }, [isInterstitialLoaded, loadInterstitial, waitForInterstitial]);

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
