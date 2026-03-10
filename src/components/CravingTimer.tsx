import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, RotateCcw, Wind, Heart, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";
import { toast } from "sonner";

const CRAVING_DURATION = 20 * 60; // 20 minutes in seconds

const breathingExercises = [
  { name: "Box Breathing", pattern: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s", duration: 16 },
  { name: "4-7-8 Technique", pattern: "Inhale 4s → Hold 7s → Exhale 8s", duration: 19 },
  { name: "Deep Belly Breath", pattern: "Inhale 5s → Exhale 5s", duration: 10 },
];

const motivationalMessages = [
  "This craving will pass. You are stronger than it.",
  "Every second you resist, you grow stronger.",
  "Remember why you started this journey.",
  "You've made it this far. Don't give up now.",
  "This feeling is temporary. Your recovery is permanent.",
  "You are rewriting your story right now.",
  "Breathe. You've got this.",
  "The urge to quit quitting is temporary.",
];

export const CravingTimer = () => {
  const { addXP } = useGamification();
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(CRAVING_DURATION);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [messageIndex, setMessageIndex] = useState(0);
  const [cravingSurvived, setCravingSurvived] = useState(false);

  const progress = ((CRAVING_DURATION - timeRemaining) / CRAVING_DURATION) * 100;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !cravingSurvived) {
      setCravingSurvived(true);
      setIsActive(false);
      addXP(XP_REWARDS.trigger_log, 'craving_survived', 'Survived a 20-min craving timer');
      toast.success("You survived the craving! +XP 💪", { duration: 5000 });
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  useEffect(() => {
    if (isActive) {
      const messageInterval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
      }, 15000);

      return () => clearInterval(messageInterval);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
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
    }
  }, [isActive]);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setCravingSurvived(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(CRAVING_DURATION);
    setCravingSurvived(false);
  }, []);

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

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Timer className="w-4 h-4 text-primary" />
          Craving Timer
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">
          Cravings typically pass within 15-20 minutes
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
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-2 justify-center">
                <Button onClick={pauseTimer} variant="outline" size="sm" className="text-xs h-8">
                  <Pause className="w-3.5 h-3.5 mr-1" />
                  Pause
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
              className="text-center py-4"
            >
              <p className="text-xs text-muted-foreground mb-4">
                Feeling a craving? Start the timer and follow the breathing exercises.
              </p>
              <Button onClick={startTimer} size="sm" className="gradient-primary h-9 text-xs">
                <Play className="w-4 h-4 mr-1.5" />
                Start Urge Surfing
              </Button>

              {timeRemaining < CRAVING_DURATION && (
                <Button onClick={resetTimer} variant="ghost" size="sm" className="mt-2 w-full text-xs h-8">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset Timer
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
