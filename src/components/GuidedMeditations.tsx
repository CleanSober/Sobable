import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, Play, Pause, RotateCcw, Wind, Heart, Brain, Moon, Leaf, Eye, Volume2, VolumeX, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAmbientMusic } from "@/hooks/useAmbientMusic";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";
import { toast } from "sonner";

interface MeditationStep {
  instruction: string;
  duration: number; // seconds this step is shown
}

interface Meditation {
  id: string;
  name: string;
  duration: number;
  icon: React.ElementType;
  color: string;
  description: string;
  source: string;
  steps: MeditationStep[];
}

// Research-based meditation practices with detailed step-by-step guidance
const meditations: Meditation[] = [
  {
    id: "body-scan",
    name: "Body Scan",
    duration: 420, // 7 minutes
    icon: Heart,
    color: "from-pink-400 to-rose-500",
    description: "Progressive relaxation from head to toe",
    source: "Based on Jon Kabat-Zinn's MBSR body scan practice",
    steps: [
      { instruction: "Close your eyes. Take 3 deep breaths to settle in.", duration: 15 },
      { instruction: "Bring attention to the top of your head. Notice any sensations — tingling, warmth, or pressure.", duration: 25 },
      { instruction: "Relax your forehead and eyes. Let go of any tension you're holding in your face.", duration: 25 },
      { instruction: "Soften your jaw. Let your tongue rest gently. Relax your cheeks.", duration: 20 },
      { instruction: "Notice your neck and shoulders. With each exhale, let them drop a little lower.", duration: 25 },
      { instruction: "Feel your arms — upper arms, forearms, hands. Let them feel heavy and warm.", duration: 25 },
      { instruction: "Bring awareness to your chest. Feel your heartbeat. Notice the rise and fall of your breath.", duration: 30 },
      { instruction: "Scan your stomach and lower back. Breathe into any tightness you find.", duration: 25 },
      { instruction: "Notice your hips, thighs, and knees. Let them relax into the surface beneath you.", duration: 25 },
      { instruction: "Feel your calves, ankles, and feet. Imagine tension draining out through your toes.", duration: 25 },
      { instruction: "Now feel your whole body as one. You are safe, present, and at peace.", duration: 30 },
      { instruction: "Gently wiggle your fingers and toes. When ready, slowly open your eyes.", duration: 15 },
    ],
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    duration: 600, // 10 minutes
    icon: Brain,
    color: "from-purple-400 to-violet-500",
    description: "Present moment awareness meditation",
    source: "Based on Vipassana and MBSR mindfulness traditions",
    steps: [
      { instruction: "Sit comfortably with your back straight. Gently close your eyes.", duration: 15 },
      { instruction: "Take 3 slow, deep breaths. Then let your breathing return to its natural rhythm.", duration: 20 },
      { instruction: "Focus on the sensation of breath at your nostrils. Feel the cool air in, warm air out.", duration: 40 },
      { instruction: "Your mind will wander — that's completely normal. Simply notice where it went.", duration: 30 },
      { instruction: "Without judgment, gently guide your attention back to your breath. This IS the practice.", duration: 40 },
      { instruction: "Notice sounds around you. Don't label them — just hear them as vibrations in space.", duration: 35 },
      { instruction: "Now notice physical sensations. Temperature, the feeling of your clothes, any areas of comfort.", duration: 35 },
      { instruction: "Observe your thoughts like clouds passing in the sky. They come, they go. You are the sky.", duration: 40 },
      { instruction: "If emotions arise, notice them with curiosity. Where do you feel them in your body?", duration: 35 },
      { instruction: "Return to the breath. Each inhale is a fresh start. Each exhale is a letting go.", duration: 40 },
      { instruction: "Expand your awareness to your whole body breathing. Feel alive and present.", duration: 35 },
      { instruction: "Gently bring awareness back to the room. Notice sounds, temperature. Take a deep breath.", duration: 20 },
      { instruction: "When you're ready, slowly open your eyes. Carry this awareness with you.", duration: 15 },
    ],
  },
  {
    id: "sleep",
    name: "Sleep Relaxation",
    duration: 480, // 8 minutes
    icon: Moon,
    color: "from-indigo-400 to-blue-500",
    description: "Yoga Nidra-inspired sleep preparation",
    source: "Based on Yoga Nidra (yogic sleep) and progressive muscle relaxation",
    steps: [
      { instruction: "Lie down comfortably. Close your eyes. You don't need to do anything — just listen.", duration: 15 },
      { instruction: "Take a long inhale... and a slow exhale. Let the weight of the day leave your body.", duration: 20 },
      { instruction: "Squeeze your face muscles tightly... hold... now release. Feel the difference.", duration: 20 },
      { instruction: "Shrug your shoulders up to your ears... hold... let them drop. Melt into the surface.", duration: 20 },
      { instruction: "Clench your fists tightly... hold... release. Feel warmth flow into your hands.", duration: 20 },
      { instruction: "Tighten your stomach muscles... hold... release. Let your belly be soft.", duration: 20 },
      { instruction: "Squeeze your legs and feet... hold... release. Your whole body is getting heavier.", duration: 20 },
      { instruction: "Imagine a warm golden light at the top of your head. It slowly flows downward.", duration: 30 },
      { instruction: "The light moves through your face, neck, arms... warming and relaxing everything it touches.", duration: 30 },
      { instruction: "It fills your chest and stomach with calm warmth. Your breathing is slow and easy.", duration: 30 },
      { instruction: "The warmth flows through your legs and feet. Your whole body feels heavy and peaceful.", duration: 30 },
      { instruction: "You are safe. You are at rest. There is nothing to do. Let sleep come naturally.", duration: 40 },
      { instruction: "Continue breathing slowly... deeply... letting go with every breath.", duration: 30 },
    ],
  },
  {
    id: "grounding",
    name: "5-4-3-2-1 Grounding",
    duration: 300, // 5 minutes
    icon: Leaf,
    color: "from-emerald-400 to-teal-500",
    description: "Sensory grounding for anxiety & cravings",
    source: "Evidence-based grounding technique used in CBT and trauma therapy",
    steps: [
      { instruction: "Take a deep breath. This exercise will anchor you to the present moment.", duration: 15 },
      { instruction: "LOOK: Name 5 things you can see. Notice colors, shapes, textures around you.", duration: 35 },
      { instruction: "Really look at each thing. The light, the shadows, the details you usually miss.", duration: 25 },
      { instruction: "TOUCH: Notice 4 things you can feel. The chair beneath you, fabric on your skin.", duration: 35 },
      { instruction: "Feel the temperature of the air. The weight of your body. Ground yourself here.", duration: 25 },
      { instruction: "HEAR: Identify 3 sounds. Maybe distant traffic, your breathing, a clock ticking.", duration: 30 },
      { instruction: "Listen without judging. Just notice the soundscape of this moment.", duration: 20 },
      { instruction: "SMELL: Notice 2 things you can smell. Or bring something close and breathe it in.", duration: 25 },
      { instruction: "TASTE: Notice 1 taste in your mouth. The air, a recent drink, or simply your tongue.", duration: 20 },
      { instruction: "Take a deep breath. You are here. You are present. You are safe. This moment is real.", duration: 20 },
    ],
  },
  {
    id: "loving-kindness",
    name: "Loving Kindness",
    duration: 420, // 7 minutes
    icon: Heart,
    color: "from-rose-400 to-pink-500",
    description: "Metta meditation for self-compassion",
    source: "Traditional Metta Bhavana practice — shown to increase empathy and reduce self-criticism",
    steps: [
      { instruction: "Sit comfortably. Close your eyes. Place a hand on your heart if it feels right.", duration: 15 },
      { instruction: "Think of yourself. Silently say: 'May I be happy. May I be healthy. May I be safe.'", duration: 30 },
      { instruction: "Repeat: 'May I live with ease. May I be free from suffering.' Feel warmth toward yourself.", duration: 30 },
      { instruction: "If self-criticism arises, that's okay. Meet it with gentleness and return to the words.", duration: 25 },
      { instruction: "Now picture someone you love. Say: 'May you be happy. May you be healthy. May you be safe.'", duration: 35 },
      { instruction: "Feel your genuine wish for their wellbeing. Let it grow in your chest.", duration: 25 },
      { instruction: "Now extend this to a neutral person — maybe someone you saw today. Wish them the same.", duration: 30 },
      { instruction: "'May you be happy. May you be healthy.' Everyone is fighting their own battles.", duration: 30 },
      { instruction: "Now widen the circle to all beings. 'May all beings be happy. May all beings be free.'", duration: 35 },
      { instruction: "Feel this compassion radiate outward from you like ripples in still water.", duration: 30 },
      { instruction: "Return to yourself. You are worthy of the same kindness you give others.", duration: 20 },
      { instruction: "Take a deep breath. Open your eyes slowly. Carry this warmth into your day.", duration: 15 },
    ],
  },
  {
    id: "urge-surfing",
    name: "Urge Surfing",
    duration: 360, // 6 minutes
    icon: Eye,
    color: "from-amber-400 to-orange-500",
    description: "Ride out cravings mindfully",
    source: "Developed by Dr. Alan Marlatt for addiction recovery — proven in clinical relapse prevention",
    steps: [
      { instruction: "Notice the craving or urge. Don't fight it. We're going to observe it together.", duration: 15 },
      { instruction: "Close your eyes. Take a slow breath. Where do you feel the urge in your body?", duration: 20 },
      { instruction: "Is it in your chest? Stomach? Throat? Describe the sensation to yourself.", duration: 25 },
      { instruction: "Notice: Is it hot or cold? Tight or buzzing? Moving or still? Just observe.", duration: 25 },
      { instruction: "Imagine the urge as an ocean wave. It builds... it peaks... it will pass.", duration: 25 },
      { instruction: "You are the surfer on this wave. You don't need to fight it. Just ride it.", duration: 25 },
      { instruction: "Breathe into the sensation. With each breath, the wave loses a little power.", duration: 30 },
      { instruction: "Notice: has the intensity changed? Urges typically peak and fade within 15-30 minutes.", duration: 25 },
      { instruction: "Remind yourself: 'I have survived every urge I've ever had. This one will pass too.'", duration: 25 },
      { instruction: "The wave is receding. You rode it out. You are stronger than the urge.", duration: 20 },
      { instruction: "Take a deep breath. You chose awareness over reaction. That is real strength.", duration: 20 },
    ],
  },
];

export const GuidedMeditations = () => {
  const { user } = useAuth();
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimeRemaining, setStepTimeRemaining] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { 
    isLoading: musicLoading, 
    isPlaying: musicPlaying, 
    generateAndPlay, 
    pause: pauseMusic, 
    play: playMusic, 
    stop: stopMusic 
  } = useAmbientMusic();

  const { addXP } = useGamification();

  // Main timer: decrements total time and manages step progression
  useEffect(() => {
    if (isPlaying && activeMeditation && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            stopMusic();
            completeMeditation();
            return 0;
          }
          return prev - 1;
        });

        setStepTimeRemaining((prev) => {
          if (prev <= 1) {
            // Advance to next step
            setCurrentStepIndex((stepIdx) => {
              const nextIdx = stepIdx + 1;
              if (nextIdx < activeMeditation.steps.length) {
                setStepTimeRemaining(activeMeditation.steps[nextIdx].duration);
                return nextIdx;
              }
              // Loop back to last step if time remains
              return stepIdx;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, timeRemaining, activeMeditation, stopMusic]);

  const completeMeditation = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    
    await supabase
      .from("daily_goals")
      .upsert({
        user_id: user.id,
        date: today,
        meditation_done: true,
      }, {
        onConflict: "user_id,date"
      });

    await addXP(XP_REWARDS.meditation, 'meditation', 'Completed guided meditation');
    toast.success("Meditation complete! Great job taking care of yourself 🧘");
  };

  const startMeditation = async (meditation: Meditation) => {
    setActiveMeditation(meditation);
    setTimeRemaining(meditation.duration);
    setIsPlaying(true);
    setCurrentStepIndex(0);
    setStepTimeRemaining(meditation.steps[0].duration);
    setShowInfo(false);
    
    await generateAndPlay(meditation.id, 60);
  };

  const handlePauseResume = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  const handleEnd = () => {
    setActiveMeditation(null);
    setIsPlaying(false);
    setCurrentStepIndex(0);
    stopMusic();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = activeMeditation ? ((activeMeditation.duration - timeRemaining) / activeMeditation.duration) * 100 : 0;
  const currentStep = activeMeditation?.steps[currentStepIndex];

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Headphones className="w-4 h-4 text-primary" />
          Guided Meditations
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Research-backed practices for recovery</p>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <AnimatePresence mode="wait">
          {activeMeditation && (isPlaying || timeRemaining > 0) ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className={`p-4 rounded-xl bg-gradient-to-br ${activeMeditation.color} text-white text-center`}>
                <activeMeditation.icon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="text-base font-bold mb-0.5">{activeMeditation.name}</h3>
                <p className="text-2xl font-mono">{formatTime(timeRemaining)}</p>
              </div>
              
              <Progress value={progress} className="h-1.5" />
              
              {/* Step indicator dots */}
              <div className="flex justify-center gap-1 flex-wrap">
                {activeMeditation.steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i < currentStepIndex
                        ? "bg-primary"
                        : i === currentStepIndex
                        ? "bg-accent"
                        : "bg-secondary"
                    }`}
                  />
                ))}
              </div>

              {/* Current instruction */}
              {currentStep && (
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-3 rounded-xl bg-muted/30 text-center min-h-[60px] flex items-center justify-center"
                >
                  <p className="font-medium text-xs leading-relaxed">{currentStep.instruction}</p>
                </motion.div>
              )}

              <div className="flex gap-2 justify-center">
                <Button onClick={handlePauseResume} variant="outline" size="sm" className="text-xs h-8">
                  {isPlaying ? <><Pause className="w-3.5 h-3.5 mr-1" />Pause</> : <><Play className="w-3.5 h-3.5 mr-1" />Resume</>}
                </Button>
                <Button 
                  onClick={() => musicPlaying ? pauseMusic() : playMusic()} 
                  variant={musicPlaying ? "secondary" : "ghost"}
                  disabled={musicLoading}
                  size="sm"
                  className="text-xs h-8"
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
                  onClick={() => setShowInfo(!showInfo)} 
                  variant={showInfo ? "secondary" : "ghost"} 
                  size="sm" 
                  className="text-xs h-8"
                >
                  <Info className="w-3.5 h-3.5" />
                </Button>
                <Button onClick={handleEnd} variant="ghost" size="sm" className="text-xs h-8">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />End
                </Button>
              </div>

              {/* Source info */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                      <p className="text-[10px] text-muted-foreground">{activeMeditation.source}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Step {currentStepIndex + 1} of {activeMeditation.steps.length} • {Math.floor(activeMeditation.duration / 60)} min total
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-2"
            >
              {meditations.map((med) => (
                <motion.button
                  key={med.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startMeditation(med)}
                  className={`p-3 rounded-xl bg-gradient-to-br ${med.color} text-white text-left`}
                >
                  <med.icon className="w-4 h-4 mb-1.5" />
                  <h4 className="font-semibold text-xs">{med.name}</h4>
                  <p className="text-[10px] opacity-80">{Math.floor(med.duration / 60)} min</p>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
