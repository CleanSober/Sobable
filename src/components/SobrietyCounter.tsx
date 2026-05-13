import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Flame } from "lucide-react";
import { getMilestones, formatMilestoneName } from "@/lib/storage";
import { getPersonalizedWording } from "@/lib/substanceConfig";
import { cn } from "@/lib/utils";

interface SobrietyCounterProps {
  daysSober: number;
  startDate: string;
  substances?: string[] | null;
  compact?: boolean;
}

export const SobrietyCounter = memo(({ daysSober, startDate, substances, compact = false }: SobrietyCounterProps) => {
  const wording = getPersonalizedWording(substances);
  const { next } = getMilestones(daysSober);

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
        {/* Main Counter */}
        <div className="flex flex-col items-center justify-center text-center mb-4 py-4 relative">
          <motion.span
            key={daysSober}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-6xl font-bold text-gradient tracking-tight leading-none"
          >
            {daysSober}
          </motion.span>
          <span className="text-sm text-foreground/80 font-medium tracking-wide mt-2">
            {wording.counterLabel}
          </span>
          <p className="text-xs text-muted-foreground italic mt-3 px-4 max-w-xs">
            {(() => {
              if (daysSober === 0) return "Day one — the bravest step. 🌱";
              if (daysSober === 1) return "First full day in the books. ✨";
              if (daysSober < 7) return "Building momentum, one day at a time. 💪";
              if (daysSober < 30) return "You're forming a powerful new rhythm. 🌊";
              if (daysSober < 90) return "Your strength is showing. Keep going. 🔥";
              if (daysSober < 365) return "Look how far you've come. 🌟";
              if (daysSober < 730) return "A year-plus of freedom. Extraordinary. 🏆";
              return "A life rebuilt — you are the proof. 👑";
            })()}
          </p>
          <Sparkles className="absolute top-2 right-6 w-4 h-4 text-accent animate-pulse" />
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
