import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, Zap, Target, Trophy, Clock, CheckCircle2, 
  AlertCircle, Sparkles, ArrowRight, Snowflake, Crown, Shield
} from "lucide-react";
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
        bgClass: 'bg-success/10 border-success/30',
        textClass: 'text-success',
        icon: CheckCircle2,
      };
    }
    
    if (streakAtRisk && streak.current > 0) {
      return {
        status: 'at-risk',
        message: `${streak.current} day streak at risk!`,
        bgClass: 'bg-warning/10 border-warning/30',
        textClass: 'text-warning',
        icon: AlertCircle,
      };
    }

    if (missedActions.length > 0) {
      const hours = new Date().getHours();
      if (hours >= 20 && streak.current > 0) {
        return {
          status: 'urgent',
          message: "Only a few hours left to keep your streak!",
          bgClass: 'bg-destructive/10 border-destructive/30',
          textClass: 'text-destructive',
          icon: Clock,
        };
      }
      return {
        status: 'pending',
        message: "Complete your daily check-in to grow your streak",
        bgClass: 'bg-primary/10 border-primary/30',
        textClass: 'text-primary',
        icon: Target,
      };
    }

    return {
      status: 'pending',
      message: "Start your day with a quick check-in",
      bgClass: 'bg-primary/10 border-primary/30',
      textClass: 'text-primary',
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
      <div className="card-enhanced p-6">
        <div className="h-24 flex items-center justify-center">
          <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`card-enhanced overflow-hidden ${
        streakStatus.status === 'complete' ? 'border-success/40' :
        streakStatus.status === 'at-risk' ? 'border-warning/40' :
        streakStatus.status === 'urgent' ? 'border-destructive/40' : ''
      }`}>
        {/* Ambient glow based on status */}
        {streak.current > 0 && (
          <div className="absolute top-0 left-1/3 w-48 h-48 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
        )}
        
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl shadow-lg ${
                streak.current > 0 
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/30' 
                  : 'bg-muted'
              }`}>
                <Flame className={`w-5 h-5 ${streak.current > 0 ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{streak.current}</span>
                  <span className="text-sm text-muted-foreground font-medium">day streak</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPremium && (
                <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${
                  canUseFreeze 
                    ? 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/25' 
                    : 'bg-muted/50 text-muted-foreground'
                }`}>
                  <Snowflake className="w-3.5 h-3.5" />
                  <span className="font-semibold">{canUseFreeze ? '1' : '0'}</span>
                </div>
              )}
              {streak.longest > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-lg">
                  <Trophy className="w-3.5 h-3.5 text-accent" />
                  <span className="font-medium">Best: {streak.longest}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          <motion.div
            key={streakStatus.status}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 p-3.5 rounded-xl border ${streakStatus.bgClass} mb-4`}
          >
            <StatusIcon className={`w-5 h-5 ${streakStatus.textClass}`} />
            <span className={`text-sm font-medium ${streakStatus.textClass} flex-1`}>
              {streakStatus.message}
            </span>
            {showFreezeOption && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => isPremium ? setShowFreezeDialog(true) : setShowPricingDialog(true)}
                className={`h-8 px-3 ${
                  canUseFreeze 
                    ? 'text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10' 
                    : 'text-muted-foreground'
                }`}
              >
                <Snowflake className="w-4 h-4 mr-1.5" />
                {isPremium ? (canUseFreeze ? 'Freeze' : 'Used') : (
                  <Crown className="w-3 h-3 ml-1" />
                )}
              </Button>
            )}
          </motion.div>

          {/* Progress to Next Milestone */}
          <div className="glass-card rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground font-medium">Next milestone</span>
              <span className="font-semibold text-foreground">{streak.current}/{nextMilestone} days</span>
            </div>
            <Progress value={progressToMilestone} className="h-2.5 mb-2" />
            <p className="text-xs text-muted-foreground">
              {nextMilestone - streak.current} days to earn the {nextMilestone}-day badge 🏆
            </p>
          </div>

          {/* Action Button */}
          {!todayComplete && (
            <Button
              onClick={onNavigateToCheckIn}
              className={`w-full h-12 font-semibold text-sm ${
                streakStatus.status === 'urgent' 
                  ? 'bg-gradient-to-r from-destructive to-orange-500 hover:from-destructive/90 hover:to-orange-600' 
                  : streakStatus.status === 'at-risk'
                  ? 'bg-gradient-to-r from-warning to-orange-500 hover:from-warning/90 hover:to-orange-600'
                  : 'gradient-primary'
              } text-primary-foreground btn-glow`}
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
              className="flex items-center justify-center gap-2 pt-4 mt-4 border-t border-border/30"
            >
              <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="text-purple-500 font-medium">7+ day bonus active</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Freeze Confirmation Dialog */}
      <Dialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
        <DialogContent className="max-w-sm card-enhanced border-cyan-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25">
                <Snowflake className="w-5 h-5 text-cyan-500" />
              </div>
              Use Streak Freeze?
            </DialogTitle>
            <DialogDescription>
              This will protect your {streak.current}-day streak for today. You can only use one freeze per week.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl glass-card border border-cyan-500/20">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyan-500" />
                <div>
                  <p className="font-semibold text-foreground">Your streak will be protected</p>
                  <p className="text-sm text-muted-foreground">
                    Missing today won't break your streak
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFreezeDialog(false)}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUseFreeze}
                disabled={freezeLoading || !canUseFreeze}
                className="flex-1 h-11 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
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
