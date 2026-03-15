import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Play, Pause, RotateCcw, Check, X, Music, Volume2, VolumeX, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAmbientMusic } from "@/hooks/useAmbientMusic";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";

type BreathingPhase = "inhale" | "hold" | "exhale" | "rest" | "inhale2";
type BreathingTechnique = "478" | "box" | "physiological-sigh" | "resonant" | "diaphragmatic" | "calm";

interface Technique {
  id: BreathingTechnique;
  name: string;
  description: string;
  source: string;
  phases: { phase: BreathingPhase; duration: number; instruction: string }[];
  color: string;
  cycles: number;
}

// Evidence-based breathing techniques from medical literature
const techniques: Technique[] = [
  {
    id: "478",
    name: "4-7-8 Relaxing",
    description: "Dr. Andrew Weil's anxiety relief technique",
    source: "Developed by Dr. Andrew Weil, based on pranayama yoga breathing",
    color: "from-blue-400 to-indigo-500",
    cycles: 4,
    phases: [
      { phase: "inhale", duration: 4, instruction: "Breathe in quietly through your nose" },
      { phase: "hold", duration: 7, instruction: "Hold your breath gently" },
      { phase: "exhale", duration: 8, instruction: "Exhale completely through your mouth" },
    ],
  },
  {
    id: "box",
    name: "Box Breathing",
    description: "Used by Navy SEALs for focus",
    source: "Used by U.S. Navy SEALs and first responders for stress control",
    color: "from-emerald-400 to-teal-500",
    cycles: 4,
    phases: [
      { phase: "inhale", duration: 4, instruction: "Breathe in slowly through your nose" },
      { phase: "hold", duration: 4, instruction: "Hold — lungs full, stay relaxed" },
      { phase: "exhale", duration: 4, instruction: "Exhale slowly and evenly" },
      { phase: "rest", duration: 4, instruction: "Hold — lungs empty, stay calm" },
    ],
  },
  {
    id: "physiological-sigh",
    name: "Physiological Sigh",
    description: "Stanford-proven instant calm",
    source: "Stanford Medicine research (Huberman Lab, 2023) — fastest known real-time stress reducer",
    color: "from-cyan-400 to-blue-500",
    cycles: 5,
    phases: [
      { phase: "inhale", duration: 3, instruction: "Deep inhale through your nose" },
      { phase: "inhale2", duration: 1, instruction: "Quick second inhale to fully expand lungs" },
      { phase: "exhale", duration: 6, instruction: "Long, slow exhale through your mouth" },
      { phase: "rest", duration: 2, instruction: "Natural pause before the next cycle" },
    ],
  },
  {
    id: "resonant",
    name: "Resonant Breathing",
    description: "Optimal heart rate variability",
    source: "Research shows 5.5 breaths/min maximizes heart rate variability (HRV)",
    color: "from-violet-400 to-purple-500",
    cycles: 6,
    phases: [
      { phase: "inhale", duration: 5, instruction: "Slowly fill your belly, then chest" },
      { phase: "exhale", duration: 6, instruction: "Release slowly and completely" },
    ],
  },
  {
    id: "diaphragmatic",
    name: "Belly Breathing",
    description: "Activate your diaphragm",
    source: "Clinical diaphragmatic breathing — reduces cortisol and lowers blood pressure",
    color: "from-amber-400 to-orange-500",
    cycles: 5,
    phases: [
      { phase: "inhale", duration: 4, instruction: "Breathe into your belly — feel it expand" },
      { phase: "exhale", duration: 6, instruction: "Let your belly gently fall inward" },
    ],
  },
  {
    id: "calm",
    name: "2:1 Calming Breath",
    description: "Exhale twice as long as inhale",
    source: "Extended exhale activates the parasympathetic nervous system (vagus nerve)",
    color: "from-pink-400 to-rose-500",
    cycles: 6,
    phases: [
      { phase: "inhale", duration: 3, instruction: "Breathe in through your nose" },
      { phase: "exhale", duration: 6, instruction: "Slowly exhale — twice the length" },
      { phase: "rest", duration: 1, instruction: "Brief natural pause" },
    ],
  },
];

const phaseLabels: Record<BreathingPhase, string> = {
  inhale: "Breathe In",
  inhale2: "Sip In More",
  hold: "Hold",
  exhale: "Breathe Out",
  rest: "Rest",
};

export const BreathingExercise = () => {
  const { user } = useAuth();
  const { addXP } = useGamification();
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  
  const { isLoading: musicLoading, isPlaying: musicPlaying, generateAndPlay, pause: pauseMusic, play: playMusic, stop: stopMusic } = useAmbientMusic();

  const currentPhase = selectedTechnique?.phases[currentPhaseIndex];
  const totalCycles = selectedTechnique?.cycles || 0;

  const resetExercise = useCallback(() => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setCurrentCycle(1);
    setCountdown(0);
    setCompleted(false);
    stopMusic();
  }, [stopMusic]);

  const startExercise = async (technique: Technique) => {
    setSelectedTechnique(technique);
    setCurrentPhaseIndex(0);
    setCurrentCycle(1);
    setCountdown(technique.phases[0].duration);
    setIsActive(true);
    setCompleted(false);
    setShowInfo(false);

    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
    
    if (musicEnabled) {
      await generateAndPlay(technique.id, 60);
    }
  };

  useEffect(() => {
    if (!isActive || !selectedTechnique || completed) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextPhaseIndex = currentPhaseIndex + 1;

          if (nextPhaseIndex >= selectedTechnique.phases.length) {
            if (currentCycle >= selectedTechnique.cycles) {
              setIsActive(false);
              setCompleted(true);
              if ("vibrate" in navigator) {
                navigator.vibrate([100, 50, 100]);
              }
              if (user) {
                const today = new Date().toISOString().split("T")[0];
                supabase.from("daily_goals").upsert(
                  { user_id: user.id, date: today, meditation_done: true },
                  { onConflict: "user_id,date" }
                );
                addXP(XP_REWARDS.meditation, 'breathing_exercise', 'Completed breathing exercise');
              }
              toast.success("Breathing exercise complete! Great job 🌟");
              return 0;
            }
            setCurrentCycle((c) => c + 1);
            setCurrentPhaseIndex(0);
            return selectedTechnique.phases[0].duration;
          }

          setCurrentPhaseIndex(nextPhaseIndex);
          if ("vibrate" in navigator) {
            navigator.vibrate(30);
          }
          return selectedTechnique.phases[nextPhaseIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, selectedTechnique, currentPhaseIndex, currentCycle, completed]);

  const phaseProgress = currentPhase
    ? ((currentPhase.duration - countdown) / currentPhase.duration) * 100
    : 0;

  const getCircleScale = () => {
    if (!currentPhase) return 1;
    const progress = phaseProgress / 100;
    switch (currentPhase.phase) {
      case "inhale":
      case "inhale2":
        return 1 + progress * 0.3;
      case "exhale":
        return 1.3 - progress * 0.3;
      case "hold":
        return currentPhaseIndex > 0 ? 1.3 : 1;
      default:
        return 1;
    }
  };

  return (
    <Card className="gradient-card border-border/50 overflow-hidden" data-breathing-exercise>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wind className="w-4 h-4 text-primary" />
          Breathing Exercises
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Evidence-based techniques for calm and focus</p>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <AnimatePresence mode="wait">
          {!selectedTechnique || completed ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-2"
            >
              {techniques.map((tech) => (
                <motion.button
                  key={tech.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startExercise(tech)}
                  className={`p-3 rounded-xl bg-gradient-to-br ${tech.color} text-white text-left transition-shadow active:shadow-lg`}
                >
                  <Wind className="w-4 h-4 mb-1.5" />
                  <h4 className="font-semibold text-xs">{tech.name}</h4>
                  <p className="text-[10px] opacity-80 mt-0.5">{tech.description}</p>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              {/* Breathing Circle */}
              <div className="relative flex items-center justify-center h-56">
                <div className="absolute w-40 h-40 rounded-full bg-secondary/30" />

                <motion.div
                  animate={{ scale: getCircleScale() }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${selectedTechnique.color} shadow-lg flex items-center justify-center`}
                >
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="76" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                    <motion.circle
                      cx="80" cy="80" r="76" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={476}
                      strokeDashoffset={476 - (phaseProgress / 100) * 476}
                      transition={{ duration: 0.1 }}
                    />
                  </svg>

                  <div className="text-center text-white z-10">
                    <motion.p
                      key={currentPhase?.phase}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-medium mb-1"
                    >
                      {currentPhase ? phaseLabels[currentPhase.phase] : ""}
                    </motion.p>
                    <p className="text-4xl font-bold">{countdown}</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    scale: currentPhase?.phase === "inhale" || currentPhase?.phase === "inhale2" ? [1, 1.1, 1] : 1,
                    opacity: currentPhase?.phase === "inhale" || currentPhase?.phase === "inhale2" ? [0.3, 0.1, 0.3] : 0.1,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-52 h-52 rounded-full border-2 border-current"
                  style={{ borderColor: "currentColor" }}
                />
              </div>

              {/* Current instruction */}
              {currentPhase && (
                <motion.div
                  key={`${currentPhaseIndex}-${currentCycle}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-xs text-muted-foreground italic">{currentPhase.instruction}</p>
                </motion.div>
              )}

              {/* Cycle indicator */}
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: totalCycles }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i < currentCycle ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  Cycle {currentCycle}/{totalCycles}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsActive(!isActive);
                    if (isActive) pauseMusic();
                    else playMusic();
                  }}
                >
                  {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant={musicPlaying ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => {
                    if (musicPlaying) pauseMusic();
                    else if (musicEnabled) playMusic();
                  }}
                  disabled={musicLoading}
                >
                  {musicLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : musicPlaying ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant={showInfo ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    resetExercise();
                    setSelectedTechnique(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Technique info & source */}
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{selectedTechnique.name}</p>
                <p className="text-xs text-muted-foreground">{selectedTechnique.description}</p>
              </div>

              {/* Source info panel */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-2">
                      <p className="text-[10px] text-muted-foreground">{selectedTechnique.source}</p>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-foreground">Technique pattern:</p>
                        {selectedTechnique.phases.map((p, i) => (
                          <p key={i} className="text-[10px] text-muted-foreground">
                            {i + 1}. {phaseLabels[p.phase]} for {p.duration}s — {p.instruction}
                          </p>
                        ))}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Repeat for {selectedTechnique.cycles} cycles
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
