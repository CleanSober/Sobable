import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Calendar, TrendingUp, Sparkles, Gift, Zap, ChevronDown, ChevronUp, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { getMilestones } from "@/lib/storage";
import { useGamification, getLevelTitle, XP_REWARDS } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

interface SobrietyCounterProps {
  daysSober: number;
  startDate: string;
}

export const SobrietyCounter = ({ daysSober, startDate }: SobrietyCounterProps) => {
  const { reached, next } = getMilestones(daysSober);
  const weeks = Math.floor(daysSober / 7);
  const months = Math.floor(daysSober / 30);
  const years = Math.floor(daysSober / 365);

  const progressToNext = next
    ? ((daysSober / next.days) * 100).toFixed(0)
    : 100;

  const {
    userXP,
    xpHistory,
    xpProgress,
    loading: xpLoading,
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

  const levelTitle = userXP ? getLevelTitle(userXP.current_level) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card-enhanced relative overflow-hidden"
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/15 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 blur-[60px] rounded-full" />
      </div>

      <div className="relative z-10 p-6">
        {/* Top row: Clean date + XP badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20 icon-glow">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-muted-foreground text-sm font-medium">
                Clean Since
              </span>
              <p className="text-foreground font-semibold">
                {new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* XP Level badge */}
          {!xpLoading && userXP && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end text-accent">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-bold text-sm">{userXP.total_xp.toLocaleString()} XP</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Lvl {userXP.current_level} • {levelTitle}</p>
              </div>
              <motion.div
                className="relative"
                animate={rewardAnimation ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
              >
                <div className="p-2 rounded-xl gradient-premium shadow-lg shadow-accent/20">
                  <Star className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-card">
                  {userXP.current_level}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Main Counter */}
        <div className="text-center mb-6">
          <motion.div
            key={daysSober}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative inline-block mb-2"
          >
            <span className="text-8xl md:text-9xl font-bold text-gradient tracking-tight">
              {daysSober}
            </span>
            <Sparkles className="absolute -top-2 -right-4 w-6 h-6 text-accent animate-pulse" />
          </motion.div>
          <p className="text-xl text-foreground/80 font-medium tracking-wide">
            {daysSober === 1 ? "Day" : "Days"} Clean & Sober
          </p>
        </div>

        {/* Time breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Weeks", value: weeks, icon: "📅" },
            { label: "Months", value: months, icon: "🌙" },
            { label: "Years", value: years, icon: "🏆" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="stat-box text-center group"
            >
              <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* XP Progress Bar */}
        {!xpLoading && userXP && xpProgress && (
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Level {userXP.current_level} → {userXP.current_level + 1}</span>
              <span className="text-foreground font-medium">{xpProgress.progressInLevel} / {xpProgress.xpNeededForLevel} XP</span>
            </div>
            <div className="relative h-2.5 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percentage}%` }}
                transition={{ duration: 0.8 }}
                className="absolute inset-y-0 left-0 gradient-premium rounded-full"
              />
              <div className="absolute inset-0 animate-shimmer rounded-full" />
              <AnimatePresence>
                {rewardAnimation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -20 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-2 top-0 text-accent font-bold text-xs"
                  >
                    +XP!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Next Sobriety Milestone Progress */}
        {next && (
          <div className="glass-card rounded-xl p-4 space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">Next Milestone</span>
              </div>
              <span className="text-primary font-semibold">{next.name}</span>
            </div>
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 gradient-primary rounded-full"
              />
              <div className="absolute inset-0 animate-shimmer rounded-full" />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{progressToNext}% complete</span>
              <span className="text-accent font-medium">{next.days - daysSober} days to go</span>
            </div>
          </div>
        )}

        {/* Daily Reward */}
        {!xpLoading && userXP && (
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  canClaimDailyReward
                    ? "bg-success/20 animate-glow-pulse"
                    : "bg-muted/50"
                )}>
                  <Gift className={cn(
                    "w-4 h-4",
                    canClaimDailyReward ? "text-success" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Daily Reward</p>
                  <div className="flex items-center gap-2">
                    {userXP.daily_login_streak > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-accent">
                        <Flame className="w-3 h-3" />
                        {userXP.daily_login_streak} day streak
                      </span>
                    )}
                    {userXP.daily_login_streak >= 7 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-accent/15 text-accent border-accent/30">
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
                  "gap-1.5 font-semibold text-xs transition-all duration-300",
                  canClaimDailyReward && "bg-gradient-to-r from-success to-primary hover:shadow-lg hover:shadow-success/25 btn-glow"
                )}
              >
                {claiming ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </motion.div>
                    Claiming...
                  </>
                ) : canClaimDailyReward ? (
                  <>
                    <Gift className="w-3.5 h-3.5" />
                    +{XP_REWARDS.daily_login + Math.min(userXP.daily_login_streak * 5, 50)} XP
                  </>
                ) : (
                  "Claimed ✓"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Milestones Achieved */}
        {reached.length > 0 && (
          <div className="mt-5 pt-5 border-t border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Milestones Achieved</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {reached.slice(-4).map((milestone, index) => (
                <motion.span
                  key={milestone}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors"
                >
                  {milestone}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* XP History Collapsible */}
        {!xpLoading && userXP && (
          <Collapsible open={showHistory} onOpenChange={setShowHistory}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4 gap-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Recent XP Gains
                {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
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
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/30"
                    >
                      <div>
                        <p className="text-xs font-medium text-foreground capitalize">
                          {entry.source.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {entry.description || new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-accent/15 text-accent border-accent/30 font-semibold text-[10px]">
                        +{entry.xp_amount} XP
                      </Badge>
                    </motion.div>
                  ))
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Loading state for XP */}
        {xpLoading && (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
