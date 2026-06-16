import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, RotateCcw, Wind, Heart, Check, Volume2, VolumeX, Loader2, Mic, MicOff, ShieldAlert, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";
import { useAmbientMusic } from "@/hooks/useAmbientMusic";
import { useTTSNarration } from "@/hooks/useTTSNarration";
import { useUserData } from "@/hooks/useUserData";
import { NARRATOR_VOICES, DEFAULT_NARRATOR_VOICE_ID } from "@/lib/narratorVoices";
import { claimExerciseSession, releaseExerciseSession, subscribeExerciseSession } from "@/lib/exerciseSession";
import { toast } from "sonner";

const RELAPSE_PROMPT_THRESHOLD = 30; // seconds remaining when the prevention prompt appears

const COPING_STEPS = [
  "Pause. Name the feeling out loud — \"this is a craving.\"",
  "Take 3 slow belly breaths. In through nose, out through mouth.",
  "Sip cold water or step outside for fresh air.",
  "Text one person who knows you're in recovery.",
  "Remind yourself: \"I don't have to act on this.\"",
];

const CRAVING_DURATION = 20 * 60; // 20 minutes in seconds
const MESSAGE_INTERVAL_MS = 20_000; // 20s between motivational lines (so voice can finish)

const breathingExercises = [
  { name: "Box Breathing", pattern: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s", duration: 16 },
  { name: "4-7-8 Technique", pattern: "Inhale 4s → Hold 7s → Exhale 8s", duration: 19 },
  { name: "Deep Belly Breath", pattern: "Inhale 5s → Exhale 5s", duration: 10 },
];

// Spoken motivational lines. Kept short so they read naturally as voiceover.
// `{name}` and `{days}` are replaced with the user's first name and current
// sober-day count so the coach feels personal, not generic.
const motivationalMessages = [
  "{name}, this craving will pass. You are stronger than it.",
  "Breathe in slowly{nameComma} Breathe out. You are safe right now.",
  "Every second you resist, you grow stronger.",
  "Remember why you started{nameComma} That reason still matters.",
  "You've made it {daysPhrase}. Don't give up on yourself now.",
  "This feeling is temporary. Your recovery is permanent.",
  "You are rewriting your story with every breath{nameComma2}",
  "The wave is rising. Ride it. It will fall again.",
  "You don't have to fight the urge{nameComma} Just watch it pass.",
  "You are not your craving. You are the calm beneath it.",
  "One more minute. You can always do one more minute.",
  "You are choosing the life you actually want{nameComma} Keep choosing.",
];

const personalizeMessages = (firstName: string | null, sobrietyStart: string | null) => {
  const name = (firstName ?? "").trim().split(/\s+/)[0] || "";
  const nameVoc = name ? name : "friend";
  const nameComma = name ? `, ${name}.` : ".";
  const nameComma2 = name ? `, ${name}.` : ".";
  let daysPhrase = "this far";
  if (sobrietyStart) {
    const ms = Date.now() - new Date(sobrietyStart).getTime();
    const days = Math.max(0, Math.floor(ms / 86_400_000));
    if (days >= 1) daysPhrase = `${days} ${days === 1 ? "day" : "days"} already`;
  }
  return motivationalMessages.map((m) =>
    m
      .replace(/\{name\}/g, nameVoc.charAt(0).toUpperCase() + nameVoc.slice(1))
      .replace(/\{nameComma2\}/g, nameComma2)
      .replace(/\{nameComma\}/g, nameComma)
      .replace(/\{daysPhrase\}/g, daysPhrase),
  );
};

const VOICE_KEY = "craving_timer_voice";
const VOICE_ENABLED_KEY = "craving_timer_voice_enabled";

export const CravingTimer = () => {
  const { addXP } = useGamification();
  const { profile } = useUserData();
  const {
    isLoading: musicLoading,
    isPlaying: musicPlaying,
    generateAndPlay,
    pause: pauseMusic,
    play: playMusic,
    stop: stopMusic,
  } = useAmbientMusic();
  const {
    preload: preloadVoice,
    playIndex: playVoice,
    stop: stopVoice,
    cleanup: cleanupVoice,
    isLoading: voiceLoading,
    setMuted: setVoiceMuted,
  } = useTTSNarration();

  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(CRAVING_DURATION);
  const [currentExercise] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [messageIndex, setMessageIndex] = useState(0);
  const [cravingSurvived, setCravingSurvived] = useState(false);

  const [voiceId, setVoiceId] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_NARRATOR_VOICE_ID;
    return localStorage.getItem(VOICE_KEY) ?? DEFAULT_NARRATOR_VOICE_ID;
  });
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(VOICE_ENABLED_KEY) !== "false";
  });

  const isActiveRef = useRef(false);
  const messageIndexRef = useRef(0);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { messageIndexRef.current = messageIndex; }, [messageIndex]);

  // Personalized lines — first name + current sober-day count baked in so
  // the spoken coach feels like it actually knows the user.
  const personalizedMessages = useState(() =>
    personalizeMessages(profile?.display_name ?? null, profile?.sobriety_start_date ?? null),
  )[0];
  const messagesRef = useRef(personalizedMessages);
  useEffect(() => {
    messagesRef.current = personalizeMessages(
      profile?.display_name ?? null,
      profile?.sobriety_start_date ?? null,
    );
  }, [profile?.display_name, profile?.sobriety_start_date]);

  const progress = ((CRAVING_DURATION - timeRemaining) / CRAVING_DURATION) * 100;

  // Countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (timeRemaining === 0 && !cravingSurvived) {
      setCravingSurvived(true);
      setIsActive(false);
      stopMusic();
      stopVoice();
      releaseExerciseSession("craving");
      addXP(XP_REWARDS.trigger_log, "craving_survived", "Survived a 20-min craving timer");
      toast.success("You survived the craving! +XP 💪", { duration: 5000 });
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeRemaining]);

  // Rotate motivational messages and speak each one as it changes
  useEffect(() => {
    if (!isActive) return;
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = (prev + 1) % motivationalMessages.length;
        if (voiceEnabled) playVoice(next, 1);
        return next;
      });
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(messageInterval);
  }, [isActive, voiceEnabled, playVoice]);

  // Breathing phase cycle
  useEffect(() => {
    if (!isActive) return;
    const breathInterval = setInterval(() => {
      setBreathPhase((prev) => {
        switch (prev) {
          case "inhale": return "hold";
          case "hold": return "exhale";
          case "exhale": return "rest";
          case "rest": return "inhale";
        }
      });
    }, 4000);
    return () => clearInterval(breathInterval);
  }, [isActive]);

  // Mutual exclusion with meditation/breathing
  const stopAllRef = useRef<() => void>(() => undefined);
  stopAllRef.current = () => {
    setIsActive(false);
    setTimeRemaining(CRAVING_DURATION);
    setCravingSurvived(false);
    setMessageIndex(0);
    stopMusic();
    stopVoice();
    cleanupVoice();
  };
  useEffect(() => {
    const unsub = subscribeExerciseSession((owner) => {
      if (owner !== "craving") stopAllRef.current();
    });
    // Stop everything and release the lock if the user navigates away.
    return () => {
      unsub();
      stopAllRef.current();
      releaseExerciseSession("craving");
    };
  }, []);

  const startTimer = useCallback(() => {
    claimExerciseSession("craving");
    setIsActive(true);
    setCravingSurvived(false);
    setMessageIndex(0);
    generateAndPlay("urge-surfing", 120).catch(() => undefined);

    if (voiceEnabled) {
      preloadVoice(motivationalMessages, voiceId)
        .then(() => {
          if (isActiveRef.current) playVoice(messageIndexRef.current, 1);
        })
        .catch(() => undefined);
    }
  }, [generateAndPlay, preloadVoice, playVoice, voiceEnabled, voiceId]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
    pauseMusic();
    stopVoice();
  }, [pauseMusic, stopVoice]);

  const resumeTimer = useCallback(() => {
    setIsActive(true);
    playMusic();
    if (voiceEnabled) playVoice(messageIndexRef.current, 1);
  }, [playMusic, playVoice, voiceEnabled]);

  const resetTimer = useCallback(() => {
    releaseExerciseSession("craving");
    setIsActive(false);
    setTimeRemaining(CRAVING_DURATION);
    setCravingSurvived(false);
    setMessageIndex(0);
    stopMusic();
    stopVoice();
    cleanupVoice();
  }, [stopMusic, stopVoice, cleanupVoice]);

  const handleChangeVoice = (newVoiceId: string) => {
    setVoiceId(newVoiceId);
    try { localStorage.setItem(VOICE_KEY, newVoiceId); } catch { /* ignore */ }
    if (!isActiveRef.current || !voiceEnabled) return;
    stopVoice();
    preloadVoice(motivationalMessages, newVoiceId)
      .then(() => {
        if (isActiveRef.current) playVoice(messageIndexRef.current, 1);
      })
      .catch(() => undefined);
  };

  const handleToggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem(VOICE_ENABLED_KEY, String(next)); } catch { /* ignore */ }
      setVoiceMuted(!next);
      if (!next) {
        stopVoice();
      } else if (isActiveRef.current) {
        preloadVoice(motivationalMessages, voiceId)
          .then(() => {
            if (isActiveRef.current) playVoice(messageIndexRef.current, 1);
          })
          .catch(() => undefined);
      }
      return next;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getBreathColor = () => {
    switch (breathPhase) {
      case "inhale": return "from-blue-400 to-cyan-500";
      case "hold": return "from-purple-400 to-pink-500";
      case "exhale": return "from-green-400 to-emerald-500";
      case "rest": return "from-amber-400 to-orange-500";
    }
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case "inhale": return "Breathe In...";
      case "hold": return "Hold...";
      case "exhale": return "Breathe Out...";
      case "rest": return "Rest...";
    }
  };

  const currentVoice = NARRATOR_VOICES.find((v) => v.id === voiceId);

  const voicePickerRow = (
    <div className="flex items-center gap-2">
      <Mic className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <label className="text-[10px] text-muted-foreground shrink-0">Coach voice</label>
      <Select value={voiceId} onValueChange={handleChangeVoice} disabled={voiceLoading}>
        <SelectTrigger className="h-8 text-xs flex-1">
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
    </div>
  );

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Timer className="w-4 h-4 text-primary" />
          Craving Timer
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">
          Cravings typically pass within 15–20 minutes. A motivational coach will guide you.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-3 pb-3" data-craving-timer>
        <AnimatePresence mode="wait">
          {cravingSurvived ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-green-500 mb-1">You Did It! 🎉</h3>
              <p className="text-xs text-muted-foreground mb-4">
                You successfully rode out this craving!
              </p>
              <Button onClick={resetTimer} variant="outline" size="sm" className="text-xs h-8">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Timer
              </Button>
            </motion.div>
          ) : isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="text-center">
                <motion.div
                  className="text-4xl font-bold font-mono"
                  key={timeRemaining}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {formatTime(timeRemaining)}
                </motion.div>
                <p className="text-[10px] text-muted-foreground mt-1">until craving subsides</p>
              </div>

              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-[10px] text-center text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              </div>

              <motion.div
                className={`p-4 rounded-xl bg-gradient-to-br ${getBreathColor()} text-white text-center`}
                animate={{ scale: breathPhase === "inhale" ? 1.02 : breathPhase === "exhale" ? 0.98 : 1 }}
                transition={{ duration: 4, ease: "easeInOut" }}
              >
                <Wind className="w-6 h-6 mx-auto mb-1" />
                <p className="text-base font-semibold">{getBreathInstruction()}</p>
                <p className="text-[10px] opacity-80 mt-0.5">
                  {breathingExercises[currentExercise].name}
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center p-3 rounded-xl bg-primary/10"
                >
                  <Heart className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">{motivationalMessages[messageIndex]}</p>
                  {voiceEnabled && (
                    <p className="text-[9px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                      <Mic className="w-2.5 h-2.5" />
                      Spoken by {currentVoice?.label ?? "Coach"}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {isActive && timeRemaining > 0 && timeRemaining <= RELAPSE_PROMPT_THRESHOLD && (
                  <motion.div
                    key="relapse-prevention"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <p className="text-xs font-semibold text-red-500">
                        Final {timeRemaining}s — Relapse Prevention
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      You're almost through. If the urge is still strong, work these steps and reach out.
                    </p>
                    <ol className="text-[11px] space-y-1 list-decimal list-inside">
                      {COPING_STEPS.map((step) => (
                        <li key={step} className="leading-snug">{step}</li>
                      ))}
                    </ol>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {profile?.sponsor_phone && (
                        <Button asChild size="sm" variant="secondary" className="text-[11px] h-7">
                          <a href={`tel:${profile.sponsor_phone}`}>
                            <Phone className="w-3 h-3 mr-1" /> Sponsor
                          </a>
                        </Button>
                      )}
                      {profile?.emergency_contact && (
                        <Button asChild size="sm" variant="secondary" className="text-[11px] h-7">
                          <a href={`tel:${profile.emergency_contact}`}>
                            <Phone className="w-3 h-3 mr-1" /> Contact
                          </a>
                        </Button>
                      )}
                      <Button asChild size="sm" variant="outline" className="text-[11px] h-7">
                        <a href="tel:1-800-662-4357">
                          <Phone className="w-3 h-3 mr-1" /> SAMHSA Helpline
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="text-[11px] h-7">
                        <a href="sms:741741?body=HOME">
                          <MessageSquare className="w-3 h-3 mr-1" /> Crisis Text
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {voicePickerRow}

              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={pauseTimer} variant="outline" size="sm" className="text-xs h-8">
                  <Pause className="w-3.5 h-3.5 mr-1" />
                  Pause
                </Button>
                <Button
                  onClick={() => (musicPlaying ? pauseMusic() : playMusic())}
                  variant={musicPlaying ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-8"
                  disabled={musicLoading}
                  aria-label={musicPlaying ? "Mute calming music" : "Play calming music"}
                >
                  {musicLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : musicPlaying ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  onClick={handleToggleVoice}
                  variant={voiceEnabled ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-8"
                  disabled={voiceLoading}
                  aria-label={voiceEnabled ? "Mute coach voice" : "Enable coach voice"}
                >
                  {voiceLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : voiceEnabled ? (
                    <Mic className="w-3.5 h-3.5" />
                  ) : (
                    <MicOff className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button onClick={resetTimer} variant="ghost" size="sm" className="text-xs h-8">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 py-2"
            >
              <p className="text-xs text-muted-foreground text-center">
                Feeling a craving? Start the timer. A motivational coach will breathe with you and remind you why you're doing this.
              </p>

              {voicePickerRow}

              <div className="text-center">
                {timeRemaining < CRAVING_DURATION ? (
                  <Button onClick={resumeTimer} size="sm" className="gradient-primary h-9 text-xs">
                    <Play className="w-4 h-4 mr-1.5" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={startTimer} size="sm" className="gradient-primary h-9 text-xs">
                    <Play className="w-4 h-4 mr-1.5" />
                    Start Urge Surfing
                  </Button>
                )}

                {timeRemaining < CRAVING_DURATION && (
                  <Button onClick={resetTimer} variant="ghost" size="sm" className="mt-2 w-full text-xs h-8">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Reset Timer
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
