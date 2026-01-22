import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, Zap, Target, Trophy, Clock, CheckCircle2, 
  AlertCircle, Sparkles, ArrowRight, Snowflake, Crown, Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useSmartNotifications } from "@/hooks/useSmartNotifications";
import { PricingPlans } from "@/components/PricingPlans";
import { toast } from "sonner";

interface HabitLoopCardProps {
  onNavigateToCheckIn?: () => void;
}

interface StreakInfo {
  current: number;
  longest: number;
  lastActivity: string | null;
  freezeUsedThisWeek: boolean;
}

export const HabitLoopCard = ({ onNavigateToCheckIn }: HabitLoopCardProps) => {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const { missedActions, streakAtRisk } = useSmartNotifications();
  const [streak, setStreak] = useState<StreakInfo>({
    current: 0,
    longest: 0,
    lastActivity: null,
    freezeUsedThisWeek: false,
  });
  const [canUseFreeze, setCanUseFreeze] = useState(false);
  const [todayComplete, setTodayComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);

  const fetchStreakData = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const [streakData, goalsData] = await Promise.all([
      supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_activity_date, freeze_used_this_week")
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
        freezeUsedThisWeek: streakData.data.freeze_used_this_week || false,
      });
    }

    if (goalsData.data) {
      const allComplete = goalsData.data.mood_logged && 
                          goalsData.data.journal_written && 
                          goalsData.data.meditation_done && 
                          goalsData.data.trigger_logged;
      setTodayComplete(allComplete || false);
    }

    // Check if user can use freeze
    if (isPremium && streakData.data?.current_streak > 0) {
      const { data: freezeCheck } = await supabase.rpc('can_use_streak_freeze', {
        check_user_id: user.id,
        check_streak_type: 'check_in'
      });
      setCanUseFreeze(freezeCheck || false);
    }

    setLoading(false);
  }, [user, isPremium]);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user, fetchStreakData]);

  const handleUseFreeze = async () => {
    if (!user || !canUseFreeze) return;
    
    setFreezeLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('use_streak_freeze', {
        p_user_id: user.id,
        p_streak_type: 'check_in'
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string; error?: string };
      
      if (result.success) {
        toast.success("🧊 Streak Frozen!", {
          description: "Your streak is protected for today. Use wisely - you get one per week!",
        });
        setShowFreezeDialog(false);
        setCanUseFreeze(false);
        setStreak(prev => ({ ...prev, freezeUsedThisWeek: true }));
        await fetchStreakData();
      } else {
        toast.error(result.error || "Could not use freeze");
      }
    } catch (error) {
      console.error("Error using freeze:", error);
      toast.error("Failed to use streak freeze");
    } finally {
      setFreezeLoading(false);
    }
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
    
    if (streakAtRisk && streak.current > 0) {
      return {
        status: 'at-risk',
        message: `${streak.current} day streak at risk!`,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        icon: AlertCircle,
      };
    }

    if (missedActions.length > 0) {
      const hours = new Date().getHours();
      if (hours >= 20 && streak.current > 0) {
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
  const showFreezeOption = streakAtRisk && streak.current > 0 && !todayComplete;

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
    <>
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
            <div className="flex items-center gap-2">
              {/* Freeze indicator */}
              {isPremium && (
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  canUseFreeze 
                    ? 'bg-cyan-500/10 text-cyan-500' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Snowflake className="w-3 h-3" />
                  <span>{canUseFreeze ? '1' : '0'}</span>
                </div>
              )}
              {streak.longest > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  Best: {streak.longest}
                </div>
              )}
            </div>
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
            <span className={`text-sm font-medium ${streakStatus.color} flex-1`}>
              {streakStatus.message}
            </span>
            {/* Show freeze button when streak at risk */}
            {showFreezeOption && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => isPremium ? setShowFreezeDialog(true) : setShowPricingDialog(true)}
                className={`h-7 px-2 ${
                  canUseFreeze 
                    ? 'text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/10' 
                    : 'text-muted-foreground'
                }`}
              >
                <Snowflake className="w-4 h-4 mr-1" />
                {isPremium ? (canUseFreeze ? 'Freeze' : 'Used') : (
                  <Crown className="w-3 h-3 ml-1" />
                )}
              </Button>
            )}
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
              } text-primary-foreground`}
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
      </Card>

      {/* Freeze Confirmation Dialog */}
      <Dialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-cyan-500/10">
                <Snowflake className="w-5 h-5 text-cyan-500" />
              </div>
              Use Streak Freeze?
            </DialogTitle>
            <DialogDescription>
              This will protect your {streak.current}-day streak for today. You can only use one freeze per week.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyan-500" />
                <div>
                  <p className="font-medium">Your streak will be protected</p>
                  <p className="text-sm text-muted-foreground">
                    Missing today won't break your streak
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFreezeDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUseFreeze}
                disabled={freezeLoading || !canUseFreeze}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                {freezeLoading ? (
                  <span className="animate-pulse">Freezing...</span>
                ) : (
                  <>
                    <Snowflake className="w-4 h-4 mr-2" />
                    Use Freeze
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Upsell Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <PricingPlans onClose={() => setShowPricingDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
