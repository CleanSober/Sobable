export interface NarratorVoice {
  id: string;
  label: string;
  description: string;
  /**
   * Per-voice ElevenLabs voice_settings overrides. Tuned for warm, intimate
   * coach-style narration on top of ambient music.
   */
  settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
    speed?: number;
  };
}

// Curated ElevenLabs voices that sound natural for guided meditation /
// recovery-coach narration. Each one is tuned individually so the cadence
// matches the voice's character.
export const NARRATOR_VOICES: NarratorVoice[] = [
  {
    id: "XrExE9yKIg1WjnnlVkGX",
    label: "Matilda",
    description: "Warm female — meditation (default)",
    settings: { stability: 0.5, similarity_boost: 0.82, style: 0.35, use_speaker_boost: true, speed: 0.9 },
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    label: "Sarah",
    description: "Calm, clear female",
    settings: { stability: 0.55, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: 0.95 },
  },
  {
    id: "pFZP5JQG7iQjIQuC4Bku",
    label: "Lily",
    description: "Gentle, soothing female",
    settings: { stability: 0.6, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true, speed: 0.9 },
  },
  {
    id: "cgSgspJ2msm6clMCkdW9",
    label: "Jessica",
    description: "Confident, friendly female",
    settings: { stability: 0.5, similarity_boost: 0.82, style: 0.4, use_speaker_boost: true, speed: 0.95 },
  },
  {
    id: "Xb7hH8MSUJpSbSDYk0k2",
    label: "Alice",
    description: "Bright, encouraging female",
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true, speed: 1.0 },
  },
  {
    id: "IKne3meq5aSn9XLyUdCD",
    label: "Charlie",
    description: "Relaxed male",
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: 0.95 },
  },
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    label: "George",
    description: "Warm, mature male",
    settings: { stability: 0.55, similarity_boost: 0.82, style: 0.3, use_speaker_boost: true, speed: 0.9 },
  },
  {
    id: "onwK4e9ZLuTAKqWW03F9",
    label: "Daniel",
    description: "Deep, grounded male",
    settings: { stability: 0.6, similarity_boost: 0.82, style: 0.25, use_speaker_boost: true, speed: 0.9 },
  },
  {
    id: "nPczCjzI2devNBz1zQrb",
    label: "Brian",
    description: "Warm, reassuring male",
    settings: { stability: 0.55, similarity_boost: 0.82, style: 0.3, use_speaker_boost: true, speed: 0.92 },
  },
];

export const DEFAULT_NARRATOR_VOICE_ID = NARRATOR_VOICES[0].id;

export const getVoiceSettings = (voiceId: string) =>
  NARRATOR_VOICES.find((v) => v.id === voiceId)?.settings;
