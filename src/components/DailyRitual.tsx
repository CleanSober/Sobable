import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, CheckCircle2, Circle, Zap, ArrowRight, Trophy,
  Sparkles, Gift, Snowflake, Crown, Shield, Clock, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useGamification, XP_REWARDS, getLevelTitle } from "@/hooks/useGamification";
import { PricingPlans } from "@/components/PricingPlans";
import { toast } from "sonner";

interface DailyRitualProps {
  onNavigateToCheckIn: () => void;
}

interface GoalDef {
  id: string;
  label: string;
  icon: React.ElementType;
  field: "mood_logged" | "trigger_logged" | "meditation_done" | "journal_written";
  xpLabel: string;
}

const GOALS: GoalDef[] = [
  { id: "mood", label: "Log mood", icon: Sparkles, field: "mood_logged", xpLabel: `+${XP_REWARDS.mood_log} XP` },
  { id: "journal", label: "Journal", icon: Target, field: "journal_written", xpLabel: `+${XP_REWARDS.journal} XP` },
  { id: "meditation", label: "Meditate", icon: Zap, field: "meditation_done", xpLabel: `+${XP_REWARDS.meditation} XP` },
  { id: "trigger", label: "Log trigger", icon: Shield, field: "trigger_logged", xpLabel: `+${XP_REWARDS.trigger_log} XP` },
];

export const DailyRitual = memo(({ onNavigateToCheckIn }: DailyRitualProps) => {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const { userXP, claiming, claimDailyReward, canClaimDailyReward } = useGamification();

  const [goals, setGoals] = useState<Record<string, boolean>>({
    mood_logged: false,
    trigger_logged: false,
    meditation_done: false,
    journal_written: false,
  });
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastActivity: null as string | null });
  const [canFreeze, setCanFreeze] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Single batch fetch for all daily ritual data
  const fetchAll = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const [goalsRes, streakRes] = await Promise.all([
      supabase
        .from("daily_goals")
        .select("mood_logged, journal_written, meditation_done, trigger_logged")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle(),
      supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("user_id", user.id)
        .eq("streak_type", "check_in")
        .maybeSingle(),
    ]);

    if (goalsRes.data) {
      setGoals({
        mood_logged: goalsRes.data.mood_logged,
        trigger_logged: goalsRes.data.trigger_logged,
        meditation_done: goalsRes.data.meditation_done,
        journal_written: goalsRes.data.journal_written,
      });
    }

    if (streakRes.data) {
      setStreak({
        current: streakRes.data.current_streak || 0,
        longest: streakRes.data.longest_streak || 0,
        lastActivity: streakRes.data.last_activity_date,
      });
    }

    // Check freeze availability for premium users
    if (isPremium && streakRes.data?.current_streak > 0) {
      const { data: freezeCheck } = await supabase.rpc("can_use_streak_freeze", {
        check_user_id: user.id,
        check_streak_type: "check_in",
      });
      setCanFreeze(freezeCheck || false);
    }

    setLoaded(true);
  }, [user, isPremium]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const completedCount = Object.values(goals).filter(Boolean).length;
  const allDone = completedCount === GOALS.length;
  const progress = (completedCount / GOALS.length) * 100;

  // Streak risk detection
  const isStreakAtRisk = (() => {
    if (streak.current === 0 || allDone) return false;
    const hour = new Date().getHours();
    return hour >= 18; // After 6 PM
  })();

  const isUrgent = (() => {
    if (streak.current === 0 || allDone) return false;
    const hour = new Date().getHours();
    return hour >= 21; // After 9 PM
  })();

  const toggleGoal = async (goal: GoalDef) => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const newValue = !goals[goal.field];

    setGoals((prev) => ({ ...prev, [goal.field]: newValue }));

    const { error } = await supabase
      .from("daily_goals")
      .upsert({ user_id: user.id, date: today, [goal.field]: newValue }, { onConflict: "user_id,date" });

    if (error) {
      setGoals((prev) => ({ ...prev, [goal.field]: !newValue }));
      toast.error("Failed to update");
      return;
    }

    if (newValue) {
      // Check if all goals just completed
      const nowAllDone = GOALS.every((g) =>
        g.field === goal.field ? newValue : goals[g.field]
      );

      if (nowAllDone) {
        setShowConfetti(true);
        updateStreak();
        setTimeout(() => setShowConfetti(false), 2500);
        toast.success("Daily ritual complete! 🔥", { description: "See you tomorrow, champion." });
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
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;
      if (existing.last_activity_date === yesterdayStr) {
        newStreak = existing.current_streak + 1;
      } else if (existing.last_activity_date === today) {
        return;
      }

      await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, existing.longest_streak),
          last_activity_date: today,
        })
        .eq("id", existing.id);

      setStreak((prev) => ({ ...prev, current: newStreak, longest: Math.max(newStreak, prev.longest) }));
    } else {
      await supabase.from("user_streaks").insert({
        user_id: user.id,
        streak_type: "check_in",
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      });
      setStreak({ current: 1, longest: 1, lastActivity: today });
    }
  };

  const handleUseFreeze = async () => {
    if (!user || !canFreeze) return;
    setFreezeLoading(true);
    try {
      const { data, error } = await supabase.rpc("use_streak_freeze", {
        p_user_id: user.id,
        p_streak_type: "check_in",
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (result.success) {
        toast.success("🧊 Streak protected for today!");
        setShowFreezeDialog(false);
        setCanFreeze(false);
        fetchAll();
      } else {
        toast.error(result.error || "Could not freeze");
      }
    } catch {
      toast.error("Failed to use streak freeze");
    } finally {
      setFreezeLoading(false);
    }
  };

  const handleClaimReward = async () => {
    await claimDailyReward();
  };

  // Milestone markers
  const nextMilestone = [7, 14, 21, 30, 60, 90, 180, 365].find((m) => m > streak.current) || streak.current + 30;

  if (!loaded) {
    return (
      <div className="card-enhanced p-8 flex items-center justify-center">
        <Flame className="w-6 h-6 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div
        className={`card-enhanced relative overflow-hidden transition-colors ${
          isUrgent ? "border-destructive/40" : isStreakAtRisk ? "border-warning/40" : allDone ? "border-success/40" : ""
        }`}
      >
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-20">
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: "50%", y: "50%", scale: 0 }}
                  animate={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, scale: [0, 1.2, 0], rotate: Math.random() * 360 }}
                  transition={{ duration: 1.5, delay: i * 0.04 }}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{ background: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(42 100% 55%)", "hsl(340 82% 52%)"][i % 4] }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative p-3 space-y-2.5">
          {/* Row 1: Streak + Daily Reward */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl shadow-lg ${
                  streak.current > 0 ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/25" : "bg-muted"
                }`}
              >
                <Flame className={`w-4 h-4 ${streak.current > 0 ? "text-white" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{streak.current}</span>
                  <span className="text-xs text-muted-foreground font-medium">day streak</span>
                </div>
                {streak.longest > 0 && streak.longest > streak.current && (
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5 text-accent" /> Best: {streak.longest}
                  </p>
                )}
              </div>
            </div>

            {/* Daily Reward Button */}
            {userXP && (
              <Button
                size="sm"
                onClick={handleClaimReward}
                disabled={!canClaimDailyReward || claiming}
                className={`gap-1 font-semibold text-[10px] h-8 px-3 ${
                  canClaimDailyReward
                    ? "bg-gradient-to-r from-success to-primary hover:shadow-lg text-primary-foreground btn-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {claiming ? (
                  <Zap className="w-3 h-3 animate-spin" />
                ) : canClaimDailyReward ? (
                  <>
                    <Gift className="w-3 h-3" />
                    Claim XP
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Claimed
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Risk Warning */}
          {(isStreakAtRisk || isUrgent) && !allDone && streak.current > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium ${
                isUrgent
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-warning/10 border-warning/30 text-warning"
              }`}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">
                {isUrgent ? "Last chance to save your streak!" : `${streak.current}-day streak at risk!`}
              </span>
              {isPremium && canFreeze && (
                <button
                  onClick={() => setShowFreezeDialog(true)}
                  className="flex items-center gap-1 text-cyan-500 hover:text-cyan-400 text-xs font-semibold"
                >
                  <Snowflake className="w-3.5 h-3.5" />
                  Freeze
                </button>
              )}
              {!isPremium && streak.current >= 3 && (
                <button
                  onClick={() => setShowPricingDialog(true)}
                  className="flex items-center gap-1 text-accent text-xs font-semibold"
                >
                  <Crown className="w-3 h-3" />
                  Protect
                </button>
              )}
            </motion.div>
          )}

          {/* Progress Ring + Goals */}
          <div className="space-y-1">
            {/* Circular progress header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Today's Ritual</span>
                <span className="text-[10px] text-muted-foreground">{completedCount}/{GOALS.length}</span>
              </div>
              {allDone && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] font-semibold text-success flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Complete!
                </motion.span>
              )}
            </div>

            {/* Progress bar */}
            <div className="relative h-1.5 bg-muted/40 rounded-full overflow-hidden mb-2.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`absolute inset-y-0 left-0 rounded-full ${allDone ? "bg-success" : "gradient-primary"}`}
              />
            </div>

            {/* Goal items - compact grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const done = goals[goal.field];
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl transition-all duration-200 text-left ${
                      done
                        ? "bg-success/10 border border-success/30"
                        : "bg-secondary/30 border border-border/30 hover:bg-secondary/50 active:scale-[0.98]"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${done ? "text-success" : "text-foreground"}`}>
                        {goal.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{goal.xpLabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          {!allDone ? (
            <Button
              onClick={onNavigateToCheckIn}
              className={`w-full h-10 font-semibold text-xs text-primary-foreground ${
                isUrgent
                  ? "bg-gradient-to-r from-destructive to-orange-500"
                  : isStreakAtRisk
                  ? "bg-gradient-to-r from-warning to-orange-500"
                  : "gradient-primary"
              } btn-glow`}
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              {isUrgent ? "Quick Check-In Now!" : "Start Daily Check-In"}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          ) : (
            <div className="text-center py-1">
              <p className="text-xs text-success font-medium">🔥 All done! See you tomorrow.</p>
              {streak.current > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {nextMilestone - streak.current} days to your {nextMilestone}-day badge
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Freeze Dialog */}
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
              Protects your {streak.current}-day streak. One per week.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowFreezeDialog(false)} className="flex-1 h-11">
              Cancel
            </Button>
            <Button
              onClick={handleUseFreeze}
              disabled={freezeLoading}
              className="flex-1 h-11 bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            >
              {freezeLoading ? "Freezing..." : "Use Freeze"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Upsell */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <PricingPlans onClose={() => setShowPricingDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
});

DailyRitual.displayName = "DailyRitual";
