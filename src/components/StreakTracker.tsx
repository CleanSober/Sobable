import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Calendar, Star, Zap, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StreakData {
  type: string;
  current: number;
  longest: number;
  lastActivity: string | null;
}

const streakTypes = [
  { id: "check_in", label: "Daily Check-in", icon: Calendar, color: "text-primary" },
  { id: "meditation", label: "Meditation", icon: Star, color: "text-violet-400" },
  { id: "trigger_log", label: "Trigger Logging", icon: Zap, color: "text-amber-400" },
];

export const StreakTracker = () => {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<Record<string, StreakData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchStreaks();
  }, [user]);

  const fetchStreaks = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_streaks")
      .select("streak_type, current_streak, longest_streak, last_activity_date")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching streaks:", error);
      return;
    }

    const streakMap: Record<string, StreakData> = {};
    data?.forEach(s => {
      streakMap[s.streak_type] = {
        type: s.streak_type,
        current: s.current_streak,
        longest: s.longest_streak,
        lastActivity: s.last_activity_date,
      };
    });

    // Initialize missing streaks
    streakTypes.forEach(st => {
      if (!streakMap[st.id]) {
        streakMap[st.id] = { type: st.id, current: 0, longest: 0, lastActivity: null };
      }
    });

    setStreaks(streakMap);
    setLoading(false);
  };

  const totalCurrentStreak = Object.values(streaks).reduce((sum, s) => sum + s.current, 0);
  const longestEverStreak = Math.max(...Object.values(streaks).map(s => s.longest), 0);

  // Get flame intensity based on total streak
  const getFlameIntensity = () => {
    if (totalCurrentStreak >= 30) return "text-orange-500 animate-pulse";
    if (totalCurrentStreak >= 14) return "text-orange-400";
    if (totalCurrentStreak >= 7) return "text-amber-400";
    if (totalCurrentStreak >= 3) return "text-yellow-400";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="py-8 text-center">
          <Flame className="w-8 h-8 mx-auto animate-pulse text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className={`w-5 h-5 ${getFlameIntensity()}`} />
          Activity Streaks
        </CardTitle>
        <p className="text-sm text-muted-foreground">Consistency builds strength</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flame className={`w-5 h-5 ${getFlameIntensity()}`} />
              <span className="text-2xl font-bold text-foreground">{totalCurrentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Active Streaks</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-violet-400" />
              <span className="text-2xl font-bold text-foreground">{longestEverStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Best Streak Ever</p>
          </motion.div>
        </div>

        {/* Individual Streaks */}
        <div className="space-y-3">
          {streakTypes.map((st, i) => {
            const streak = streaks[st.id] || { current: 0, longest: 0 };
            const Icon = st.icon;
            const isActive = streak.current > 0;

            return (
              <motion.div
                key={st.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? "bg-secondary/70 border-primary/30"
                    : "bg-secondary/30 border-border/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? "bg-primary/10" : "bg-secondary"}`}>
                      <Icon className={`w-4 h-4 ${isActive ? st.color : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{st.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Best: {streak.longest} days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {isActive && <Flame className="w-4 h-4 text-orange-400" />}
                      <span className={`text-xl font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {streak.current}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                </div>

                {/* Progress to next milestone */}
                {isActive && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress to {getNextMilestone(streak.current)} days</span>
                      <span>{Math.round((streak.current / getNextMilestone(streak.current)) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(streak.current / getNextMilestone(streak.current)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Motivation message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <p className="text-sm text-muted-foreground">
            {totalCurrentStreak === 0
              ? "Start building your streaks today! 🌱"
              : totalCurrentStreak >= 7
              ? "You're on fire! Keep the momentum going! 🔥"
              : "Great start! Every day counts! 💪"}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};

function getNextMilestone(current: number): number {
  const milestones = [3, 7, 14, 21, 30, 60, 90, 180, 365];
  return milestones.find(m => m > current) || current + 30;
}
