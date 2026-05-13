import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Calendar, TrendingUp, Sparkles, Star, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMilestones } from "@/lib/storage";
import { useGamification, getLevelTitle } from "@/hooks/useGamification";
import { getPersonalizedWording } from "@/lib/substanceConfig";

interface SobrietyCounterProps {
  daysSober: number;
  startDate: string;
  substances?: string[] | null;
}

export const SobrietyCounter = memo(({ daysSober, startDate, substances }: SobrietyCounterProps) => {
  const wording = getPersonalizedWording(substances);
  const { reached, next } = getMilestones(daysSober);
  const [exactMode, setExactMode] = useState(false);

  // Approximate breakdown (fixed 365/30 day buckets)
  const approxYears = Math.floor(daysSober / 365);
  const approxRemAfterYears = daysSober - approxYears * 365;
  const approxMonths = Math.floor(approxRemAfterYears / 30);
  const approxDays = approxRemAfterYears - approxMonths * 30;

  // Exact calendar breakdown using actual start date
  const computeExact = () => {
    const start = new Date(startDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
      // days in previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
  };

  const { years, months, days } = exactMode
    ? computeExact()
    : { years: approxYears, months: approxMonths, days: approxDays };

  const breakdown = [
    { label: days === 1 ? "Day" : "Days", value: days, icon: "✨" },
    { label: months === 1 ? "Month" : "Months", value: months, icon: "🌙" },
    { label: years === 1 ? "Year" : "Years", value: years, icon: "🏆" },
  ];

  // Personalized, pluralized summary line with milestone-specific wording
  const pluralize = (n: number, s: string) => `${n} ${s}${n === 1 ? "" : "s"}`;
  const buildSummary = () => {
    const milestoneCopy: Record<number, string> = {
      0: "Day one — the bravest step. 🌱",
      1: "First full day in the books. ✨",
      7: "One week strong. A new rhythm begins. 🌊",
      14: "Two weeks — momentum is real. 💪",
      30: "One month milestone unlocked! 🏅",
      60: "Two months of steady progress. 🌟",
      90: "Ninety days — a true turning point. 🔥",
      180: "Half a year of showing up. 🌅",
      365: "One full year. Extraordinary. 🏆",
      730: "Two years — a life rebuilt. 👑",
      1095: "Three years of unwavering strength. 💎",
      1825: "Five years. A living testament. 🌈",
      3650: "A decade of freedom. Legendary. 🕊️",
    };
    if (milestoneCopy[daysSober]) return milestoneCopy[daysSober];

    const parts: string[] = [];
    if (years > 0) parts.push(pluralize(years, "year"));
    if (months > 0) parts.push(pluralize(months, "month"));
    if (days > 0 || parts.length === 0) parts.push(pluralize(days, "day"));

    const formatted =
      parts.length === 1
        ? parts[0]
        : parts.length === 2
        ? `${parts[0]} and ${parts[1]}`
        : `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;

    return `That's ${formatted} ${wording.sinceLabel.toLowerCase()}. Keep going. 💚`;
  };
  const summaryText = buildSummary();

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/15 blur-[60px] rounded-full" />
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
                {wording.sinceLabel}
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

        {/* Main Counter with circular progress ring to next milestone */}
        <div className="flex flex-col items-center mb-3">
          {(() => {
            const size = 168;
            const stroke = 10;
            const radius = (size - stroke) / 2;
            const circumference = 2 * Math.PI * radius;
            const milestoneStops = [0, 1, 7, 30, 60, 90, 180, 365, 730, 1095, 1825, 3650];
            const prevMilestone = next
              ? milestoneStops.filter((d) => d < next.days && d <= daysSober).pop() ?? 0
              : 0;
            const span = next ? Math.max(1, next.days - prevMilestone) : 1;
            const into = Math.min(span, Math.max(0, daysSober - prevMilestone));
            const ringPct = next ? into / span : 1;
            const dashOffset = circumference * (1 - ringPct);
            return (
              <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                  <defs>
                    <linearGradient id="sobrietyRing" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeOpacity={0.35}
                    strokeWidth={stroke}
                  />
                  <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#sobrietyRing)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <motion.span
                    key={daysSober}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="text-5xl font-bold text-gradient tracking-tight leading-none"
                  >
                    {daysSober}
                  </motion.span>
                  <span className="text-xs text-foreground/80 font-medium tracking-wide mt-1">
                    {wording.counterLabel}
                  </span>
                  {next && (
                    <span className="text-[9px] text-muted-foreground mt-0.5">
                      {Math.round(ringPct * 100)}% → {next.name}
                    </span>
                  )}
                </div>
                <Sparkles className="absolute top-1 right-3 w-4 h-4 text-accent animate-pulse" />
              </div>
            );
          })()}
        </div>

        <motion.p
          key={summaryText}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center text-sm text-foreground/85 font-medium px-2 mb-3"
        >
          {summaryText}
        </motion.p>

        <div className="flex justify-center mb-2">
          <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-muted/50 border border-border/40 text-[10px] font-medium">
            <button
              type="button"
              onClick={() => setExactMode(false)}
              className={`px-2.5 py-1 rounded-full transition-colors ${!exactMode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={!exactMode}
            >
              Approx
            </button>
            <button
              type="button"
              onClick={() => setExactMode(true)}
              className={`px-2.5 py-1 rounded-full transition-colors ${exactMode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={exactMode}
            >
              Exact
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {breakdown.map((item, index) => (
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
});
