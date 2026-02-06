import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Award, Target, 
  BarChart3, Activity, Flame, Brain, Moon, Heart, Minus,
  ChevronLeft, ChevronRight, Zap, Shield, Clock, Droplets,
  Wind, Eye, Smile, Sparkles, Check, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { getMilestones } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification, getLevelTitle } from "@/hooks/useGamification";

interface ProgressViewProps {
  daysSober: number;
  totalSaved: number;
  dailySpending: number;
}

type ViewMode = "weekly" | "monthly";

interface PeriodStats {
  moodAvg: number;
  moodEntries: number;
  journalCount: number;
  triggerCount: number;
  triggersResisted: number;
  sleepAvg: number;
  sleepEntries: number;
  meditationCount: number;
  goalsCompleted: number;
  totalGoals: number;
  cravingAvg: number;
}

interface DayActivity {
  date: string;
  score: number; // 0-100
  activities: string[];
}

const HEALTH_BENEFITS = [
  { days: 1, icon: Heart, title: "Heart Rate Normalizing", desc: "Blood pressure begins to drop" },
  { days: 2, icon: Droplets, title: "Toxin Clearance Begins", desc: "Body starts eliminating toxins" },
  { days: 3, icon: Brain, title: "Brain Chemistry Shifting", desc: "Dopamine receptors start recovering" },
  { days: 7, icon: Moon, title: "Sleep Improving", desc: "Sleep patterns begin to normalize" },
  { days: 14, icon: Shield, title: "Immune System Boost", desc: "Immune function strengthening" },
  { days: 30, icon: Eye, title: "Clarity & Focus", desc: "Cognitive function notably improved" },
  { days: 60, icon: Wind, title: "Energy Restored", desc: "Physical energy and stamina increase" },
  { days: 90, icon: Sparkles, title: "Neuroplasticity", desc: "Brain creating new neural pathways" },
  { days: 180, icon: Smile, title: "Emotional Regulation", desc: "Mood stability significantly improved" },
  { days: 365, icon: Award, title: "Full Year Renewal", desc: "Major organ repair and mental resilience" },
];

const emptyStats: PeriodStats = {
  moodAvg: 0, moodEntries: 0, journalCount: 0, triggerCount: 0,
  triggersResisted: 0, sleepAvg: 0, sleepEntries: 0, meditationCount: 0,
  goalsCompleted: 0, totalGoals: 0, cravingAvg: 0,
};

export const ProgressView = ({ daysSober, totalSaved, dailySpending }: ProgressViewProps) => {
  const { user } = useAuth();
  const { userXP, xpProgress } = useGamification();
  const { reached, next } = getMilestones(daysSober);
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [currentStats, setCurrentStats] = useState<PeriodStats>(emptyStats);
  const [prevStats, setPrevStats] = useState<PeriodStats>(emptyStats);
  const [weekActivity, setWeekActivity] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const weeks = Math.floor(daysSober / 7);
  const months = Math.floor(daysSober / 30);
  const years = Math.floor(daysSober / 365);
  const yearlyProjection = dailySpending * 365;
  const fiveYearProjection = dailySpending * 365 * 5;

  // Calculate date ranges
  const getDateRange = (offset: number) => {
    const now = new Date();
    if (viewMode === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() - (offset * 7));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return { start: startOfWeek, end: endOfWeek };
    } else {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
      return { start: startOfMonth, end: endOfMonth };
    }
  };

  const fetchPeriodStats = async (start: Date, end: Date): Promise<PeriodStats> => {
    if (!user) return emptyStats;
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    const [moodRes, journalRes, triggerRes, sleepRes, goalsRes] = await Promise.all([
      supabase.from("mood_entries").select("mood, craving_level").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
      supabase.from("journal_entries").select("id").eq("user_id", user.id).gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
      supabase.from("trigger_entries").select("id, outcome").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
      supabase.from("sleep_entries").select("hours_slept").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
      supabase.from("daily_goals").select("meditation_done, mood_logged, journal_written, trigger_logged").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
    ]);

    const moods = moodRes.data || [];
    const sleeps = (sleepRes.data || []).map(s => ({ ...s, hours_slept: Number(s.hours_slept) }));
    const triggers = triggerRes.data || [];
    const goals = goalsRes.data || [];

    const moodValues = moods.map(m => m.mood);
    const cravingValues = moods.map(m => m.craving_level);
    const sleepValues = sleeps.map(s => s.hours_slept);
    const completedGoals = goals.filter(g => g.meditation_done && g.mood_logged && g.journal_written).length;

    return {
      moodAvg: moodValues.length > 0 ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : 0,
      moodEntries: moodValues.length,
      journalCount: journalRes.data?.length || 0,
      triggerCount: triggers.length,
      triggersResisted: triggers.filter(t => t.outcome === "resisted" || t.outcome === "stayed_sober").length,
      sleepAvg: sleepValues.length > 0 ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length : 0,
      sleepEntries: sleepValues.length,
      meditationCount: goals.filter(g => g.meditation_done).length,
      goalsCompleted: completedGoals,
      totalGoals: goals.length,
      cravingAvg: cravingValues.length > 0 ? cravingValues.reduce((a, b) => a + b, 0) / cravingValues.length : 0,
    };
  };

  const fetchWeekActivity = async () => {
    if (!user) return;
    const now = new Date();
    const days: DayActivity[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const [moodRes, journalRes, sleepRes, goalRes] = await Promise.all([
        supabase.from("mood_entries").select("id").eq("user_id", user.id).eq("date", dateStr),
        supabase.from("journal_entries").select("id").eq("user_id", user.id).gte("created_at", dateStr + "T00:00:00").lte("created_at", dateStr + "T23:59:59"),
        supabase.from("sleep_entries").select("id").eq("user_id", user.id).eq("date", dateStr),
        supabase.from("daily_goals").select("mood_logged, journal_written, meditation_done, trigger_logged").eq("user_id", user.id).eq("date", dateStr),
      ]);

      const activities: string[] = [];
      if ((moodRes.data?.length || 0) > 0) activities.push("mood");
      if ((journalRes.data?.length || 0) > 0) activities.push("journal");
      if ((sleepRes.data?.length || 0) > 0) activities.push("sleep");
      const goal = goalRes.data?.[0];
      if (goal?.meditation_done) activities.push("meditation");

      const score = Math.min(100, activities.length * 25);
      days.push({ date: dateStr, score, activities });
    }

    setWeekActivity(days);
  };

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const currentOffset = viewMode === "weekly" ? weekOffset : monthOffset;
      const { start, end } = getDateRange(currentOffset);
      const { start: prevStart, end: prevEnd } = getDateRange(currentOffset + 1);

      const [current, prev] = await Promise.all([
        fetchPeriodStats(start, end),
        fetchPeriodStats(prevStart, prevEnd),
      ]);

      setCurrentStats(current);
      setPrevStats(prev);
      await fetchWeekActivity();
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, viewMode, weekOffset, monthOffset]);

  const currentOffset = viewMode === "weekly" ? weekOffset : monthOffset;
  const { start, end } = getDateRange(currentOffset);
  const dateRangeLabel = viewMode === "weekly"
    ? `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : start.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const canGoForward = viewMode === "weekly" ? weekOffset > 0 : monthOffset > 0;
  const handlePrev = () => viewMode === "weekly" ? setWeekOffset(p => p + 1) : setMonthOffset(p => p + 1);
  const handleNext = () => viewMode === "weekly" ? setWeekOffset(p => Math.max(0, p - 1)) : setMonthOffset(p => Math.max(0, p - 1));

  // Recovery wellness score (free version)
  const wellnessScore = useMemo(() => {
    const moodScore = currentStats.moodAvg > 0 ? (currentStats.moodAvg / 10) * 100 : 50;
    const sleepScore = currentStats.sleepAvg > 0 ? Math.min(100, (currentStats.sleepAvg / 8) * 100) : 50;
    const cravingScore = currentStats.cravingAvg > 0 ? (1 - currentStats.cravingAvg / 10) * 100 : 70;
    const consistencyScore = currentStats.totalGoals > 0 ? (currentStats.goalsCompleted / currentStats.totalGoals) * 100 : 0;
    const triggerScore = currentStats.triggerCount > 0 ? (currentStats.triggersResisted / currentStats.triggerCount) * 100 : 100;
    return Math.round((moodScore + sleepScore + cravingScore + consistencyScore + triggerScore) / 5);
  }, [currentStats]);

  const prevWellnessScore = useMemo(() => {
    const moodScore = prevStats.moodAvg > 0 ? (prevStats.moodAvg / 10) * 100 : 50;
    const sleepScore = prevStats.sleepAvg > 0 ? Math.min(100, (prevStats.sleepAvg / 8) * 100) : 50;
    const cravingScore = prevStats.cravingAvg > 0 ? (1 - prevStats.cravingAvg / 10) * 100 : 70;
    const consistencyScore = prevStats.totalGoals > 0 ? (prevStats.goalsCompleted / prevStats.totalGoals) * 100 : 0;
    const triggerScore = prevStats.triggerCount > 0 ? (prevStats.triggersResisted / prevStats.triggerCount) * 100 : 100;
    return Math.round((moodScore + sleepScore + cravingScore + consistencyScore + triggerScore) / 5);
  }, [prevStats]);

  const scoreChange = wellnessScore - prevWellnessScore;

  const getTrend = (current: number, prev: number) => {
    if (current === 0 && prev === 0) return { icon: Minus, color: "text-muted-foreground", label: "—" };
    if (prev === 0) return { icon: ArrowUpRight, color: "text-emerald-500", label: "New" };
    const pct = ((current - prev) / prev) * 100;
    if (Math.abs(pct) < 5) return { icon: Minus, color: "text-muted-foreground", label: "Stable" };
    if (pct > 0) return { icon: ArrowUpRight, color: "text-emerald-500", label: `+${Math.round(pct)}%` };
    return { icon: ArrowDownRight, color: "text-red-400", label: `${Math.round(pct)}%` };
  };

  // For cravings, lower is better
  const getCravingTrend = (current: number, prev: number) => {
    if (current === 0 && prev === 0) return { icon: Minus, color: "text-muted-foreground", label: "—" };
    if (prev === 0) return { icon: Minus, color: "text-muted-foreground", label: "New" };
    const pct = ((current - prev) / prev) * 100;
    if (Math.abs(pct) < 5) return { icon: Minus, color: "text-muted-foreground", label: "Stable" };
    if (pct < 0) return { icon: ArrowDownRight, color: "text-emerald-500", label: `${Math.round(pct)}%` };
    return { icon: ArrowUpRight, color: "text-red-400", label: `+${Math.round(pct)}%` };
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return "😊";
    if (mood >= 6) return "🙂";
    if (mood >= 4) return "😐";
    if (mood >= 2) return "😔";
    return "😢";
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
  };

  // Health benefits reached & next
  const benefitsReached = HEALTH_BENEFITS.filter(b => daysSober >= b.days);
  const nextBenefit = HEALTH_BENEFITS.find(b => daysSober < b.days);

  // Circumference for the score ring
  const RING_R = 52;
  const RING_C = 2 * Math.PI * RING_R;

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-secondary/50 border border-border/50">
          <Button variant={viewMode === "weekly" ? "default" : "ghost"} size="sm" onClick={() => { setViewMode("weekly"); setWeekOffset(0); }} className="rounded-lg">
            <Calendar className="w-4 h-4 mr-1" /> Weekly
          </Button>
          <Button variant={viewMode === "monthly" ? "default" : "ghost"} size="sm" onClick={() => { setViewMode("monthly"); setMonthOffset(0); }} className="rounded-lg">
            <BarChart3 className="w-4 h-4 mr-1" /> Monthly
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm font-medium min-w-[140px] text-center">{dateRangeLabel}</span>
          <Button variant="ghost" size="icon" onClick={handleNext} disabled={!canGoForward} className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </motion.div>

      {/* Wellness Score Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-enhanced p-6">
        <div className="flex items-center gap-6">
          {/* Score Ring */}
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={RING_R} stroke="hsl(var(--secondary))" strokeWidth="10" fill="none" />
              <motion.circle
                cx="60" cy="60" r={RING_R}
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${RING_C}` }}
                animate={{ strokeDasharray: `${(wellnessScore / 100) * RING_C} ${RING_C}` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{wellnessScore}</span>
              <span className="text-[10px] text-muted-foreground font-medium">WELLNESS</span>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-foreground">Recovery Score</h3>
              {scoreChange !== 0 && (
                <span className={`text-sm font-semibold flex items-center gap-1 ${scoreChange > 0 ? "text-emerald-500" : "text-red-400"}`}>
                  {scoreChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {scoreChange > 0 ? "+" : ""}{scoreChange} pts
                </span>
              )}
            </div>
            {[
              { label: "Mood", value: currentStats.moodAvg > 0 ? Math.round((currentStats.moodAvg / 10) * 100) : 0, color: "bg-pink-500" },
              { label: "Sleep", value: currentStats.sleepAvg > 0 ? Math.min(100, Math.round((currentStats.sleepAvg / 8) * 100)) : 0, color: "bg-indigo-500" },
              { label: "Cravings", value: currentStats.cravingAvg > 0 ? Math.round((1 - currentStats.cravingAvg / 10) * 100) : 100, color: "bg-amber-500" },
              { label: "Triggers", value: currentStats.triggerCount > 0 ? Math.round((currentStats.triggersResisted / currentStats.triggerCount) * 100) : 100, color: "bg-emerald-500" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground w-16">{item.label}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
                <span className="text-[11px] font-medium w-7 text-right text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 7-Day Activity Rings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-enhanced p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">7-Day Activity</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {weekActivity.filter(d => d.score > 0).length}/7 active
          </span>
        </div>
        <div className="flex justify-between gap-1">
          {weekActivity.map((day, i) => {
            const isToday = i === 6;
            const ringR = 16;
            const ringC = 2 * Math.PI * ringR;
            return (
              <div key={day.date} className="flex flex-col items-center gap-1.5">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r={ringR} stroke="hsl(var(--secondary))" strokeWidth="3" fill="none" />
                    <motion.circle
                      cx="20" cy="20" r={ringR}
                      stroke={day.score >= 75 ? "hsl(var(--primary))" : day.score >= 50 ? "hsl(38 92% 60%)" : day.score > 0 ? "hsl(var(--muted-foreground))" : "transparent"}
                      strokeWidth="3" fill="none" strokeLinecap="round"
                      initial={{ strokeDasharray: `0 ${ringC}` }}
                      animate={{ strokeDasharray: `${(day.score / 100) * ringC} ${ringC}` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    />
                  </svg>
                  {day.score >= 100 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  {day.score > 0 && day.score < 100 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-muted-foreground">{day.activities.length}</span>
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {isToday ? "Today" : getDayName(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Grid with Trends */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${weekOffset}-${monthOffset}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          {(() => {
            const moodTrend = getTrend(currentStats.moodAvg, prevStats.moodAvg);
            const sleepTrend = getTrend(currentStats.sleepAvg, prevStats.sleepAvg);
            const journalTrend = getTrend(currentStats.journalCount, prevStats.journalCount);
            const triggerTrend = getTrend(currentStats.triggerCount, prevStats.triggerCount);
            const meditationTrend = getTrend(currentStats.meditationCount, prevStats.meditationCount);
            const cravingTrend = getCravingTrend(currentStats.cravingAvg, prevStats.cravingAvg);

            const cards = [
              {
                label: "Avg Mood", value: currentStats.moodAvg ? `${currentStats.moodAvg.toFixed(1)}` : "—",
                suffix: currentStats.moodAvg ? getMoodEmoji(currentStats.moodAvg) : "",
                sub: `${currentStats.moodEntries} entries`, icon: Heart,
                gradient: "from-pink-500/20 to-rose-500/20", iconColor: "text-pink-500", trend: moodTrend,
              },
              {
                label: "Avg Sleep", value: currentStats.sleepAvg ? `${currentStats.sleepAvg.toFixed(1)}h` : "—",
                suffix: "", sub: `${currentStats.sleepEntries} nights`, icon: Moon,
                gradient: "from-indigo-500/20 to-purple-500/20", iconColor: "text-indigo-500", trend: sleepTrend,
              },
              {
                label: "Cravings", value: currentStats.cravingAvg ? `${currentStats.cravingAvg.toFixed(1)}` : "—",
                suffix: "/10", sub: currentStats.cravingAvg <= 3 ? "Well managed" : currentStats.cravingAvg <= 6 ? "Moderate" : "High alert",
                icon: Flame, gradient: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-500", trend: cravingTrend,
              },
              {
                label: "Journal", value: `${currentStats.journalCount}`,
                suffix: "", sub: "entries written", icon: Brain,
                gradient: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-500", trend: journalTrend,
              },
              {
                label: "Triggers", value: `${currentStats.triggerCount}`,
                suffix: "", sub: currentStats.triggerCount > 0 ? `${currentStats.triggersResisted} resisted` : "none logged",
                icon: Activity, gradient: "from-orange-500/20 to-red-500/20", iconColor: "text-orange-500", trend: triggerTrend,
              },
              {
                label: "Meditations", value: `${currentStats.meditationCount}`,
                suffix: "", sub: "sessions", icon: Sparkles,
                gradient: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-500", trend: meditationTrend,
              },
            ];

            return cards.map((card, index) => {
              const TrendIcon = card.trend.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="card-enhanced">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                          <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                        </div>
                        <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${card.trend.color}`}>
                          <TrendIcon className="w-3 h-3" />
                          {card.trend.label}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {card.value}
                        {card.suffix && <span className="text-sm ml-0.5">{card.suffix}</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{card.label}</p>
                      <p className="text-[9px] text-muted-foreground/70">{card.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            });
          })()}
        </motion.div>
      </AnimatePresence>

      {/* Goal Completion Rate */}
      {currentStats.totalGoals > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-enhanced p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Goal Completion</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {Math.round((currentStats.goalsCompleted / currentStats.totalGoals) * 100)}%
            </span>
          </div>
          <Progress value={(currentStats.goalsCompleted / currentStats.totalGoals) * 100} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">
            {currentStats.goalsCompleted} of {currentStats.totalGoals} days with all goals met
          </p>
        </motion.div>
      )}

      {/* Level & XP */}
      {userXP && xpProgress && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card-enhanced p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center text-lg font-bold text-white shadow-glow">
                {userXP.current_level}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{getLevelTitle(userXP.current_level)}</h3>
                <p className="text-xs text-muted-foreground">{userXP.total_xp.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3 text-primary" />
              {xpProgress.progressInLevel}/{xpProgress.xpNeededForLevel}
            </div>
          </div>
          <Progress value={xpProgress.percentage} className="h-2" />
        </motion.div>
      )}

      {/* Your Journey */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="card-enhanced p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <span className="text-lg font-semibold text-foreground">Your Journey</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Days", value: daysSober, gradient: "from-primary to-primary/50" },
            { label: "Weeks", value: weeks, gradient: "from-blue-500 to-blue-500/50" },
            { label: "Months", value: months, gradient: "from-accent to-accent/50" },
            { label: "Years", value: years, gradient: "from-amber-500 to-amber-500/50" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-center relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Health Benefits Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card-enhanced p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-emerald-500/10"><Heart className="w-5 h-5 text-emerald-500" /></div>
          <span className="text-lg font-semibold text-foreground">Health Benefits</span>
          <span className="ml-auto text-xs text-muted-foreground">{benefitsReached.length}/{HEALTH_BENEFITS.length} unlocked</span>
        </div>

        {nextBenefit && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <nextBenefit.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Next: {nextBenefit.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{nextBenefit.days - daysSober}d to go</span>
            </div>
            <Progress value={(daysSober / nextBenefit.days) * 100} className="h-2" />
          </div>
        )}

        <div className="space-y-1">
          {HEALTH_BENEFITS.map((benefit, i) => {
            const unlocked = daysSober >= benefit.days;
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.days}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 py-2"
              >
                <div className="flex flex-col items-center w-6">
                  <div className={`w-3 h-3 rounded-full ${unlocked ? "bg-primary shadow-glow" : "bg-secondary border border-border"}`} />
                  {i < HEALTH_BENEFITS.length - 1 && (
                    <div className={`w-0.5 h-5 ${unlocked && daysSober >= (HEALTH_BENEFITS[i + 1]?.days || Infinity) ? "bg-primary/50" : "bg-border"}`} />
                  )}
                </div>
                <div className={`flex-1 flex items-center gap-2 ${!unlocked ? "opacity-40" : ""}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${unlocked ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{benefit.title}</p>
                    <p className="text-[10px] text-muted-foreground">{benefit.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">Day {benefit.days}</span>
                </div>
                {unlocked && <Check className="w-4 h-4 text-primary shrink-0" />}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Financial Impact */}
      {dailySpending > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="card-enhanced p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-accent/10"><DollarSign className="w-5 h-5 text-accent" /></div>
            <span className="text-lg font-semibold text-foreground">Financial Impact</span>
          </div>

          <div className="text-center mb-5 p-5 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <p className="text-xs text-muted-foreground mb-1">Total Saved</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
              ${totalSaved.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">${dailySpending}/day × {daysSober} days</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "This Month", value: dailySpending * 30 },
              { label: "Per Year", value: yearlyProjection },
              { label: "In 5 Years", value: fiveYearProjection },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl bg-secondary/50 border border-border/30 text-center">
                <p className="text-base font-semibold text-foreground">${item.value.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Milestones */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-enhanced p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-primary/10"><Award className="w-5 h-5 text-primary" /></div>
          <span className="text-lg font-semibold text-foreground">Milestones</span>
          <span className="ml-auto text-xs text-muted-foreground">{reached.length} earned</span>
        </div>

        {next && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">Next: {next.name}</span>
              <span className="text-sm text-muted-foreground">{next.days - daysSober} days to go</span>
            </div>
            <Progress value={(daysSober / next.days) * 100} className="h-3" />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {reached.map((milestone) => (
            <motion.span
              key={milestone}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r from-accent/20 to-accent/10 text-accent border border-accent/20"
            >
              ✓ {milestone}
            </motion.span>
          ))}
        </div>

        {reached.length === 0 && (
          <p className="text-center text-muted-foreground py-4">Your first milestone is coming up! Keep going! 💪</p>
        )}
      </motion.div>
    </div>
  );
};
