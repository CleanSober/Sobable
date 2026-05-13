import { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Flame } from "lucide-react";
import { getMilestones, formatMilestoneName } from "@/lib/storage";
import { getPersonalizedWording } from "@/lib/substanceConfig";

interface SobrietyCounterProps {
  daysSober: number;
  startDate: string;
  substances?: string[] | null;
  compact?: boolean;
}

export const SobrietyCounter = memo(({ daysSober, startDate, substances, compact = false }: SobrietyCounterProps) => {
  const wording = getPersonalizedWording(substances);
  const { reached, next } = getMilestones(daysSober);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-enhanced relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-60 bg-primary/15 blur-[60px] rounded-full" />
        </div>
        <div className="relative z-10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/15 border border-primary/20 icon-glow">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div className="leading-tight">
              <motion.span
                key={daysSober}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-3xl font-bold text-gradient tracking-tight"
              >
                {daysSober}
              </motion.span>
              <span className="ml-2 text-xs text-foreground/80 font-medium">
                {wording.counterLabel}
              </span>
            </div>
          </div>
          {next && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-medium">
                {formatMilestoneName(next.name, wording.statusWord)}
              </p>
              <p className="text-sm text-accent font-semibold">
                {next.days - daysSober} days to go
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Exact calendar breakdown using actual start date
  const computeExact = () => {
    const start = new Date(startDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
  };

  const { years, months, days } = computeExact();

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
        {/* Main Counter with circular progress ring to next milestone */}
        <div className="flex flex-col items-center mb-4">
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
                </div>
                <Sparkles className="absolute top-1 right-3 w-4 h-4 text-accent animate-pulse" />
              </div>
            );
          })()}
        </div>

        <div className="grid grid-cols-3 gap-2">
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
      </div>
    </motion.div>
  );
});
