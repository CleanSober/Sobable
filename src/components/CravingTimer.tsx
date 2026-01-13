import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, RotateCcw, Wind, Heart, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(CRAVING_DURATION);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [messageIndex, setMessageIndex] = useState(0);
  const [cravingSurvived, setCravingSurvived] = useState(false);

  const progress = ((CRAVING_DURATION - timeRemaining) / CRAVING_DURATION) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setCravingSurvived(true);
      setIsActive(false);
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="w-5 h-5 text-primary" />
          Craving Timer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Cravings typically pass within 15-20 minutes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {cravingSurvived ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-green-500 mb-2">You Did It! 🎉</h3>
              <p className="text-muted-foreground mb-6">
                You successfully rode out this craving. You're stronger than you know!
              </p>
              <Button onClick={resetTimer} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Timer
              </Button>
            </motion.div>
          ) : isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Timer Display */}
              <div className="text-center">
                <motion.div
                  className="text-5xl font-bold font-mono"
                  key={timeRemaining}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {formatTime(timeRemaining)}
                </motion.div>
                <p className="text-muted-foreground mt-2">until craving subsides</p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-center text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              </div>

              {/* Breathing Exercise */}
              <motion.div
                className={`p-6 rounded-2xl bg-gradient-to-br ${getBreathColor()} text-white text-center`}
                animate={{ scale: breathPhase === "inhale" ? 1.02 : breathPhase === "exhale" ? 0.98 : 1 }}
                transition={{ duration: 4, ease: "easeInOut" }}
              >
                <Wind className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xl font-semibold">{getBreathInstruction()}</p>
                <p className="text-sm opacity-80 mt-1">
                  {breathingExercises[currentExercise].name}
                </p>
              </motion.div>

              {/* Motivational Message */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center p-4 rounded-xl bg-primary/10"
                >
                  <Heart className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{motivationalMessages[messageIndex]}</p>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex gap-3 justify-center">
                <Button onClick={pauseTimer} variant="outline" size="lg">
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
                <Button onClick={resetTimer} variant="ghost" size="lg">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <p className="text-muted-foreground mb-6">
                Feeling a craving? Start the timer and follow the breathing exercises. 
                Most cravings pass within 20 minutes.
              </p>
              <Button onClick={startTimer} size="lg" className="gradient-primary">
                <Play className="w-5 h-5 mr-2" />
                Start Urge Surfing
              </Button>

              {timeRemaining < CRAVING_DURATION && (
                <Button onClick={resetTimer} variant="ghost" className="mt-3 w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
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
