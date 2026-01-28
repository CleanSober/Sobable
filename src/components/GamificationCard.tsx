import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, TrendingUp, Zap, ChevronDown, ChevronUp, Star, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGamification, getLevelTitle, XP_REWARDS } from "@/hooks/useGamification";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const GamificationCard = () => {
  const {
    userXP,
    xpHistory,
    xpProgress,
    loading,
    claiming,
    claimDailyReward,
    canClaimDailyReward,
  } = useGamification();
  const [showHistory, setShowHistory] = useState(false);
  const [rewardAnimation, setRewardAnimation] = useState(false);

  const handleClaimReward = async () => {
    setRewardAnimation(true);
    await claimDailyReward();
    setTimeout(() => setRewardAnimation(false), 1000);
  };

  if (loading) {
    return (
      <div className="card-enhanced p-5">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!userXP || !xpProgress) return null;

  const levelTitle = getLevelTitle(userXP.current_level);

  return (
    <div className="card-enhanced overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 blur-[60px] rounded-full pointer-events-none" />
      
      {/* Header with Level & XP */}
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              animate={rewardAnimation ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            >
              <div className="p-3 rounded-2xl gradient-premium shadow-lg shadow-accent/20 icon-glow">
                <Star className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-card">
                {userXP.current_level}
              </div>
            </motion.div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{levelTitle}</h3>
              <p className="text-sm text-muted-foreground">Level {userXP.current_level} Explorer</p>
            </div>
          </div>
          <div className="text-right stat-box rounded-xl">
            <div className="flex items-center gap-1.5 text-accent">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold text-xl">{userXP.total_xp.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Total XP</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress to Level {userXP.current_level + 1}</span>
            <span className="text-foreground font-medium">{xpProgress.progressInLevel} / {xpProgress.xpNeededForLevel} XP</span>
          </div>
          <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress.percentage}%` }}
              transition={{ duration: 0.8 }}
              className="absolute inset-y-0 left-0 gradient-primary rounded-full"
            />
            <div className="absolute inset-0 animate-shimmer rounded-full" />
            <AnimatePresence>
              {rewardAnimation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -25 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-2 top-0 text-accent font-bold text-sm"
                >
                  +XP!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Daily Reward Section */}
      <div className="p-5 border-t border-border/30 glass-card mx-0 rounded-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl transition-all duration-300",
              canClaimDailyReward 
                ? "bg-success/20 animate-glow-pulse" 
                : "bg-muted/50"
            )}>
              <Gift className={cn(
                "w-5 h-5",
                canClaimDailyReward ? "text-success" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="font-semibold text-foreground">Daily Login Reward</p>
              <div className="flex items-center gap-2">
                {userXP.daily_login_streak > 0 && (
                  <span className="flex items-center gap-1 text-xs text-accent">
                    <Flame className="w-3 h-3" />
                    {userXP.daily_login_streak} day streak
                  </span>
                )}
                {userXP.daily_login_streak >= 7 && (
                  <Badge variant="secondary" className="text-xs bg-accent/15 text-accent border-accent/30">
                    Week bonus!
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleClaimReward}
            disabled={!canClaimDailyReward || claiming}
            className={cn(
              "gap-2 font-semibold transition-all duration-300",
              canClaimDailyReward && "bg-gradient-to-r from-success to-primary hover:shadow-lg hover:shadow-success/25 btn-glow"
            )}
          >
            {claiming ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
                Claiming...
              </>
            ) : canClaimDailyReward ? (
              <>
                <Gift className="w-4 h-4" />
                Claim +{XP_REWARDS.daily_login + Math.min(userXP.daily_login_streak * 5, 50)} XP
              </>
            ) : (
              "Claimed ✓"
            )}
          </Button>
        </div>
      </div>

      {/* XP History Collapsible */}
      <Collapsible open={showHistory} onOpenChange={setShowHistory}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full rounded-none border-t border-border/30 py-4 h-auto gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/30"
          >
            <TrendingUp className="w-4 h-4" />
            Recent XP Gains
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-2 max-h-48 overflow-y-auto">
            {xpHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No XP earned yet. Start your journey!
              </p>
            ) : (
              xpHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between py-3 px-3 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">
                      {entry.source.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.description || new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-accent/15 text-accent border-accent/30 font-semibold">
                    +{entry.xp_amount} XP
                  </Badge>
                </motion.div>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
