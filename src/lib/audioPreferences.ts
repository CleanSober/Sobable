// Global audio + voiceover preferences. Lets users toggle coach narration
// and ambient music app-wide (e.g. from the Profile page) and pick a default
// narrator voice that every feature falls back to when no per-feature
// override is set. Backed by localStorage + a custom event so the audio hooks
// can react live without remounting.

import { DEFAULT_NARRATOR_VOICE_ID } from "@/lib/narratorVoices";

const KEY_VOICE = "audio_default_voice";
const KEY_VOICE_ENABLED = "audio_voice_enabled";
const KEY_MUSIC_ENABLED = "audio_music_enabled";

export const AUDIO_PREFS_EVENT = "audio-prefs-changed";

const safeGet = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
};
const safeSet = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
};

export const getDefaultNarratorVoiceId = (): string =>
  safeGet(KEY_VOICE) ?? DEFAULT_NARRATOR_VOICE_ID;

export const isVoiceoverGloballyEnabled = (): boolean =>
  safeGet(KEY_VOICE_ENABLED) !== "false";

export const isMusicGloballyEnabled = (): boolean =>
  safeGet(KEY_MUSIC_ENABLED) !== "false";

const broadcast = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUDIO_PREFS_EVENT));
};

export const setDefaultNarratorVoiceId = (voiceId: string) => {
  safeSet(KEY_VOICE, voiceId);
  broadcast();
};
export const setVoiceoverGloballyEnabled = (enabled: boolean) => {
  safeSet(KEY_VOICE_ENABLED, String(enabled));
  broadcast();
};
export const setMusicGloballyEnabled = (enabled: boolean) => {
  safeSet(KEY_MUSIC_ENABLED, String(enabled));
  broadcast();
};

export const subscribeAudioPrefs = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(AUDIO_PREFS_EVENT, cb);
  return () => window.removeEventListener(AUDIO_PREFS_EVENT, cb);
};
