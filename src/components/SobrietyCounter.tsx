import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { toast } from "sonner";
import { getMilestones, formatMilestoneName } from "@/lib/storage";
import { getPersonalizedWording } from "@/lib/substanceConfig";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { canShowConfettiToday, markConfettiShown } from "@/lib/confettiCooldown";

interface SobrietyCounterProps {
  daysSober: number;
  startDate: string;
  substances?: string[] | null;
  compact?: boolean;
}

const CELEBRATED_KEY = "sober_club_celebrated_milestones";

export const SobrietyCounter = memo(({ daysSober, startDate, substances, compact = false }: SobrietyCounterProps) => {
  const wording = getPersonalizedWording(substances);
  const { reached, next } = getMilestones(daysSober);
  const [celebrating, setCelebrating] = useState<string | null>(null);

  useEffect(() => {
    if (reached.length === 0) return;
    let celebrated: string[] = [];
    try {
      const raw = localStorage.getItem(CELEBRATED_KEY);
      celebrated = raw ? JSON.parse(raw) : [];
    } catch { celebrated = []; }

    const fresh = reached.filter((m) => !celebrated.includes(m));
    if (fresh.length === 0) return;

    // Celebrate the most advanced new milestone (in case multiple are crossed at once)
    const milestone = fresh[fresh.length - 1];
    const allowConfetti = canShowConfettiToday();
    if (allowConfetti) {
      markConfettiShown();
      setCelebrating(milestone);
    }
    toast.success(`🎉 Milestone unlocked: ${formatMilestoneName(milestone, wording.statusWord)}!`, {
      description: "Look how far you've come. Keep going.",
      duration: 5000,
    });

    try {
      localStorage.setItem(CELEBRATED_KEY, JSON.stringify([...celebrated, ...fresh]));
    } catch { /* ignore quota */ }

    const t = setTimeout(() => setCelebrating(null), 4500);
    return () => clearTimeout(t);
  }, [reached.join("|"), wording.statusWord]);

  if (compact) {
    return (
      <>
      {celebrating && <ConfettiCelebration />}
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
      </>
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

  const { years, months } = computeExact();

  type Unit = "days" | "months" | "years";
  const [unit, setUnit] = useState<Unit>("days");
  const { impact } = useHaptics();
  const totalMonths = years * 12 + months + (computeExact().days >= 15 ? 1 : 0);
  const displayValue = unit === "days" ? daysSober : unit === "months" ? totalMonths : years;
  const displayLabel =
    unit === "days"
      ? daysSober === 1 ? "Day" : "Days"
      : unit === "months"
      ? totalMonths === 1 ? "Month" : "Months"
      : years === 1 ? "Year" : "Years";

  // Progress ring: completion toward the next milestone (filling continuously).
  const ringTarget = next
    ? Math.max(0.02, Math.min(1, daysSober / next.days))
    : 1;

  // SVG ring geometry
  const RING_SIZE = 232;
  const STROKE = 6;
  const R = (RING_SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;

  return (
    <>
    {celebrating && <ConfettiCelebration />}
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className="relative overflow-hidden rounded-2xl bg-card/60 border border-border/40"
      aria-label="Sobriety counter"
    >
      {/* Single, restrained ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 px-5 pt-6 pb-5 flex flex-col items-center">
        {/* Eyebrow */}
        <div className="flex items-center gap-1.5 mb-5">
          <Flame className="w-3 h-3 text-primary/80" />
          <span className="text-eyebrow text-muted-foreground">
            {wording.counterLabel.replace(/\bdays?\b\s*/i, "").trim() || "Sober"}
          </span>
        </div>

        {/* Hero ring + number */}
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="absolute inset-0 -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={STROKE}
              opacity={0.5}
            />
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - ringTarget) }}
              transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.15 }}
              style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={`${unit}-${displayValue}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="text-display text-foreground"
            >
              {displayValue}
            </motion.span>
            <span className="text-eyebrow mt-2">
              {displayLabel} {wording.statusWord}
            </span>
          </div>
        </div>

        {/* Progress-to-next caption */}
        <p className="text-body-lg text-muted-foreground mt-5 text-center max-w-[18rem]">
          {next
            ? daysSober === 0 && next.days === 1
              ? `Day one ${wording.statusWord} starts tomorrow.`
              : `${next.days - daysSober} ${next.days - daysSober === 1 ? "day" : "days"} to ${formatMilestoneName(next.name, wording.statusWord)}.`
            : "Every milestone reached. Keep going."}
        </p>

        {/* Unit toggle — quiet segmented control */}
        <div className="mt-5 inline-flex items-center gap-0.5 p-0.5 rounded-full bg-muted/40 border border-border/40">
          {(["days", "months", "years"] as const).map((u) => (
            <motion.button
              key={u}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => {
                impact("light");
                setUnit(u);
              }}
              className={cn(
                "px-3 py-1 text-[11px] font-medium rounded-full capitalize transition-colors",
                unit === u
                  ? "bg-foreground/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {u}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
    </>
  );
});
