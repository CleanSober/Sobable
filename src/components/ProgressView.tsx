import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, Calendar, Award, Target, 
  BarChart3, Activity, Flame, Brain, Moon, Heart, Minus,
  ChevronLeft, ChevronRight, Sparkles,
  Check, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { getMilestones } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthBenefitsTimeline } from "@/components/HealthBenefitsTimeline";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProgressViewProps {
  daysSober: number;
  totalSaved: number;
  dailySpending: number;
}

type ViewMode = "weekly" | "monthly" | "yearly";

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

// Health benefits moved to HealthBenefitsTimeline component

const emptyStats: PeriodStats = {
  moodAvg: 0, moodEntries: 0, journalCount: 0, triggerCount: 0,
  triggersResisted: 0, sleepAvg: 0, sleepEntries: 0, meditationCount: 0,
  goalsCompleted: 0, totalGoals: 0, cravingAvg: 0,
};

export const ProgressView = ({ daysSober, totalSaved, dailySpending }: ProgressViewProps) => {
  const { user } = useAuth();
  
  const { reached, next } = getMilestones(daysSober);
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [weekOffset, setWeekOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [currentStats, setCurrentStats] = useState<PeriodStats>(emptyStats);
  const [prevStats, setPrevStats] = useState<PeriodStats>(emptyStats);
  const [weekActivity, setWeekActivity] = useState<DayActivity[]>([]);
  const [streakData, setStreakData] = useState<{ current: number; longest: number; type: string }[]>([]);
  const [loading, setLoading] = useState(true);

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
    } else if (viewMode === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
      return { start: startOfMonth, end: endOfMonth };
    } else {
      const startOfYear = new Date(now.getFullYear() - offset, 0, 1);
      const endOfYear = new Date(now.getFullYear() - offset, 11, 31);
      return { start: startOfYear, end: endOfYear };
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
    const completedGoals = goals.filter(g => g.meditation_done && g.mood_logged && g.journal_written && g.trigger_logged).length;

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
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = now.toISOString().split("T")[0];

    // Batch fetch all 7 days in 4 queries instead of 28
    const [moodRes, journalRes, sleepRes, goalRes] = await Promise.all([
      supabase.from("mood_entries").select("date").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
      supabase.from("journal_entries").select("created_at").eq("user_id", user.id).gte("created_at", startStr + "T00:00:00").lte("created_at", endStr + "T23:59:59"),
      supabase.from("sleep_entries").select("date").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
      supabase.from("daily_goals").select("date, mood_logged, journal_written, meditation_done, trigger_logged").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
    ]);

    const moodDates = new Set((moodRes.data || []).map(m => m.date));
    const journalDates = new Set((journalRes.data || []).map(j => j.created_at.split("T")[0]));
    const sleepDates = new Set((sleepRes.data || []).map(s => s.date));
    const goalsByDate = new Map((goalRes.data || []).map(g => [g.date, g]));

    const days: DayActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const activities: string[] = [];
      if (moodDates.has(dateStr)) activities.push("mood");
      if (journalDates.has(dateStr)) activities.push("journal");
      if (sleepDates.has(dateStr)) activities.push("sleep");
      const goal = goalsByDate.get(dateStr);
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

      const [current, prev, streakRes] = await Promise.all([
        fetchPeriodStats(start, end),
        fetchPeriodStats(prevStart, prevEnd),
        supabase.from("user_streaks").select("current_streak, longest_streak, streak_type").eq("user_id", user.id),
      ]);

      setCurrentStats(current);
      setPrevStats(prev);
      setStreakData((streakRes.data || []).map(s => ({ current: s.current_streak, longest: s.longest_streak, type: s.streak_type })));
      await fetchWeekActivity();
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, viewMode, weekOffset, monthOffset, yearOffset]);

  const currentOffset = viewMode === "weekly" ? weekOffset : viewMode === "monthly" ? monthOffset : yearOffset;
  const { start, end } = getDateRange(currentOffset);
  const dateRangeLabel = viewMode === "weekly"
    ? `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : viewMode === "monthly"
    ? start.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : start.getFullYear().toString();

  const canGoForward = viewMode === "weekly" ? weekOffset > 0 : viewMode === "monthly" ? monthOffset > 0 : yearOffset > 0;
  const handlePrev = () => viewMode === "weekly" ? setWeekOffset(p => p + 1) : viewMode === "monthly" ? setMonthOffset(p => p + 1) : setYearOffset(p => p + 1);
  const handleNext = () => viewMode === "weekly" ? setWeekOffset(p => Math.max(0, p - 1)) : viewMode === "monthly" ? setMonthOffset(p => Math.max(0, p - 1)) : setYearOffset(p => Math.max(0, p - 1));

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

  // Health benefits handled by HealthBenefitsTimeline component

  // Circumference for the score ring
  const RING_R = 52;
  const RING_C = 2 * Math.PI * RING_R;

  return (
    <div className="space-y-3">
      {/* View Mode Toggle */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-secondary/50 border border-border/50">
          <Button variant={viewMode === "weekly" ? "default" : "ghost"} size="sm" onClick={() => { setViewMode("weekly"); setWeekOffset(0); }} className="rounded-lg h-7 text-[10px] px-2">
            <Calendar className="w-3.5 h-3.5 mr-1" /> Weekly
          </Button>
          <Button variant={viewMode === "monthly" ? "default" : "ghost"} size="sm" onClick={() => { setViewMode("monthly"); setMonthOffset(0); }} className="rounded-lg h-7 text-[10px] px-2">
            <BarChart3 className="w-3.5 h-3.5 mr-1" /> Monthly
          </Button>
          <Button variant={viewMode === "yearly" ? "default" : "ghost"} size="sm" onClick={() => { setViewMode("yearly"); setYearOffset(0); }} className="rounded-lg h-7 text-[10px] px-2">
            <Award className="w-3.5 h-3.5 mr-1" /> Yearly
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrev} className="h-7 w-7"><ChevronLeft className="w-3.5 h-3.5" /></Button>
          <span className="text-[10px] font-medium min-w-[100px] text-center">{dateRangeLabel}</span>
          <Button variant="ghost" size="icon" onClick={handleNext} disabled={!canGoForward} className="h-7 w-7"><ChevronRight className="w-3.5 h-3.5" /></Button>
        </div>
      </motion.div>

      {/* Wellness Score Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-enhanced p-3">
        <div className="flex items-center gap-4">
          {/* Score Ring */}
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 120 120">
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
              <span className="text-2xl font-bold text-foreground">{wellnessScore}</span>
              <span className="text-[8px] text-muted-foreground font-medium">WELLNESS</span>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="text-sm font-bold text-foreground">Recovery Score</h3>
              {scoreChange !== 0 && (
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${scoreChange > 0 ? "text-emerald-500" : "text-red-400"}`}>
                  {scoreChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {scoreChange > 0 ? "+" : ""}{scoreChange}
                </span>
              )}
            </div>
            {[
              { label: "Mood", value: currentStats.moodAvg > 0 ? Math.round((currentStats.moodAvg / 10) * 100) : 0, color: "bg-pink-500" },
              { label: "Sleep", value: currentStats.sleepAvg > 0 ? Math.min(100, Math.round((currentStats.sleepAvg / 8) * 100)) : 0, color: "bg-indigo-500" },
              { label: "Cravings", value: currentStats.cravingAvg > 0 ? Math.round((1 - currentStats.cravingAvg / 10) * 100) : 100, color: "bg-amber-500" },
              { label: "Triggers", value: currentStats.triggerCount > 0 ? Math.round((currentStats.triggersResisted / currentStats.triggerCount) * 100) : 100, color: "bg-emerald-500" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground w-12">{item.label}</span>
                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
                <span className="text-[9px] font-medium w-6 text-right text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 7-Day Activity Rings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-enhanced p-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">7-Day Activity</span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {weekActivity.filter(d => d.score > 0).length}/7 active
          </span>
        </div>
        <div className="flex justify-between gap-0.5">
          {weekActivity.map((day, i) => {
            const isToday = i === 6;
            const ringR = 14;
            const ringC = 2 * Math.PI * ringR;
            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r={ringR} stroke="hsl(var(--secondary))" strokeWidth="3" fill="none" />
                    <motion.circle
                      cx="18" cy="18" r={ringR}
                      stroke={day.score >= 75 ? "hsl(var(--primary))" : day.score >= 50 ? "hsl(38 92% 60%)" : day.score > 0 ? "hsl(var(--muted-foreground))" : "transparent"}
                      strokeWidth="3" fill="none" strokeLinecap="round"
                      initial={{ strokeDasharray: `0 ${ringC}` }}
                      animate={{ strokeDasharray: `${(day.score / 100) * ringC} ${ringC}` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    />
                  </svg>
                  {day.score >= 100 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  {day.score > 0 && day.score < 100 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-muted-foreground">{day.activities.length}</span>
                    </div>
                  )}
                </div>
                <span className={`text-[9px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {isToday ? "Today" : getDayName(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Streak Summary */}
      {streakData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="card-enhanced p-3">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold text-foreground">Active Streaks</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {streakData.map((s) => {
              const label = s.type === "check_in" ? "Check-In" : s.type === "journal" ? "Journal" : s.type === "meditation" ? "Meditation" : s.type;
              return (
                <div key={s.type} className="p-2 rounded-xl bg-secondary/50 border border-border/30">
                  <p className="text-[9px] text-muted-foreground mb-0.5">{label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-foreground">{s.current}</span>
                    <span className="text-[9px] text-muted-foreground">days</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground/70">Best: {s.longest}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Stats Grid with Trends */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${weekOffset}-${monthOffset}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 gap-2"
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
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                          <card.icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
                        </div>
                        <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${card.trend.color}`}>
                          <TrendIcon className="w-2.5 h-2.5" />
                          {card.trend.label}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        {card.value}
                        {card.suffix && <span className="text-xs ml-0.5">{card.suffix}</span>}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{card.label}</p>
                      <p className="text-[8px] text-muted-foreground/70">{card.sub}</p>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-enhanced p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Goal Completion</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {Math.round((currentStats.goalsCompleted / currentStats.totalGoals) * 100)}%
            </span>
          </div>
          <Progress value={(currentStats.goalsCompleted / currentStats.totalGoals) * 100} className="h-2 mb-1.5" />
          <p className="text-[10px] text-muted-foreground">
            {currentStats.goalsCompleted} of {currentStats.totalGoals} days with all goals met
          </p>
        </motion.div>
      )}




      {/* Health Benefits Timeline */}
      <HealthBenefitsTimeline daysSober={daysSober} />

      {/* Financial Impact */}
      {dailySpending > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="card-enhanced p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-accent/10"><DollarSign className="w-4 h-4 text-accent" /></div>
            <span className="text-sm font-semibold text-foreground">Financial Impact</span>
          </div>

          <div className="text-center mb-3 p-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Saved</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
              ${totalSaved.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">${dailySpending}/day × {daysSober} days</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "This Month", value: dailySpending * 30 },
              { label: "Per Year", value: yearlyProjection },
              { label: "In 5 Years", value: fiveYearProjection },
            ].map(item => (
              <div key={item.label} className="p-2 rounded-xl bg-secondary/50 border border-border/30 text-center">
                <p className="text-sm font-semibold text-foreground">${item.value.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Milestones */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-enhanced p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-primary/10"><Award className="w-4 h-4 text-primary" /></div>
          <span className="text-sm font-semibold text-foreground">Milestones</span>
          <span className="ml-auto text-[10px] text-muted-foreground">{reached.length} earned</span>
        </div>

        {next && (
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-primary">Next: {next.name}</span>
              <span className="text-[10px] text-muted-foreground">{next.days - daysSober} days to go</span>
            </div>
            <Progress value={(daysSober / next.days) * 100} className="h-2" />
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {reached.map((milestone) => (
            <motion.span
              key={milestone}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-1 text-[10px] font-medium rounded-full bg-gradient-to-r from-accent/20 to-accent/10 text-accent border border-accent/20"
            >
              ✓ {milestone}
            </motion.span>
          ))}
        </div>

        {reached.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-3">Your first milestone is coming up! 💪</p>
        )}
      </motion.div>
    </div>
  );
};
