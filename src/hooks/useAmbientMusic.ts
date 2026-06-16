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
    setIsLoading(true);
    try {
      await unlockNativeAudioPlayback();

      // Get the user's session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to use ambient music");
        return null;
      }

      let response = await requestMusic(type, duration, session.access_token);
      let payload: any = await response.clone().json().catch(() => ({}));

      // Locked: edge function returns 200 with { locked: true, code: "PREMIUM_REQUIRED" }
      // (legacy 403 also handled defensively)
      const isLocked =
        payload?.code === "PREMIUM_REQUIRED" || payload?.locked === true;

      if (isLocked) {
        if (!Capacitor.isNativePlatform()) {
          // Silent on web: ambient music is a Sober Club perk; exercise still runs without audio.
          return null;
        }

        toast.info("Watch a short ad to unlock ambient music for 1 hour");
        const earned = await watchRewardedAd();
        if (!earned) {
          toast.error("Ad wasn't completed. Ambient music stays locked.");
          return null;
        }
        const granted = await claimAdPass("rewarded_ad");
        if (!granted) {
          toast.error("Couldn't activate your unlock. Try again in a moment.");
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

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      // Edge function returns one of:
      //  • { audioContent: base64 }  — fresh ElevenLabs generation
      //  • { trackUrl: signedUrl, fallback: true } — curated royalty-free
      //    track from the private `ambient-music` storage bucket.
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

      const audio = new Audio(audioUrl);
      audio.loop = true;
      baseVolumeRef.current = 0.4;
      audio.volume = 0; // fade in from silence
      audio.muted = mutedRef.current;
      audio.preload = "auto";
      (audio as any).playsInline = true;
      audioRef.current = audio;

      if (Capacitor.isNativePlatform()) {
        await waitForAudioReady(audio);
      }

      await audio.play();
      setIsPlaying(true);
      // Smooth fade-in so the track doesn't slam in at full volume.
      tweenVolume(isDuckedRef.current ? baseVolumeRef.current * 0.3 : baseVolumeRef.current, 1200);

      return audio;
    } catch (error) {
      console.error("Ambient music error:", error);
      toast.error("Couldn't load ambient music. Continuing without music.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [claimAdPass, createNativeAudioUrl, requestMusic, unlockNativeAudioPlayback, waitForAudioReady, watchRewardedAd]);

  const play = useCallback(() => {
    if (!isMusicGloballyEnabled()) return; // global mute from Profile
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  // React to global music toggle changes — pause immediately if disabled.
  useEffect(() => subscribeAudioPrefs(() => {
    if (!isMusicGloballyEnabled() && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }), []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  // Stop audio and release blob URL if the consumer unmounts (e.g. user
  // navigates to another page). Without this, audio keeps playing in the
  // background after leaving the screen that started it.
  useEffect(() => {
    return () => {
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
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

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
