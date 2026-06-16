export interface NarratorVoice {
  id: string;
  label: string;
  description: string;
}

// Curated ElevenLabs voices that sound natural for guided meditation narration.
export const NARRATOR_VOICES: NarratorVoice[] = [
  { id: "XrExE9yKIg1WjnnlVkGX", label: "Matilda", description: "Warm female (default)" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Sarah", description: "Calm, clear female" },
  { id: "pFZP5JQG7iQjIQuC4Bku", label: "Lily", description: "Gentle, soothing female" },
  { id: "IKne3meq5aSn9XLyUdCD", label: "Charlie", description: "Relaxed male" },
  { id: "JBFqnCBsd6RMkjVDRZzb", label: "George", description: "Warm, mature male" },
  { id: "onwK4e9ZLuTAKqWW03F9", label: "Daniel", description: "Deep, grounded male" },
];

export const DEFAULT_NARRATOR_VOICE_ID = NARRATOR_VOICES[0].id;
