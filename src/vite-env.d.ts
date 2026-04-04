/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMOB_ENABLED?: string;
  readonly VITE_ADMOB_IOS_APP_ID?: string;
  readonly VITE_ADMOB_ANDROID_APP_ID?: string;
  readonly VITE_ADMOB_IOS_BANNER_ID?: string;
  readonly VITE_ADMOB_ANDROID_BANNER_ID?: string;
  readonly VITE_ADMOB_IOS_INTERSTITIAL_ID?: string;
  readonly VITE_ADMOB_ANDROID_INTERSTITIAL_ID?: string;
  readonly VITE_ADMOB_IOS_TRACKING_DESCRIPTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
