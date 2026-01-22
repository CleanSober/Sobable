import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, Zap, Target, Trophy, Clock, CheckCircle2, 
  AlertCircle, Sparkles, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartNotifications } from "@/hooks/useSmartNotifications";

interface HabitLoopCardProps {
  onNavigateToCheckIn?: () => void;
}

interface StreakInfo {
  current: number;
  longest: number;
  lastActivity: string | null;
  freezesAvailable: number;
}

export const HabitLoopCard = ({ onNavigateToCheckIn }: HabitLoopCardProps) => {
  const { user } = useAuth();
  const { missedActions, streakAtRisk, checkMissedActions } = useSmartNotifications();
  const [streak, setStreak] = useState<StreakInfo>({
    current: 0,
    longest: 0,
    lastActivity: null,
    freezesAvailable: 0,
  });
  const [todayComplete, setTodayComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchStreakData();
  }, [user]);

  const fetchStreakData = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const [streakData, goalsData] = await Promise.all([
      supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("user_id", user.id)
        .eq("streak_type", "check_in")
        .maybeSingle(),
      supabase
        .from("daily_goals")
        .select("mood_logged, journal_written, meditation_done, trigger_logged")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle(),
    ]);

    if (streakData.data) {
      setStreak({
        current: streakData.data.current_streak || 0,
        longest: streakData.data.longest_streak || 0,
        lastActivity: streakData.data.last_activity_date,
        freezesAvailable: 1, // Could be stored in DB for premium users
      });
    }

    if (goalsData.data) {
      const allComplete = goalsData.data.mood_logged && 
                          goalsData.data.journal_written && 
                          goalsData.data.meditation_done && 
                          goalsData.data.trigger_logged;
      setTodayComplete(allComplete || false);
    }

    setLoading(false);
  };

  const getStreakStatus = () => {
    if (todayComplete) {
      return {
        status: 'complete',
        message: "You're on fire! See you tomorrow 🔥",
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        icon: CheckCircle2,
      };
    }
    
    if (streakAtRisk) {
      return {
        status: 'at-risk',
        message: `${streak.current} day streak at risk! Check in now`,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        icon: AlertCircle,
      };
    }

    if (missedActions.length > 0) {
      const hours = new Date().getHours();
      if (hours >= 20) {
        return {
          status: 'urgent',
          message: "Only a few hours left to keep your streak!",
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          icon: Clock,
        };
      }
      return {
        status: 'pending',
        message: "Complete your daily check-in to grow your streak",
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        icon: Target,
      };
    }

    return {
      status: 'pending',
      message: "Start your day with a quick check-in",
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      icon: Sparkles,
    };
  };

  const getNextMilestone = (current: number): number => {
    const milestones = [7, 14, 21, 30, 60, 90, 180, 365];
    return milestones.find(m => m > current) || current + 30;
  };

  const streakStatus = getStreakStatus();
  const StatusIcon = streakStatus.icon;
  const nextMilestone = getNextMilestone(streak.current);
  const progressToMilestone = (streak.current / nextMilestone) * 100;

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="h-24 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`gradient-card border-border/50 overflow-hidden ${
      streakStatus.status === 'complete' ? 'border-green-500/30' :
      streakStatus.status === 'at-risk' ? 'border-amber-500/30' :
      streakStatus.status === 'urgent' ? 'border-red-500/30' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className={`p-2 rounded-xl ${streak.current > 0 ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-muted'}`}>
              <Flame className={`w-5 h-5 ${streak.current > 0 ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <span className="text-2xl font-bold">{streak.current}</span>
              <span className="text-sm text-muted-foreground ml-1">day streak</span>
            </div>
          </CardTitle>
          {streak.longest > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="w-3 h-3 text-amber-500" />
              Best: {streak.longest}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Message */}
        <motion.div
          key={streakStatus.status}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-xl ${streakStatus.bgColor}`}
        >
          <StatusIcon className={`w-5 h-5 ${streakStatus.color}`} />
          <span className={`text-sm font-medium ${streakStatus.color}`}>
            {streakStatus.message}
          </span>
        </motion.div>

        {/* Progress to Next Milestone */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Next milestone</span>
            <span className="font-medium">{streak.current}/{nextMilestone} days</span>
          </div>
          <Progress value={progressToMilestone} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {nextMilestone - streak.current} days to earn the {nextMilestone}-day badge 🏆
          </p>
        </div>

        {/* Action Button */}
        {!todayComplete && (
          <Button
            onClick={onNavigateToCheckIn}
            className={`w-full ${
              streakStatus.status === 'urgent' 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                : streakStatus.status === 'at-risk'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                : 'gradient-primary'
            } text-white`}
          >
            <Zap className="w-4 h-4 mr-2" />
            {streakStatus.status === 'urgent' ? 'Quick Check-In Now!' : 'Start Daily Check-In'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {/* Streak Perks */}
        {streak.current >= 7 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3 pt-2 border-t border-border/50"
          >
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>7+ day bonus active</span>
            </div>
          </motion.div>
        )}
      </CardContent>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center bg-background/80"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <Flame className="w-16 h-16 text-orange-500 mx-auto mb-2" />
              <p className="text-xl font-bold">Streak Extended!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
