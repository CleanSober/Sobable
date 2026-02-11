import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Headphones, Play, Pause, RotateCcw, Wind, Heart, Brain, Moon, Music, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAmbientMusic } from "@/hooks/useAmbientMusic";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";
import { toast } from "sonner";

interface Meditation {
  id: string;
  name: string;
  duration: number;
  icon: React.ElementType;
  color: string;
  description: string;
  instructions: string[];
}

const meditations: Meditation[] = [
  {
    id: "breathing",
    name: "Deep Breathing",
    duration: 300,
    icon: Wind,
    color: "from-blue-400 to-cyan-500",
    description: "Calm your nervous system",
    instructions: ["Breathe in through your nose for 4 seconds", "Hold for 4 seconds", "Exhale slowly for 6 seconds", "Repeat"],
  },
  {
    id: "body-scan",
    name: "Body Scan",
    duration: 420,
    icon: Heart,
    color: "from-pink-400 to-rose-500",
    description: "Release tension throughout your body",
    instructions: ["Focus on your feet", "Notice any tension", "Breathe into that area", "Move up through your body"],
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    duration: 600,
    icon: Brain,
    color: "from-purple-400 to-violet-500",
    description: "Present moment awareness",
    instructions: ["Notice your thoughts without judgment", "Let them pass like clouds", "Return focus to your breath", "Stay present"],
  },
  {
    id: "sleep",
    name: "Sleep Relaxation",
    duration: 480,
    icon: Moon,
    color: "from-indigo-400 to-blue-500",
    description: "Prepare for restful sleep",
    instructions: ["Relax your facial muscles", "Let go of the day's worries", "Focus on slow, deep breaths", "Allow yourself to drift"],
  },
];

export const GuidedMeditations = () => {
  const { user } = useAuth();
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    isLoading: musicLoading, 
    isPlaying: musicPlaying, 
    generateAndPlay, 
    pause: pauseMusic, 
    play: playMusic, 
    stop: stopMusic 
  } = useAmbientMusic();

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && activeMeditation && isPlaying) {
      setIsPlaying(false);
      stopMusic();
      completeMeditation();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, timeRemaining, activeMeditation, stopMusic]);

  const { addXP } = useGamification();

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

    // Award XP for meditation
    await addXP(XP_REWARDS.meditation, 'meditation', 'Completed guided meditation');
    
    toast.success("Meditation complete! Great job taking care of yourself 🧘");
  };

  useEffect(() => {
    if (isPlaying && activeMeditation) {
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % activeMeditation.instructions.length);
      }, 8000);
      return () => clearInterval(stepInterval);
    }
  }, [isPlaying, activeMeditation]);

  const startMeditation = async (meditation: Meditation) => {
    setActiveMeditation(meditation);
    setTimeRemaining(meditation.duration);
    setIsPlaying(true);
    setCurrentStep(0);
    
    // Generate and play ambient music for this meditation type
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
    stopMusic();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = activeMeditation ? ((activeMeditation.duration - timeRemaining) / activeMeditation.duration) * 100 : 0;

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Headphones className="w-4 h-4 text-primary" />
          Guided Meditations
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {activeMeditation && isPlaying ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className={`p-4 rounded-xl bg-gradient-to-br ${activeMeditation.color} text-white text-center`}>
              <activeMeditation.icon className="w-8 h-8 mx-auto mb-2" />
              <h3 className="text-base font-bold mb-0.5">{activeMeditation.name}</h3>
              <p className="text-2xl font-mono">{formatTime(timeRemaining)}</p>
            </div>
            <Progress value={progress} className="h-1.5" />
            <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-muted/30 text-center">
              <p className="font-medium text-xs">{activeMeditation.instructions[currentStep]}</p>
            </motion.div>
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
              <Button onClick={handleEnd} variant="ghost" size="sm" className="text-xs h-8">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />End
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {meditations.map((med) => (
              <motion.button key={med.id} whileTap={{ scale: 0.98 }} onClick={() => startMeditation(med)} className={`p-3 rounded-xl bg-gradient-to-br ${med.color} text-white text-left`}>
                <med.icon className="w-4 h-4 mb-1.5" />
                <h4 className="font-semibold text-xs">{med.name}</h4>
                <p className="text-[10px] opacity-80">{Math.floor(med.duration / 60)} min</p>
              </motion.button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
