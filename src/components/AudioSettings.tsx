import { useState, useEffect } from "react";
import { Mic, Music, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { NARRATOR_VOICES } from "@/lib/narratorVoices";
import {
  getDefaultNarratorVoiceId,
  isMusicGloballyEnabled,
  isVoiceoverGloballyEnabled,
  setDefaultNarratorVoiceId,
  setMusicGloballyEnabled,
  setVoiceoverGloballyEnabled,
  subscribeAudioPrefs,
} from "@/lib/audioPreferences";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PREVIEW_LINE = "Hi, I'm your recovery coach. You've got this.";

/**
 * Global audio + voiceover settings. Lives on the Profile page so users can
 * mute the coach narrator and the ambient music app-wide, and pick a default
 * narrator voice that all features fall back to.
 */
export const AudioSettings = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(isVoiceoverGloballyEnabled);
  const [musicEnabled, setMusicEnabled] = useState(isMusicGloballyEnabled);
  const [voiceId, setVoiceId] = useState(getDefaultNarratorVoiceId);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => subscribeAudioPrefs(() => {
    setVoiceEnabled(isVoiceoverGloballyEnabled());
    setMusicEnabled(isMusicGloballyEnabled());
    setVoiceId(getDefaultNarratorVoiceId());
  }), []);

  const handleVoiceToggle = (v: boolean) => {
    setVoiceEnabled(v);
    setVoiceoverGloballyEnabled(v);
  };
  const handleMusicToggle = (v: boolean) => {
    setMusicEnabled(v);
    setMusicGloballyEnabled(v);
  };
  const handleVoiceChange = (newId: string) => {
    setVoiceId(newId);
    setDefaultNarratorVoiceId(newId);
  };

  const previewVoice = async () => {
    if (previewing) return;
    setPreviewing(true);
    try {
      const { data, error } = await supabase.functions.invoke("tts-narration", {
        body: { texts: [PREVIEW_LINE], voiceId },
      });
      const b64 = data?.audio?.[0];
      if (error || !b64) {
        toast.error("Couldn't preview voice right now");
        return;
      }
      const audio = new Audio(`data:audio/mpeg;base64,${b64}`);
      await audio.play();
    } catch {
      toast.error("Couldn't preview voice right now");
    } finally {
      setPreviewing(false);
    }
  };

  const currentVoice = NARRATOR_VOICES.find((v) => v.id === voiceId);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-primary" />
          Audio & Voiceover
        </h3>
        <p className="text-xs text-muted-foreground">
          Controls coach narration and ambient music for breathing, meditations, and the craving timer.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/50 p-3">
        <div className="flex items-start gap-2 min-w-0">
          <Mic className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium">Coach voiceovers</p>
            <p className="text-[11px] text-muted-foreground">
              Spoken motivational lines during sessions.
            </p>
          </div>
        </div>
        <Switch checked={voiceEnabled} onCheckedChange={handleVoiceToggle} aria-label="Toggle coach voiceovers" />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/50 p-3">
        <div className="flex items-start gap-2 min-w-0">
          <Music className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium">Background music</p>
            <p className="text-[11px] text-muted-foreground">
              Calming ambient music during exercises.
            </p>
          </div>
        </div>
        <Switch checked={musicEnabled} onCheckedChange={handleMusicToggle} aria-label="Toggle background music" />
      </div>

      <div className="rounded-lg border border-border/50 bg-card/50 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs font-medium">Default narrator voice</p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Used everywhere unless you pick a different voice inside a specific exercise.
        </p>
        <div className="flex gap-2">
          <Select value={voiceId} onValueChange={handleVoiceChange} disabled={!voiceEnabled}>
            <SelectTrigger className="h-9 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NARRATOR_VOICES.map((v) => (
                <SelectItem key={v.id} value={v.id} className="text-xs">
                  <span className="font-medium">{v.label}</span>
                  <span className="text-muted-foreground ml-1.5">— {v.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={previewVoice}
            disabled={!voiceEnabled || previewing}
            aria-label={`Preview ${currentVoice?.label ?? "voice"}`}
          >
            {previewing ? "Playing…" : "Preview"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;
