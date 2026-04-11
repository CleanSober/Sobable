import { useState, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useAmbientMusic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioUnlockedRef = useRef(false);

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

  const generateAndPlay = useCallback(async (type: string, duration: number = 30) => {
    setIsLoading(true);
    try {
      await unlockNativeAudioPlayback();

      // Get the user's session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to use ambient music");
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ambient-music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ type, duration }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate music");
      }

      const data = await response.json();
      
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      const audioUrl = Capacitor.isNativePlatform()
        ? createNativeAudioUrl(data.audioContent)
        : `data:audio/mpeg;base64,${data.audioContent}`;
      audioUrlRef.current = audioUrl;
      
      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = 0.4;
      audio.preload = "auto";
      (audio as any).playsInline = true;
      audioRef.current = audio;

      if (Capacitor.isNativePlatform()) {
        await waitForAudioReady(audio);
      }

      await audio.play();
      setIsPlaying(true);
      
      return audio;
    } catch (error) {
      console.error("Ambient music error:", error);
      toast.error("Couldn't load ambient music. Continuing without music.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [createNativeAudioUrl, unlockNativeAudioPlayback, waitForAudioReady]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

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

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    isLoading,
    isPlaying,
    generateAndPlay,
    play,
    pause,
    stop,
    setVolume,
  };
};
