import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Calendar, TrendingUp, Sparkles, Star, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMilestones } from "@/lib/storage";
import { useGamification, getLevelTitle } from "@/hooks/useGamification";

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
    xpProgress,
    loading: xpLoading,
  } = useGamification();
  const [rewardAnimation, setRewardAnimation] = useState(false);

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

      <div className="relative z-10 p-4">
        {/* Top row: Clean date + XP badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/15 border border-primary/20 icon-glow">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">
                Clean Since
              </span>
              <p className="text-foreground font-semibold text-sm">
                {new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* XP Level badge */}
          {!xpLoading && userXP && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5"
            >
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-accent">
                  <Sparkles className="w-3 h-3" />
                  <span className="font-bold text-xs">{userXP.total_xp.toLocaleString()} XP</span>
                </div>
                <p className="text-[9px] text-muted-foreground">Lvl {userXP.current_level} • {levelTitle}</p>
              </div>
              <motion.div
                className="relative"
                animate={rewardAnimation ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
              >
                <div className="p-1.5 rounded-lg gradient-premium shadow-lg shadow-accent/20">
                  <Star className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg border border-card">
                  {userXP.current_level}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Main Counter */}
        <div className="text-center mb-3">
          <motion.div
            key={daysSober}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative inline-block mb-0.5"
          >
            <span className="text-5xl font-bold text-gradient tracking-tight">
              {daysSober}
            </span>
            <Sparkles className="absolute -top-1 -right-3 w-4 h-4 text-accent animate-pulse" />
          </motion.div>
          <p className="text-base text-foreground/80 font-medium tracking-wide">
            {daysSober === 1 ? "Day" : "Days"} Sober
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
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
              className="stat-box text-center group !p-3"
            >
              <span className="text-base opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <p className="text-xl font-bold text-foreground mt-0.5">{item.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* XP Progress Bar */}
        {!xpLoading && userXP && xpProgress && (
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Level {userXP.current_level} → {userXP.current_level + 1}</span>
              <span className="text-foreground font-medium">{xpProgress.progressInLevel} / {xpProgress.xpNeededForLevel} XP</span>
            </div>
            <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
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
