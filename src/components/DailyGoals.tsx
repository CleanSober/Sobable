import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, Circle, Flame, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DailyGoal {
  id: string;
  label: string;
  icon: React.ElementType;
  field: "mood_logged" | "trigger_logged" | "meditation_done" | "journal_written";
  color: string;
}

const goals: DailyGoal[] = [
  { id: "mood", label: "Log your mood", icon: Sparkles, field: "mood_logged", color: "text-amber-500" },
  { id: "trigger", label: "Track a trigger", icon: Target, field: "trigger_logged", color: "text-rose-500" },
  { id: "meditation", label: "Complete meditation", icon: Flame, field: "meditation_done", color: "text-purple-500" },
  { id: "journal", label: "Write in journal", icon: Trophy, field: "journal_written", color: "text-emerald-500" },
];

export const DailyGoals = () => {
  const { user } = useAuth();
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
      
      // Check if all goals completed
      const allCompleted = goals.every(g => 
        g.field === goal.field ? newValue : completedGoals[g.field]
      );
      
      if (allCompleted) {
        setShowConfetti(true);
        updateStreak();
        setTimeout(() => setShowConfetti(false), 3000);
        toast.success("All daily goals completed! Amazing work! 🏆");
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
        return; // Already updated today
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
    <Card className="gradient-card border-border/50 overflow-hidden relative">
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
                initial={{ 
                  x: "50%", 
                  y: "50%", 
                  scale: 0,
                  rotate: 0 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 1.5, delay: i * 0.05 }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ["#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"][i % 5]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            Daily Goals
          </CardTitle>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20"
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-500">{streak} day streak</span>
            </motion.div>
          )}
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">{completedCount}/{goals.length} completed</span>
            <span className="text-primary font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full gradient-primary rounded-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                onClick={() => toggleGoal(goal)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isCompleted 
                    ? "bg-primary/10 border border-primary/30" 
                    : "bg-secondary/50 border border-transparent hover:border-border"
                }`}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg ${isCompleted ? "bg-primary/20" : "bg-muted"}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.div>
                <div className="flex-1 text-left">
                  <span className={`font-medium ${isCompleted ? "text-primary line-through" : "text-foreground"}`}>
                    {goal.label}
                  </span>
                </div>
                <Icon className={`w-5 h-5 ${isCompleted ? "text-primary" : goal.color}`} />
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
