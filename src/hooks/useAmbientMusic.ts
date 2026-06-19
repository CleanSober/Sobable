import { useState, useRef, useCallback, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { AdMob, RewardAdPluginEvents } from "@capacitor-community/admob";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { admobConfig } from "@/lib/admobConfig";
import { isMusicGloballyEnabled, subscribeAudioPrefs } from "@/lib/audioPreferences";
import { onVoiceEnd, onVoiceStart } from "@/lib/audioBus";

export const useAmbientMusic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioUnlockedRef = useRef(false);
  const mutedRef = useRef(false);
  // Target volume the user/feature picked. The actual audio.volume tweens
  // toward this value (fade-in, fade-out, duck under voice).
  const baseVolumeRef = useRef(0.4);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDuckedRef = useRef(false);

  const stopFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  // Tween audio.volume from current → target over `durationMs`.
  const tweenVolume = useCallback((target: number, durationMs: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    stopFade();
    const clamped = Math.max(0, Math.min(1, target));
    const start = audio.volume;
    const delta = clamped - start;
    if (Math.abs(delta) < 0.005 || durationMs <= 0) {
      audio.volume = clamped;
      return;
    }
    const stepMs = 40;
    const steps = Math.max(1, Math.round(durationMs / stepMs));
    let i = 0;
    fadeIntervalRef.current = setInterval(() => {
      i += 1;
      const a = audioRef.current;
      if (!a) { stopFade(); return; }
      a.volume = Math.max(0, Math.min(1, start + (delta * i) / steps));
      if (i >= steps) stopFade();
    }, stepMs);
  }, []);

  const createNativeAudioUrl = useCallback((base64Audio: string) => {
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    const blob = new Blob([bytes], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }, []);

  const waitForAudioReady = useCallback((audio: HTMLAudioElement) => {
    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        audio.removeEventListener("canplaythrough", handleReady);
        audio.removeEventListener("loadeddata", handleReady);
        audio.removeEventListener("error", handleError);
      };

      const handleReady = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        reject(audio.error ?? new Error("Audio failed to load"));
      };

      audio.addEventListener("canplaythrough", handleReady, { once: true });
      audio.addEventListener("loadeddata", handleReady, { once: true });
      audio.addEventListener("error", handleError, { once: true });
      audio.load();
    });
  }, []);

  const unlockNativeAudioPlayback = useCallback(async () => {
    if (!Capacitor.isNativePlatform() || audioUnlockedRef.current) {
      return;
    }

    const unlockAudio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
    );

    unlockAudio.volume = 0;
    (unlockAudio as any).playsInline = true;

    try {
      await unlockAudio.play();
      unlockAudio.pause();
      unlockAudio.currentTime = 0;
      audioUnlockedRef.current = true;
    } catch (error) {
      console.warn("Ambient music unlock failed", error);
    }
  }, []);

  const watchRewardedAd = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false;

    const unitIdError = admobConfig.getUnitIdError("rewarded");
    if (unitIdError) {
      console.warn("Rewarded ad unavailable:", unitIdError);
      return false;
    }

    const adUnitIds = admobConfig.getUnitIds();
    if (!adUnitIds.rewarded) return false;

    try {
      await AdMob.prepareRewardVideoAd({
        adId: adUnitIds.rewarded,
        isTesting: import.meta.env.DEV,
      });
    } catch (err) {
      console.warn("Rewarded prepare failed:", err);
      return false;
    }

    return new Promise<boolean>((resolve) => {
      let earned = false;
      let settled = false;
      const finish = (value: boolean) => {
        if (settled) return;
        settled = true;
        rewardedListener.then((l) => l.remove()).catch(() => undefined);
        dismissedListener.then((l) => l.remove()).catch(() => undefined);
        failedListener.then((l) => l.remove()).catch(() => undefined);
        resolve(value);
      };
      const rewardedListener = AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        earned = true;
      });
      const dismissedListener = AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        finish(earned);
      });
      const failedListener = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        finish(false);
      });
      AdMob.showRewardVideoAd().catch((err) => {
        console.warn("Rewarded show failed:", err);
        finish(false);
      });
    });
  }, []);

  const claimAdPass = useCallback(async (source: "rewarded_ad" | "rewarded_ad_web") => {
    const { data, error } = await supabase.functions.invoke("claim-ambient-pass", {
      body: { source },
    });
    if (error) {
      console.warn("claim-ambient-pass error", error);
      return false;
    }
    return Boolean(data?.success);
  }, []);

  const requestMusic = useCallback(
    async (type: string, duration: number, accessToken: string) => {
      return fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ambient-music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ type, duration }),
        },
      );
    },
    [],
  );

  const generateAndPlay = useCallback(async (type: string, duration: number = 30) => {
    if (!isMusicGloballyEnabled()) return null; // global mute from Profile

    // CRITICAL (iOS): Create the audio element and call play() SYNCHRONOUSLY,
    // inside the user gesture that triggered this function. Without this, by
    // the time the edge function fetch resolves the gesture has expired and
    // iOS WKWebView silently rejects play(). We start with a tiny silent
    // source, then swap to the real track once the URL is ready.
    const SILENT_WAV =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

    // Clean up any previous audio first.
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch { /* ignore */ }
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    (audio as any).playsInline = true;
    audio.crossOrigin = "anonymous";
    audio.muted = mutedRef.current;
    baseVolumeRef.current = 0.4;
    audio.volume = 0;
    audio.src = SILENT_WAV;
    audioRef.current = audio;

    // Kick play() synchronously — this is what "unlocks" THIS element on iOS.
    const primingPlay = audio.play().catch((err) => {
      console.warn("Ambient music priming play failed:", err);
    });

    setIsLoading(true);
    try {
      // Get the user's session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to use ambient music");
        try { audio.pause(); } catch { /* ignore */ }
        if (audioRef.current === audio) audioRef.current = null;
        return null;
      }

      let response = await requestMusic(type, duration, session.access_token);
      let payload: any = await response.clone().json().catch(() => ({}));

      const isLocked =
        payload?.code === "PREMIUM_REQUIRED" || payload?.locked === true;

      if (isLocked) {
        if (!Capacitor.isNativePlatform()) {
          try { audio.pause(); } catch { /* ignore */ }
          if (audioRef.current === audio) audioRef.current = null;
          return null;
        }

        toast.info("Watch a short ad to unlock ambient music for 1 hour");
        const earned = await watchRewardedAd();
        if (!earned) {
          toast.error("Ad wasn't completed. Ambient music stays locked.");
          try { audio.pause(); } catch { /* ignore */ }
          if (audioRef.current === audio) audioRef.current = null;
          return null;
        }
        const granted = await claimAdPass("rewarded_ad");
        if (!granted) {
          toast.error("Couldn't activate your unlock. Try again in a moment.");
          try { audio.pause(); } catch { /* ignore */ }
          if (audioRef.current === audio) audioRef.current = null;
          return null;
        }
        toast.success("Unlocked! Loading ambient music…");
        response = await requestMusic(type, duration, session.access_token);
        payload = await response.clone().json().catch(() => ({}));
      }

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to generate music");
      }

      const data = payload;

      // Resolve the real audio URL.
      let audioUrl: string;
      if (data?.trackUrl) {
        audioUrl = data.trackUrl as string;
      } else if (data?.audioContent) {
        audioUrl = Capacitor.isNativePlatform()
          ? createNativeAudioUrl(data.audioContent)
          : `data:audio/mpeg;base64,${data.audioContent}`;
        audioUrlRef.current = audioUrl;
      } else {
        throw new Error("No audio in response");
      }

      // Wait for the priming play to settle so iOS keeps the element unlocked.
      await primingPlay;

      // If the user navigated away while loading, this audio was nulled out.
      if (audioRef.current !== audio) {
        try { audio.pause(); } catch { /* ignore */ }
        return null;
      }

      // Swap to the real track on the SAME element — keeps the iOS unlock.
      audio.src = audioUrl;
      audio.load();
      await audio.play().catch(async (err) => {
        console.warn("Ambient music play after src swap failed, retrying:", err);
        // One retry — sometimes the first play() after src change throws on iOS.
        await new Promise((r) => setTimeout(r, 100));
        await audio.play();
      });

      setIsPlaying(true);
      tweenVolume(isDuckedRef.current ? baseVolumeRef.current * 0.3 : baseVolumeRef.current, 1200);

      return audio;
    } catch (error) {
      console.error("Ambient music error:", error);
      try { audio.pause(); } catch { /* ignore */ }
      if (audioRef.current === audio) audioRef.current = null;
      toast.error("Couldn't load ambient music. Continuing without music.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [claimAdPass, createNativeAudioUrl, requestMusic, tweenVolume, watchRewardedAd]);


  const play = useCallback(() => {
    if (!isMusicGloballyEnabled()) return; // global mute from Profile
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      tweenVolume(isDuckedRef.current ? baseVolumeRef.current * 0.3 : baseVolumeRef.current, 600);
    }
  }, [tweenVolume]);

  // React to global music toggle changes — pause immediately if disabled.
  useEffect(() => subscribeAudioPrefs(() => {
    if (!isMusicGloballyEnabled() && audioRef.current) {
      stopFade();
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }), []);

  // Duck the music while the coach is speaking, restore when they stop.
  useEffect(() => {
    const offStart = onVoiceStart(() => {
      isDuckedRef.current = true;
      if (audioRef.current && !audioRef.current.paused) {
        tweenVolume(baseVolumeRef.current * 0.3, 250);
      }
    });
    const offEnd = onVoiceEnd(() => {
      isDuckedRef.current = false;
      if (audioRef.current && !audioRef.current.paused) {
        tweenVolume(baseVolumeRef.current, 500);
      }
    });
    return () => { offStart(); offEnd(); };
  }, [tweenVolume]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      stopFade();
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Fade out quickly, then halt + release.
    const FADE_MS = 400;
    tweenVolume(0, FADE_MS);
    const handle = audio;
    setTimeout(() => {
      try {
        handle.pause();
        handle.currentTime = 0;
      } catch { /* ignore */ }
      if (audioRef.current === handle) {
        audioRef.current = null;
        setIsPlaying(false);
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    }, FADE_MS + 30);
  }, [tweenVolume]);

  // Stop audio and release blob URL if the consumer unmounts (e.g. user
  // navigates to another page). Without this, audio keeps playing in the
  // background after leaving the screen that started it.
  useEffect(() => {
    return () => {
      stopFade();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const setVolume = useCallback((volume: number) => {
    const v = Math.max(0, Math.min(1, volume));
    baseVolumeRef.current = v;
    if (audioRef.current) {
      tweenVolume(isDuckedRef.current ? v * 0.3 : v, 200);
    }
  }, [tweenVolume]);

  // Synchronous mute toggle — must be called directly from a user gesture.
  // Mutating audio.muted directly is allowed by browsers even mid-playback.
  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    if (audioRef.current) audioRef.current.muted = next;
    setIsMuted(next);
    return next;
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
    if (audioRef.current) audioRef.current.muted = muted;
    setIsMuted(muted);
  }, []);

  return {
    isLoading,
    isPlaying,
    isMuted,
    generateAndPlay,
    play,
    pause,
    stop,
    setVolume,
    toggleMute,
    setMuted,
  };
};
