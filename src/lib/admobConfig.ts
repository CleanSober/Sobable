import { Capacitor } from "@capacitor/core";

const trimEnv = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const enabled = import.meta.env.VITE_ADMOB_ENABLED === "true";

const iosConfig = {
  appId: trimEnv(import.meta.env.VITE_ADMOB_IOS_APP_ID),
  bannerId: trimEnv(import.meta.env.VITE_ADMOB_IOS_BANNER_ID),
  interstitialId: trimEnv(import.meta.env.VITE_ADMOB_IOS_INTERSTITIAL_ID),
};

const androidConfig = {
  appId: trimEnv(import.meta.env.VITE_ADMOB_ANDROID_APP_ID),
  bannerId: trimEnv(import.meta.env.VITE_ADMOB_ANDROID_BANNER_ID),
  interstitialId: trimEnv(import.meta.env.VITE_ADMOB_ANDROID_INTERSTITIAL_ID),
};

const platformConfig = () => {
  return Capacitor.getPlatform() === "ios" ? iosConfig : androidConfig;
};

export const admobConfig = {
  enabled,
  ios: iosConfig,
  android: androidConfig,
  isPlatformEnabled() {
    const config = platformConfig();
    return enabled && Boolean(config.appId);
  },
  getInitializationError() {
    if (!enabled) {
      return "AdMob disabled: set VITE_ADMOB_ENABLED=true after adding native app IDs.";
    }

    const config = platformConfig();
    if (!config.appId) {
      return "AdMob disabled: native app ID missing for this platform.";
    }

    return null;
  },
  getUnitIds() {
    const config = platformConfig();

    return {
      banner: config.bannerId,
      interstitial: config.interstitialId,
    };
  },
  getUnitIdError(type: "banner" | "interstitial") {
    if (!enabled) {
      return "AdMob disabled: set VITE_ADMOB_ENABLED=true after adding ad unit IDs.";
    }

    const config = platformConfig();
    if (!config.appId) {
      return "AdMob disabled: native app ID missing for this platform.";
    }

    if (!config[`${type}Id`]) {
      return `AdMob ${type} disabled: ${type} ad unit ID missing for this platform.`;
    }

    return null;
  },
};
