// Tiny in-app event bus so the TTS hook can tell the ambient-music hook
// "voice is speaking — please duck the music" without prop drilling.
// Implemented with window CustomEvent so it survives across hook instances.

export const AUDIO_BUS_VOICE_START = "audio-bus:voice-start";
export const AUDIO_BUS_VOICE_END = "audio-bus:voice-end";

export const emitVoiceStart = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUDIO_BUS_VOICE_START));
};

export const emitVoiceEnd = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUDIO_BUS_VOICE_END));
};

export const onVoiceStart = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(AUDIO_BUS_VOICE_START, cb);
  return () => window.removeEventListener(AUDIO_BUS_VOICE_START, cb);
};

export const onVoiceEnd = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(AUDIO_BUS_VOICE_END, cb);
  return () => window.removeEventListener(AUDIO_BUS_VOICE_END, cb);
};
