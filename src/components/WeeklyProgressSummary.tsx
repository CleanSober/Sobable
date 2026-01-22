import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, TrendingUp, TrendingDown, Minus, Calendar, 
  DollarSign, Brain, Heart, Crown, Lock, Flame, Target,
  CheckCircle2, AlertTriangle, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PricingPlans } from "@/components/PricingPlans";
import { calculateDaysSober, type UserData } from "@/lib/storage";

interface WeeklyProgressSummaryProps {
  userData: UserData;
}

interface WeeklyStats {
  avgMoodThisWeek: number;
  avgMoodLastWeek: number;
  avgCravingThisWeek: number;
  avgCravingLastWeek: number;
  successRateThisWeek: number;
  checkInDays: number;
  moneySavedThisWeek: number;
  totalDaysSober: number;
  triggersThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  journalEntries: number;
  meditationSessions: number;
  sleepQualityAvg: number;
  // AI Insights (premium)
  riskLevel: 'low' | 'medium' | 'high';
  topTrigger: string | null;
  bestCopingStrategy: string | null;
  recommendation: string;
}

export const WeeklyProgressSummary = ({ userData }: WeeklyProgressSummaryProps) => {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchWeeklyStats();
  }, [user, userData]);

  const fetchWeeklyStats = async () => {
    if (!user) return;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Fetch all data in parallel
    const [moodData, triggerData, streakData, journalData, sleepData, goalsData] = await Promise.all([
      supabase
        .from("mood_entries")
        .select("date, mood, craving_level")
        .eq("user_id", user.id)
        .gte("date", twoWeeksAgo.toISOString().split("T")[0]),
      supabase
        .from("trigger_entries")
        .select("date, outcome, trigger, coping_used")
        .eq("user_id", user.id)
        .gte("date", weekAgo.toISOString().split("T")[0]),
      supabase
        .from("user_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .eq("streak_type", "check_in")
        .maybeSingle(),
      supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", weekAgo.toISOString()),
      supabase
        .from("sleep_entries")
        .select("quality")
        .eq("user_id", user.id)
        .gte("date", weekAgo.toISOString().split("T")[0]),
      supabase
        .from("daily_goals")
        .select("meditation_done")
        .eq("user_id", user.id)
        .gte("date", weekAgo.toISOString().split("T")[0]),
    ]);

    const moods = moodData.data || [];
    const triggers = triggerData.data || [];
    const journals = journalData.data || [];
    const sleepEntries = sleepData.data || [];
    const goals = goalsData.data || [];

    // This week's mood data
    const thisWeekMoods = moods.filter((e) => new Date(e.date) >= weekAgo);
    const lastWeekMoods = moods.filter(
      (e) => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < weekAgo
    );

    // Calculate averages
    const avgMoodThisWeek = thisWeekMoods.length
      ? thisWeekMoods.reduce((sum, e) => sum + e.mood, 0) / thisWeekMoods.length
      : 0;
    const avgMoodLastWeek = lastWeekMoods.length
      ? lastWeekMoods.reduce((sum, e) => sum + e.mood, 0) / lastWeekMoods.length
      : 0;
    const avgCravingThisWeek = thisWeekMoods.length
      ? thisWeekMoods.reduce((sum, e) => sum + e.craving_level, 0) / thisWeekMoods.length
      : 0;
    const avgCravingLastWeek = lastWeekMoods.length
      ? lastWeekMoods.reduce((sum, e) => sum + e.craving_level, 0) / lastWeekMoods.length
      : 0;

    // Success rate
    const resistedThisWeek = triggers.filter(
      (e) => e.outcome === "stayed_sober" || e.outcome === "resisted"
    ).length;
    const successRateThisWeek = triggers.length
      ? (resistedThisWeek / triggers.length) * 100
      : 100;

    // Meditation sessions
    const meditationSessions = goals.filter(g => g.meditation_done).length;

    // Sleep quality
    const sleepQualityAvg = sleepEntries.length
      ? sleepEntries.reduce((sum, e) => sum + e.quality, 0) / sleepEntries.length
      : 0;

    // Top trigger analysis
    const triggerCounts: Record<string, number> = {};
    triggers.forEach(t => {
      triggerCounts[t.trigger] = (triggerCounts[t.trigger] || 0) + 1;
    });
    const topTrigger = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Best coping strategy
    const copingCounts: Record<string, number> = {};
    triggers.filter(t => t.outcome === "stayed_sober" || t.outcome === "resisted")
      .forEach(t => {
        if (t.coping_used) {
          copingCounts[t.coping_used] = (copingCounts[t.coping_used] || 0) + 1;
        }
      });
    const bestCopingStrategy = Object.entries(copingCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Risk level calculation
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (avgCravingThisWeek > 7 || successRateThisWeek < 50) {
      riskLevel = 'high';
    } else if (avgCravingThisWeek > 5 || successRateThisWeek < 75 || avgMoodThisWeek < 4) {
      riskLevel = 'medium';
    }

    // Generate recommendation
    let recommendation = "Keep up the great work! Your consistency is paying off.";
    if (riskLevel === 'high') {
      recommendation = "Consider reaching out to your support network. You've got this!";
    } else if (riskLevel === 'medium') {
      recommendation = "Try adding an extra meditation session this week for balance.";
    } else if (thisWeekMoods.length < 4) {
      recommendation = "Increase daily check-ins to better track your patterns.";
    }

    setStats({
      avgMoodThisWeek,
      avgMoodLastWeek,
      avgCravingThisWeek,
      avgCravingLastWeek,
      successRateThisWeek,
      checkInDays: thisWeekMoods.length,
      moneySavedThisWeek: userData.dailySpending * 7,
      totalDaysSober: calculateDaysSober(userData.sobrietyStartDate),
      triggersThisWeek: triggers.length,
      currentStreak: streakData.data?.current_streak || 0,
      longestStreak: streakData.data?.longest_streak || 0,
      journalEntries: journals.length,
      meditationSessions,
      sleepQualityAvg,
      riskLevel,
      topTrigger,
      bestCopingStrategy,
      recommendation,
    });
    setLoading(false);
  };

  const getTrendIcon = (current: number, previous: number, inverse = false) => {
    const diff = current - previous;
    const isPositive = inverse ? diff < 0 : diff > 0;
    const isNegative = inverse ? diff > 0 : diff < 0;

    if (Math.abs(diff) < 0.1) return <Minus className="w-3 h-3 text-muted-foreground" />;
    if (isPositive) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (isNegative) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      case 'high': return 'text-red-500 bg-red-500/10';
    }
  };

  if (loading || !stats) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary animate-pulse" />
            Loading weekly summary...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="gradient-card border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Weekly Progress Summary
            </CardTitle>
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-500">{stats.currentStreak}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })} - Your week at a glance
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-pink-500/10 text-center"
            >
              <Heart className="w-4 h-4 text-pink-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{stats.avgMoodThisWeek.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">Mood</p>
              <div className="flex justify-center mt-1">
                {getTrendIcon(stats.avgMoodThisWeek, stats.avgMoodLastWeek)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-xl bg-orange-500/10 text-center"
            >
              <Brain className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{stats.avgCravingThisWeek.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">Cravings</p>
              <div className="flex justify-center mt-1">
                {getTrendIcon(stats.avgCravingThisWeek, stats.avgCravingLastWeek, true)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-3 rounded-xl bg-green-500/10 text-center"
            >
              <Target className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{stats.successRateThisWeek.toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">Success</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 rounded-xl bg-blue-500/10 text-center"
            >
              <Calendar className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{stats.checkInDays}/7</p>
              <p className="text-[10px] text-muted-foreground">Check-ins</p>
            </motion.div>
          </div>

          {/* Check-in Progress Bar */}
          <div className="p-3 rounded-xl bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Weekly Check-in Goal</span>
              <span className="text-xs text-muted-foreground">{Math.round((stats.checkInDays / 7) * 100)}%</span>
            </div>
            <Progress value={(stats.checkInDays / 7) * 100} className="h-2" />
            {stats.checkInDays >= 7 && (
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Perfect week!
              </p>
            )}
          </div>

          {/* Money Saved Highlight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saved This Week</p>
                  <p className="text-xl font-bold text-green-500">
                    ${stats.moneySavedThisWeek.toFixed(0)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Days Sober</p>
                <p className="text-xl font-bold">{stats.totalDaysSober}</p>
              </div>
            </div>
          </motion.div>

          {/* Premium AI Insights - Blurred Preview */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`p-4 rounded-xl border ${
                isPremium ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'
              } ${!isPremium ? 'blur-[2px]' : ''}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${getRiskColor(stats.riskLevel)}`}>
                  {stats.riskLevel === 'high' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">AI Risk Assessment</p>
                  <p className={`text-xs capitalize ${
                    stats.riskLevel === 'low' ? 'text-green-500' : 
                    stats.riskLevel === 'medium' ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {stats.riskLevel} risk level
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {stats.topTrigger && (
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">Top trigger:</span> {stats.topTrigger}
                  </p>
                )}
                {stats.bestCopingStrategy && (
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">Best coping:</span> {stats.bestCopingStrategy}
                  </p>
                )}
                <p className="text-primary text-sm mt-2 pt-2 border-t border-border">
                  💡 {stats.recommendation}
                </p>
              </div>
            </motion.div>

            {/* Premium Overlay */}
            {!isPremium && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl backdrop-blur-sm">
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium mb-1">AI-Powered Insights</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Unlock risk assessments & recommendations
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowPricing(true)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Unlock
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Activity Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-lg font-bold text-primary">{stats.journalEntries}</p>
              <p className="text-[10px] text-muted-foreground">Journal entries</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-lg font-bold text-purple-500">{stats.meditationSessions}</p>
              <p className="text-[10px] text-muted-foreground">Meditations</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-lg font-bold text-blue-500">{stats.sleepQualityAvg.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">Sleep quality</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Dialog */}
      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <PricingPlans onClose={() => setShowPricing(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
