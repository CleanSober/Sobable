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
  refreshBanner: (position?: "top" | "bottom") => Promise<void>;
  loadInterstitial: () => Promise<void>;
  showInterstitial: () => Promise<boolean>;
  error: string | null;
}

const IS_TESTING = import.meta.env.DEV;
const NO_FILL_ERROR_CODE = 3;
let globalInitialized = false;
let listenersRegistered = false;
let globalBannerVisible = false;
let globalBannerPosition: "top" | "bottom" | null = null;
let initializationPromise: Promise<void> | null = null;
let bannerOperationChain: Promise<void> = Promise.resolve();
const BOTTOM_TABS_HEIGHT = 76;

type AdMobErrorDetail = {
  code?: number;
  message?: string;
  errorMessage?: string;
};

const setBannerHeight = (height: number) => {
  document.documentElement.style.setProperty("--admob-banner-height", `${Math.max(0, height)}px`);
};

const queueBannerOperation = (operation: () => Promise<void>) => {
  const nextOperation = bannerOperationChain.then(operation);
  bannerOperationChain = nextOperation.catch(() => undefined);
  return nextOperation;
};

const getAdMobErrorMessage = (detail?: AdMobErrorDetail, fallback = "Ad failed to load") => {
  const message = detail?.errorMessage || detail?.message || fallback;

  if (detail?.code === NO_FILL_ERROR_CODE) {
    return "Ad inventory unavailable right now. Retrying automatically.";
  }

  return message;
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
          if (!initializationPromise) {
            initializationPromise = AdMob.initialize({
              initializeForTesting: IS_TESTING,
            }).then(() => {
              globalInitialized = true;
            });
          }

          await initializationPromise;
        }

        if (!listenersRegistered) {
          listenersRegistered = true;

          await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
            console.log("AdMob: Banner loaded");
            globalBannerVisible = true;
            window.dispatchEvent(new CustomEvent("admob-banner-loaded"));
          });

          await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => {
            console.log("AdMob: Banner size changed", info);
            setBannerHeight(info.height ?? 0);
          });

          await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
            if (error.code === NO_FILL_ERROR_CODE) {
              console.warn("AdMob: Banner has no fill yet", error);
            } else {
              console.error("AdMob: Banner failed to load", error);
            }
            globalBannerVisible = false;
            globalBannerPosition = null;
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

        const handleBannerLoaded = () => {
          setIsBannerVisible(true);
          setError(null);
        };

        const handleBannerFailed = (event: Event) => {
          const detail = (event as CustomEvent<AdMobErrorDetail>).detail;
          setBannerHeight(0);
          setIsBannerVisible(false);
          setError(getAdMobErrorMessage(detail, "Banner ad failed to load"));
        };

        window.addEventListener("admob-banner-loaded", handleBannerLoaded);
        window.addEventListener("admob-interstitial-loaded", handleInterstitialLoaded);
        window.addEventListener("admob-interstitial-dismissed", handleInterstitialDismissed);
        window.addEventListener("admob-interstitial-failed", handleInterstitialFailed);
        window.addEventListener("admob-banner-failed", handleBannerFailed);
        setIsInitialized(true);
        console.log("AdMob: Initialized successfully");

        return () => {
          window.removeEventListener("admob-banner-loaded", handleBannerLoaded);
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
    
    await queueBannerOperation(async () => {
      try {
        if (globalBannerVisible) {
          try {
            await AdMob.hideBanner();
          } catch {
            // Ignore stale native banner state and continue with a fresh show.
          }

          globalBannerVisible = false;
          globalBannerPosition = null;
          setBannerHeight(0);
          setIsBannerVisible(false);
        }

        await AdMob.showBanner({
          adId: adUnitIds.banner!,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: position === "top" ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
          margin: position === "top" ? 0 : BOTTOM_TABS_HEIGHT,
          isTesting: IS_TESTING,
        });
        globalBannerVisible = true;
        globalBannerPosition = position;
        setIsBannerVisible(true);
        setError(null);
      } catch (err) {
        console.error("AdMob: Failed to show banner", err);
        setError(err instanceof Error ? err.message : "Failed to show banner");
      }
    });
  }, []);

  // Hide banner ad
  const hideBanner = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    await queueBannerOperation(async () => {
      try {
        await AdMob.hideBanner();
        globalBannerVisible = false;
        globalBannerPosition = null;
        setBannerHeight(0);
        setIsBannerVisible(false);
      } catch (err) {
        console.error("AdMob: Failed to hide banner", err);
      }
    });
  }, []);

  const refreshBanner = useCallback(async (position: "top" | "bottom" = "bottom") => {
    if (!Capacitor.isNativePlatform()) return;

    const unitIdError = admobConfig.getUnitIdError("banner");
    if (unitIdError) {
      setError(unitIdError);
      return;
    }

    const adUnitIds = admobConfig.getUnitIds();

    await queueBannerOperation(async () => {
      try {
        try {
          await AdMob.hideBanner();
        } catch {
          // Ignore stale native banner state and force a clean show below.
        }

        globalBannerVisible = false;
        globalBannerPosition = null;
        setBannerHeight(0);
        setIsBannerVisible(false);

        await AdMob.showBanner({
          adId: adUnitIds.banner!,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: position === "top" ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
          margin: position === "top" ? 0 : BOTTOM_TABS_HEIGHT,
          isTesting: IS_TESTING,
        });
        globalBannerVisible = true;
        globalBannerPosition = position;
        setIsBannerVisible(true);
        setError(null);
      } catch (err) {
        console.error("AdMob: Failed to refresh banner", err);
        setError(err instanceof Error ? err.message : "Failed to refresh banner");
      }
    });
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
    refreshBanner,
    loadInterstitial,
    showInterstitial,
    error,
  };
};
