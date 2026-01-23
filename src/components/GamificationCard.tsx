import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, TrendingUp, Zap, ChevronDown, ChevronUp, Star } from "lucide-react";
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
      <Card className="card-enhanced">
        <CardContent className="p-5">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userXP || !xpProgress) return null;

  const levelTitle = getLevelTitle(userXP.current_level);

  return (
    <Card className="card-enhanced overflow-hidden">
      <CardContent className="p-0">
        {/* Header with Level & XP */}
        <div className="p-5 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="relative"
                animate={rewardAnimation ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
              >
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                  {userXP.current_level}
                </div>
              </motion.div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{levelTitle}</h3>
                <p className="text-sm text-muted-foreground">Level {userXP.current_level}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-500">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-lg">{userXP.total_xp.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to Level {userXP.current_level + 1}</span>
              <span>{xpProgress.progressInLevel} / {xpProgress.xpNeededForLevel} XP</span>
            </div>
            <div className="relative">
              <Progress value={xpProgress.percentage} className="h-3" />
              <AnimatePresence>
                {rewardAnimation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -20 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-0 top-0 text-amber-500 font-bold text-sm"
                  >
                    +XP!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Daily Reward Section */}
        <div className="p-5 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl",
                canClaimDailyReward 
                  ? "bg-green-500/20 animate-pulse" 
                  : "bg-muted"
              )}>
                <Gift className={cn(
                  "w-5 h-5",
                  canClaimDailyReward ? "text-green-500" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-medium text-foreground">Daily Login Reward</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {userXP.daily_login_streak > 0 && `🔥 ${userXP.daily_login_streak} day streak`}
                  </span>
                  {userXP.daily_login_streak >= 7 && (
                    <Badge variant="secondary" className="text-xs">Week bonus!</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleClaimReward}
              disabled={!canClaimDailyReward || claiming}
              className={cn(
                "gap-2",
                canClaimDailyReward && "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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
              className="w-full rounded-none border-t border-border/50 py-3 h-auto gap-2"
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
                xpHistory.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {entry.source.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.description || new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                      +{entry.xp_amount} XP
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
