import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Play, Pause, RotateCcw, Check, X, Music, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAmbientMusic } from "@/hooks/useAmbientMusic";

type BreathingPhase = "inhale" | "hold" | "exhale" | "rest";
type BreathingTechnique = "478" | "box" | "calm" | "energize";

interface Technique {
  id: BreathingTechnique;
  name: string;
  description: string;
  phases: { phase: BreathingPhase; duration: number }[];
  color: string;
  cycles: number;
}

const techniques: Technique[] = [
  {
    id: "478",
    name: "4-7-8 Relaxing",
    description: "Best for anxiety relief",
    color: "from-blue-400 to-indigo-500",
    cycles: 4,
    phases: [
      { phase: "inhale", duration: 4 },
      { phase: "hold", duration: 7 },
      { phase: "exhale", duration: 8 },
    ],
  },
  {
    id: "box",
    name: "Box Breathing",
    description: "Navy SEAL technique",
    color: "from-emerald-400 to-teal-500",
    cycles: 4,
    phases: [
      { phase: "inhale", duration: 4 },
      { phase: "hold", duration: 4 },
      { phase: "exhale", duration: 4 },
      { phase: "rest", duration: 4 },
    ],
  },
  {
    id: "calm",
    name: "Calming Breath",
    description: "Quick calm in 2 minutes",
    color: "from-violet-400 to-purple-500",
    cycles: 6,
    phases: [
      { phase: "inhale", duration: 4 },
      { phase: "exhale", duration: 6 },
    ],
  },
  {
    id: "energize",
    name: "Energizing Breath",
    description: "Wake up naturally",
    color: "from-amber-400 to-orange-500",
    cycles: 5,
    phases: [
      { phase: "inhale", duration: 3 },
      { phase: "hold", duration: 1 },
      { phase: "exhale", duration: 3 },
    ],
  },
];

const phaseLabels: Record<BreathingPhase, string> = {
  inhale: "Breathe In",
  hold: "Hold",
  exhale: "Breathe Out",
  rest: "Rest",
};

export const BreathingExercise = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [completed, setCompleted] = useState(false);
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

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
    
    // Start ambient music
    if (musicEnabled) {
      await generateAndPlay(technique.id, 60);
    }
  };

  useEffect(() => {
    if (!isActive || !selectedTechnique || completed) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhaseIndex = currentPhaseIndex + 1;

          if (nextPhaseIndex >= selectedTechnique.phases.length) {
            // Completed a cycle
            if (currentCycle >= selectedTechnique.cycles) {
              // All cycles done
              setIsActive(false);
              setCompleted(true);
              if ("vibrate" in navigator) {
                navigator.vibrate([100, 50, 100]);
              }
              toast.success("Breathing exercise complete! Great job 🌟");
              return 0;
            }
            // Start next cycle
            setCurrentCycle((c) => c + 1);
            setCurrentPhaseIndex(0);
            return selectedTechnique.phases[0].duration;
          }

          // Move to next phase in same cycle
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

  // Calculate progress for the ring
  const phaseProgress = currentPhase
    ? ((currentPhase.duration - countdown) / currentPhase.duration) * 100
    : 0;

  // Scale animation based on phase
  const getCircleScale = () => {
    if (!currentPhase) return 1;
    const progress = phaseProgress / 100;
    switch (currentPhase.phase) {
      case "inhale":
        return 1 + progress * 0.3;
      case "exhale":
        return 1.3 - progress * 0.3;
      default:
        return currentPhase.phase === "hold" && currentPhaseIndex > 0 ? 1.3 : 1;
    }
  };

  return (
    <Card className="gradient-card border-border/50 overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wind className="w-4 h-4 text-primary" />
          Breathing Exercises
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Calm your mind and body</p>
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
              className="space-y-6"
            >
              {/* Breathing Circle */}
              <div className="relative flex items-center justify-center h-56">
                {/* Background circle */}
                <div className="absolute w-40 h-40 rounded-full bg-secondary/30" />

                {/* Animated breathing circle */}
                <motion.div
                  animate={{ scale: getCircleScale() }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${selectedTechnique.color} shadow-lg flex items-center justify-center`}
                >
                  {/* Progress ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="76"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="76"
                      fill="none"
                      stroke="white"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={476}
                      strokeDashoffset={476 - (phaseProgress / 100) * 476}
                      transition={{ duration: 0.1 }}
                    />
                  </svg>

                  {/* Center content */}
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

                {/* Outer pulse ring */}
                <motion.div
                  animate={{
                    scale: currentPhase?.phase === "inhale" ? [1, 1.1, 1] : 1,
                    opacity: currentPhase?.phase === "inhale" ? [0.3, 0.1, 0.3] : 0.1,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`absolute w-52 h-52 rounded-full border-2 border-current`}
                  style={{ borderColor: "currentColor" }}
                />
              </div>

              {/* Cycle indicator */}
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: totalCycles }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i < currentCycle
                        ? "bg-primary"
                        : "bg-secondary"
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
                    if (isActive) {
                      pauseMusic();
                    } else {
                      playMusic();
                    }
                  }}
                >
                  {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                {/* Music toggle */}
                <Button
                  variant={musicPlaying ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => {
                    if (musicPlaying) {
                      pauseMusic();
                    } else if (musicEnabled) {
                      playMusic();
                    }
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

              {/* Technique info */}
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{selectedTechnique.name}</p>
                <p className="text-xs text-muted-foreground">{selectedTechnique.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
