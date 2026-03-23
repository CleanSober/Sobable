import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { Check, Circle, Heart, BookOpen, Wind, AlertTriangle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GoalStatus {
  mood_logged: boolean;
  journal_written: boolean;
  meditation_done: boolean;
  trigger_logged: boolean;
}

const goals = [
  { key: "mood_logged" as const, label: "Mood", icon: Heart, color: "text-pink-400" },
  { key: "journal_written" as const, label: "Journal", icon: BookOpen, color: "text-amber-400" },
  { key: "meditation_done" as const, label: "Breathe", icon: Wind, color: "text-blue-400" },
  { key: "trigger_logged" as const, label: "Triggers", icon: AlertTriangle, color: "text-orange-400" },
];

export const CheckInProgress = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<GoalStatus>({
    mood_logged: false,
    journal_written: false,
    meditation_done: false,
    trigger_logged: false,
  });

  useEffect(() => {
    if (!user) return;
    fetchGoals();

    const channel = supabase
      .channel(`checkin-progress-${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "daily_goals",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const data = payload.new as any;
        if (data) {
          setStatus({
            mood_logged: data.mood_logged ?? false,
            journal_written: data.journal_written ?? false,
            meditation_done: data.meditation_done ?? false,
            trigger_logged: data.trigger_logged ?? false,
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_goals")
      .select("mood_logged, journal_written, meditation_done, trigger_logged")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (data) {
      setStatus({
        mood_logged: data.mood_logged ?? false,
        journal_written: data.journal_written ?? false,
        meditation_done: data.meditation_done ?? false,
        trigger_logged: data.trigger_logged ?? false,
      });
    }
  };

  const completed = goals.filter((g) => status[g.key]).length;
  const total = goals.length;
  const allDone = completed === total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-enhanced p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {allDone ? (
            <Sparkles className="w-4 h-4 text-accent" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs font-semibold text-foreground">
            {allDone ? "All done! 🎉" : `${completed}/${total} completed`}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">Today's goals</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-secondary/50 mb-2.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${(completed / total) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Goal chips */}
      <div className="flex gap-1.5">
        {goals.map((goal) => {
          const done = status[goal.key];
          const Icon = goal.icon;
          return (
            <div
              key={goal.key}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all ${
                done
                  ? "bg-success/10 border border-success/20"
                  : "bg-secondary/30 border border-border/30"
              }`}
            >
              {done ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Icon className={`w-3.5 h-3.5 ${goal.color} opacity-50`} />
              )}
              <span
                className={`text-[9px] font-medium ${
                  done ? "text-success" : "text-muted-foreground"
                }`}
              >
                {goal.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
