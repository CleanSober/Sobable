import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, Circle, Flame, Trophy, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useInterstitialAd } from "./InterstitialAd";

interface DailyGoal {
  id: string;
  label: string;
  icon: React.ElementType;
  field: "mood_logged" | "trigger_logged" | "meditation_done" | "journal_written";
  gradient: string;
}

const goals: DailyGoal[] = [
  { id: "mood", label: "Log your mood", icon: Sparkles, field: "mood_logged", gradient: "from-amber-400 to-orange-500" },
  { id: "trigger", label: "Track a trigger", icon: Target, field: "trigger_logged", gradient: "from-rose-400 to-pink-500" },
  { id: "meditation", label: "Complete meditation", icon: Zap, field: "meditation_done", gradient: "from-violet-400 to-purple-500" },
  { id: "journal", label: "Write in journal", icon: Trophy, field: "journal_written", gradient: "from-emerald-400 to-teal-500" },
];

export const DailyGoals = () => {
  const { user } = useAuth();
  const { showAd } = useInterstitialAd();
  const [completedGoals, setCompletedGoals] = useState<Record<string, boolean>>({
    mood_logged: false,
    trigger_logged: false,
    meditation_done: false,
    journal_written: false,
  });
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchTodayGoals();
    fetchStreak();
  }, [user]);

  const fetchTodayGoals = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    
    const { data } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (data) {
      setCompletedGoals({
        mood_logged: data.mood_logged,
        trigger_logged: data.trigger_logged,
        meditation_done: data.meditation_done,
        journal_written: data.journal_written,
      });
    }
  };

  const fetchStreak = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .eq("streak_type", "check_in")
      .maybeSingle();

    if (data) {
      setStreak(data.current_streak);
    }
  };

  const toggleGoal = async (goal: DailyGoal) => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const newValue = !completedGoals[goal.field];
    
    setCompletedGoals(prev => ({ ...prev, [goal.field]: newValue }));

    const { error } = await supabase
      .from("daily_goals")
      .upsert({
        user_id: user.id,
        date: today,
        [goal.field]: newValue,
      }, {
        onConflict: "user_id,date"
      });

    if (error) {
      setCompletedGoals(prev => ({ ...prev, [goal.field]: !newValue }));
      toast.error("Failed to update goal");
      return;
    }

    if (newValue) {
      toast.success(`${goal.label} completed! 🎉`);
      
      const allCompleted = goals.every(g => 
        g.field === goal.field ? newValue : completedGoals[g.field]
      );
      
      if (allCompleted) {
        setShowConfetti(true);
        updateStreak();
        setTimeout(() => setShowConfetti(false), 3000);
        toast.success("All daily goals completed! Amazing work! 🏆");
        
        // Show interstitial ad after completing all goals (natural break point)
        setTimeout(() => {
          showAd();
        }, 1500);
      }
    }
  };

  const updateStreak = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .eq("streak_type", "check_in")
      .maybeSingle();

    if (existing) {
      const lastDate = existing.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      let newStreak = 1;
      if (lastDate === yesterdayStr) {
        newStreak = existing.current_streak + 1;
      } else if (lastDate === today) {
        return;
      }

      const newLongest = Math.max(newStreak, existing.longest_streak);
      
      await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
        })
        .eq("id", existing.id);
      
      setStreak(newStreak);
    } else {
      await supabase
        .from("user_streaks")
        .insert({
          user_id: user.id,
          streak_type: "check_in",
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
        });
      setStreak(1);
    }
  };

  const completedCount = Object.values(completedGoals).filter(Boolean).length;
  const progress = (completedCount / goals.length) * 100;

  return (
    <div className="card-enhanced overflow-hidden relative">
      {/* Confetti animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: "50%", y: "50%", scale: 0, rotate: 0 }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 1.5, delay: i * 0.05 }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ["hsl(168 84% 45%)", "hsl(42 100% 55%)", "hsl(270 76% 55%)", "hsl(340 82% 52%)", "hsl(190 90% 50%)"][i % 5]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25 icon-glow">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Daily Goals</h3>
              <p className="text-xs text-muted-foreground">{completedCount}/{goals.length} completed</p>
            </div>
          </div>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/25"
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-500">{streak}</span>
            </motion.div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mb-5">
          <div className="relative h-2.5 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 gradient-primary rounded-full"
            />
            <div className="absolute inset-0 animate-shimmer rounded-full" />
          </div>
        </div>

        {/* Goals list */}
        <div className="space-y-2">
          {goals.map((goal, index) => {
            const Icon = goal.icon;
            const isCompleted = completedGoals[goal.field];
            
            return (
              <motion.button
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleGoal(goal)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 ${
                  isCompleted 
                    ? "bg-primary/10 border border-primary/30" 
                    : "bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-border/50"
                }`}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isCompleted 
                      ? "bg-gradient-to-br " + goal.gradient + " shadow-lg" 
                      : "bg-muted/50"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.div>
                <div className="flex-1 text-left">
                  <span className={`font-medium transition-all ${
                    isCompleted 
                      ? "text-primary" 
                      : "text-foreground"
                  }`}>
                    {goal.label}
                  </span>
                </div>
                <div className={`p-1.5 rounded-lg transition-all ${isCompleted ? "bg-primary/20" : "bg-transparent"}`}>
                  <Icon className={`w-4 h-4 transition-colors ${isCompleted ? "text-primary" : "text-muted-foreground"}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
