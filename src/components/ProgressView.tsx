import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, DollarSign, Calendar, Award, Target, 
  BarChart3, Activity, Flame, Brain, Moon, Heart,
  ChevronLeft, ChevronRight, Zap
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

interface WeeklyStats {
  moodAvg: number;
  moodEntries: number;
  journalCount: number;
  triggerCount: number;
  sleepAvg: number;
  sleepEntries: number;
  meditationCount: number;
}

export const ProgressView = ({ daysSober, totalSaved, dailySpending }: ProgressViewProps) => {
  const { user } = useAuth();
  const { userXP, xpProgress } = useGamification();
  const { reached, next } = getMilestones(daysSober);
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const weeks = Math.floor(daysSober / 7);
  const months = Math.floor(daysSober / 30);
  const years = Math.floor(daysSober / 365);

  const yearlyProjection = dailySpending * 365;
  const fiveYearProjection = dailySpending * 365 * 5;

  // Calculate date ranges
  const getDateRange = () => {
    const now = new Date();
    if (viewMode === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() - (weekOffset * 7));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return { start: startOfWeek, end: endOfWeek };
    } else {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0);
      return { start: startOfMonth, end: endOfMonth };
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);

    const { start, end } = getDateRange();
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    try {
      // Fetch mood entries
      const { data: moods } = await supabase
        .from("mood_entries")
        .select("mood")
        .eq("user_id", user.id)
        .gte("date", startStr)
        .lte("date", endStr);

      // Fetch journal entries
      const { data: journals } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      // Fetch trigger entries
      const { data: triggers } = await supabase
        .from("trigger_entries")
        .select("id")
        .eq("user_id", user.id)
        .gte("date", startStr)
        .lte("date", endStr);

      // Fetch sleep entries
      const { data: sleeps } = await supabase
        .from("sleep_entries")
        .select("hours_slept")
        .eq("user_id", user.id)
        .gte("date", startStr)
        .lte("date", endStr);

      // Fetch daily goals for meditation
      const { data: goals } = await supabase
        .from("daily_goals")
        .select("meditation_done")
        .eq("user_id", user.id)
        .gte("date", startStr)
        .lte("date", endStr);

      const moodValues = moods?.map(m => m.mood) || [];
      const sleepValues = sleeps?.map(s => s.hours_slept) || [];

      setStats({
        moodAvg: moodValues.length > 0 ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : 0,
        moodEntries: moodValues.length,
        journalCount: journals?.length || 0,
        triggerCount: triggers?.length || 0,
        sleepAvg: sleepValues.length > 0 ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length : 0,
        sleepEntries: sleepValues.length,
        meditationCount: goals?.filter(g => g.meditation_done).length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, viewMode, weekOffset, monthOffset]);

  const { start, end } = getDateRange();
  const dateRangeLabel = viewMode === "weekly"
    ? `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : start.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const canGoForward = viewMode === "weekly" ? weekOffset > 0 : monthOffset > 0;

  const handlePrev = () => {
    if (viewMode === "weekly") setWeekOffset(prev => prev + 1);
    else setMonthOffset(prev => prev + 1);
  };

  const handleNext = () => {
    if (viewMode === "weekly") setWeekOffset(prev => Math.max(0, prev - 1));
    else setMonthOffset(prev => Math.max(0, prev - 1));
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return "😊";
    if (mood >= 6) return "🙂";
    if (mood >= 4) return "😐";
    if (mood >= 2) return "😔";
    return "😢";
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2 p-1 rounded-xl bg-secondary/50 border border-border/50">
          <Button
            variant={viewMode === "weekly" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setViewMode("weekly"); setWeekOffset(0); }}
            className="rounded-lg"
          >
            <Calendar className="w-4 h-4 mr-1" />
            Weekly
          </Button>
          <Button
            variant={viewMode === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setViewMode("monthly"); setMonthOffset(0); }}
            className="rounded-lg"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Monthly
          </Button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">{dateRangeLabel}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext} 
            disabled={!canGoForward}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Level & XP Summary Card */}
      {userXP && xpProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-enhanced p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center text-xl font-bold text-white shadow-glow">
                  {userXP.current_level}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">{getLevelTitle(userXP.current_level)}</h3>
                <p className="text-sm text-muted-foreground">Level {userXP.current_level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{userXP.total_xp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to Level {userXP.current_level + 1}</span>
              <span>{xpProgress.progressInLevel} / {xpProgress.xpNeededForLevel} XP</span>
            </div>
            <Progress value={xpProgress.percentage} className="h-3" />
          </div>
        </motion.div>
      )}

      {/* Activity Stats Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${weekOffset}-${monthOffset}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          {/* Mood Average */}
          <Card className="card-enhanced">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <p className="text-2xl font-bold">
                {stats?.moodAvg ? `${stats.moodAvg.toFixed(1)}` : "—"}
                {stats?.moodAvg ? <span className="text-lg ml-1">{getMoodEmoji(stats.moodAvg)}</span> : null}
              </p>
              <p className="text-xs text-muted-foreground">Avg Mood</p>
              <p className="text-[10px] text-muted-foreground/70">{stats?.moodEntries || 0} entries</p>
            </CardContent>
          </Card>

          {/* Journal Entries */}
          <Card className="card-enhanced">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{stats?.journalCount || 0}</p>
              <p className="text-xs text-muted-foreground">Journal Entries</p>
            </CardContent>
          </Card>

          {/* Sleep Average */}
          <Card className="card-enhanced">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold">
                {stats?.sleepAvg ? `${stats.sleepAvg.toFixed(1)}h` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg Sleep</p>
              <p className="text-[10px] text-muted-foreground/70">{stats?.sleepEntries || 0} nights</p>
            </CardContent>
          </Card>

          {/* Triggers Logged */}
          <Card className="card-enhanced">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">{stats?.triggerCount || 0}</p>
              <p className="text-xs text-muted-foreground">Triggers Logged</p>
            </CardContent>
          </Card>

          {/* Meditations */}
          <Card className="card-enhanced">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{stats?.meditationCount || 0}</p>
              <p className="text-xs text-muted-foreground">Meditations</p>
            </CardContent>
          </Card>

          {/* Days Sober this period */}
          <Card className="card-enhanced">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold">{daysSober}</p>
              <p className="text-xs text-muted-foreground">Days Sober</p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-enhanced p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">Your Journey</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Days Sober", value: daysSober, icon: Calendar, gradient: "from-primary to-primary/50" },
            { label: "Weeks", value: weeks, icon: Calendar, gradient: "from-blue-500 to-blue-500/50" },
            { label: "Months", value: months, icon: Calendar, gradient: "from-accent to-accent/50" },
            { label: "Years", value: years, icon: Award, gradient: "from-amber-500 to-amber-500/50" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-secondary/50 border border-border/30 text-center relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Money Stats */}
      {dailySpending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-enhanced p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <span className="text-lg font-semibold text-foreground">Financial Impact</span>
          </div>

          <div className="text-center mb-6 p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
              ${totalSaved.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/30 text-center">
              <p className="text-xl font-semibold text-foreground">
                ${yearlyProjection.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Per Year</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/30 text-center">
              <p className="text-xl font-semibold text-foreground">
                ${fiveYearProjection.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">In 5 Years</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-enhanced p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">Milestones</span>
        </div>

        {next && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">Next: {next.name}</span>
              <span className="text-sm text-muted-foreground">
                {next.days - daysSober} days to go
              </span>
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
          <p className="text-center text-muted-foreground py-4">
            Your first milestone is coming up! Keep going! 💪
          </p>
        )}
      </motion.div>
    </div>
  );
};