import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isVoiceoverGloballyEnabled, subscribeAudioPrefs } from "@/lib/audioPreferences";
import { getVoiceSettings } from "@/lib/narratorVoices";
import { emitVoiceEnd, emitVoiceStart } from "@/lib/audioBus";

/**
 * Hook to generate + play sequential ElevenLabs TTS narration on top of
 * ambient music. Preloads an entire script up front so each step plays
 * instantly when its index is requested.
 */
export const useTTSNarration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const urlsRef = useRef<(string | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    urlsRef.current.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    urlsRef.current = [];
    setIsReady(false);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const preload = useCallback(async (texts: string[], voiceId?: string) => {
    cleanup();
    if (!texts.length) return;
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke("tts-narration", {
        body: { texts, voiceId },
      });
      if (error || !data?.audio) {
        console.warn("TTS narration error", error);
        setIsLoading(false);
        return;
      }
      const urls: (string | null)[] = (data.audio as (string | null)[]).map((b64) => {
        if (!b64) return null;
        try {
          const binary = atob(b64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
          return URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
        } catch {
          return null;
        }
      });
      urlsRef.current = urls;
      setIsReady(true);
    } catch (e) {
      console.warn("TTS preload failed", e);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup]);

  const playIndex = useCallback((index: number, volume = 1) => {
    if (!isVoiceoverGloballyEnabled()) return; // global mute from Profile
    const url = urlsRef.current[index];
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const audio = new Audio(url);
    audio.volume = volume;
    audio.muted = mutedRef.current;
    audio.loop = false;
    audioRef.current = audio;
    audio.play().catch(() => undefined);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // If the user globally disables voiceovers from the Profile page, stop
  // any in-flight narration immediately.
  useEffect(() => subscribeAudioPrefs(() => {
    if (!isVoiceoverGloballyEnabled() && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }), []);


  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
    if (audioRef.current) audioRef.current.muted = muted;
    setIsMuted(muted);
  }, []);

  return { preload, playIndex, stop, cleanup, isLoading, isReady, isMuted, setMuted };
};
