import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Brain, TrendingUp, TrendingDown, Moon, Heart, Activity, 
  Target, Zap, Calendar, Clock, AlertTriangle, Shield,
  Sparkles, BarChart3, LineChart, Lock, Crown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell
} from "recharts";
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { PremiumGate } from "./community/PremiumGate";

interface AdvancedInsight {
  id: string;
  type: "positive" | "warning" | "neutral" | "critical";
  icon: React.ElementType;
  title: string;
  description: string;
  action?: string;
  confidence: number;
}

interface RecoveryScore {
  overall: number;
  emotional: number;
  behavioral: number;
  physical: number;
  social: number;
}

interface PredictiveAlert {
  riskLevel: "low" | "medium" | "high";
  riskFactors: string[];
  recommendations: string[];
  confidence: number;
}

export const PremiumAnalytics = () => {
  const { user } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");
  
  // Data states
  const [moodData, setMoodData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [triggerData, setTriggerData] = useState<any[]>([]);
  const [recoveryScore, setRecoveryScore] = useState<RecoveryScore>({
    overall: 0, emotional: 0, behavioral: 0, physical: 0, social: 0
  });
  const [insights, setInsights] = useState<AdvancedInsight[]>([]);
  const [predictiveAlert, setPredictiveAlert] = useState<PredictiveAlert | null>(null);

  useEffect(() => {
    if (!user || !isPremium) return;
    fetchAllData();
  }, [user, isPremium, timeRange]);

  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);

    const startDate = subDays(new Date(), parseInt(timeRange)).toISOString().split("T")[0];

    const [moodRes, sleepRes, triggerRes] = await Promise.all([
      supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .order("date"),
      supabase
        .from("sleep_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .order("date"),
      supabase
        .from("trigger_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .order("date"),
    ]);

    const moods = moodRes.data || [];
    const sleeps = (sleepRes.data || []).map(d => ({ ...d, hours_slept: Number(d.hours_slept) }));
    const triggers = triggerRes.data || [];

    setMoodData(moods);
    setSleepData(sleeps);
    setTriggerData(triggers);

    // Calculate recovery score
    calculateRecoveryScore(moods, sleeps, triggers);
    
    // Generate advanced insights
    generateAdvancedInsights(moods, sleeps, triggers);
    
    // Generate predictive alerts
    generatePredictiveAlerts(moods, sleeps, triggers);

    setLoading(false);
  };

  const calculateRecoveryScore = (moods: any[], sleeps: any[], triggers: any[]) => {
    // Emotional score based on mood trends
    const avgMood = moods.length > 0 
      ? moods.reduce((sum, m) => sum + m.mood, 0) / moods.length 
      : 5;
    const emotional = Math.min(100, (avgMood / 10) * 100);

    // Behavioral score based on trigger success rate
    const successfulTriggers = triggers.filter(t => 
      t.outcome === "stayed_sober" || t.outcome === "resisted"
    ).length;
    const behavioral = triggers.length > 0 
      ? (successfulTriggers / triggers.length) * 100 
      : 100;

    // Physical score based on sleep
    const avgSleep = sleeps.length > 0 
      ? sleeps.reduce((sum, s) => sum + s.hours_slept, 0) / sleeps.length 
      : 7;
    const avgQuality = sleeps.length > 0 
      ? sleeps.reduce((sum, s) => sum + s.quality, 0) / sleeps.length 
      : 5;
    const physical = Math.min(100, ((avgSleep / 8) * 50 + (avgQuality / 10) * 50));

    // Social score based on consistency
    const daysWithActivity = new Set([
      ...moods.map(m => m.date),
      ...sleeps.map(s => s.date),
      ...triggers.map(t => t.date)
    ]).size;
    const totalDays = parseInt(timeRange);
    const social = Math.min(100, (daysWithActivity / totalDays) * 100);

    const overall = Math.round((emotional + behavioral + physical + social) / 4);

    setRecoveryScore({
      overall,
      emotional: Math.round(emotional),
      behavioral: Math.round(behavioral),
      physical: Math.round(physical),
      social: Math.round(social),
    });
  };

  const generateAdvancedInsights = (moods: any[], sleeps: any[], triggers: any[]) => {
    const newInsights: AdvancedInsight[] = [];

    // Sleep-Mood Correlation Analysis
    if (sleeps.length >= 5 && moods.length >= 5) {
      const sleepByDate = new Map(sleeps.map(s => [s.date, s]));
      const matchedPairs = moods.filter(m => sleepByDate.has(m.date)).map(m => ({
        mood: m.mood,
        sleep: sleepByDate.get(m.date).hours_slept,
        craving: m.craving_level,
      }));

      if (matchedPairs.length >= 3) {
        const lowSleepMoods = matchedPairs.filter(p => p.sleep < 6);
        const goodSleepMoods = matchedPairs.filter(p => p.sleep >= 7);
        
        if (lowSleepMoods.length > 0 && goodSleepMoods.length > 0) {
          const avgMoodLowSleep = lowSleepMoods.reduce((a, b) => a + b.mood, 0) / lowSleepMoods.length;
          const avgMoodGoodSleep = goodSleepMoods.reduce((a, b) => a + b.mood, 0) / goodSleepMoods.length;
          const diff = avgMoodGoodSleep - avgMoodLowSleep;
          
          if (diff > 1) {
            newInsights.push({
              id: "sleep-mood-correlation",
              type: "positive",
              icon: Moon,
              title: "Strong Sleep-Mood Connection",
              description: `Your mood improves by ${diff.toFixed(1)} points when you sleep 7+ hours. Prioritizing sleep could significantly boost your emotional wellbeing.`,
              action: "Set a consistent bedtime",
              confidence: Math.min(95, 70 + matchedPairs.length * 2),
            });
          }
        }

        // Craving-Sleep correlation
        const lowSleepCravings = matchedPairs.filter(p => p.sleep < 6);
        const goodSleepCravings = matchedPairs.filter(p => p.sleep >= 7);
        
        if (lowSleepCravings.length > 0 && goodSleepCravings.length > 0) {
          const avgCravingLow = lowSleepCravings.reduce((a, b) => a + b.craving, 0) / lowSleepCravings.length;
          const avgCravingGood = goodSleepCravings.reduce((a, b) => a + b.craving, 0) / goodSleepCravings.length;
          
          if (avgCravingLow > avgCravingGood + 1.5) {
            newInsights.push({
              id: "sleep-craving-correlation",
              type: "warning",
              icon: AlertTriangle,
              title: "Sleep Deprivation Increases Cravings",
              description: `Poor sleep correlates with ${((avgCravingLow - avgCravingGood) / avgCravingGood * 100).toFixed(0)}% higher craving levels. Sleep is your recovery superpower.`,
              action: "Use the breathing exercise before bed",
              confidence: Math.min(90, 65 + matchedPairs.length * 2),
            });
          }
        }
      }
    }

    // Day-of-week pattern analysis
    if (moods.length >= 14) {
      const dayStats: Record<number, { moods: number[]; cravings: number[] }> = {};
      moods.forEach(m => {
        const day = parseISO(m.date).getDay();
        if (!dayStats[day]) dayStats[day] = { moods: [], cravings: [] };
        dayStats[day].moods.push(m.mood);
        dayStats[day].cravings.push(m.craving_level);
      });

      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let hardestDay = { day: 0, avgCraving: 0 };
      let easiestDay = { day: 0, avgCraving: 10 };

      Object.entries(dayStats).forEach(([day, stats]) => {
        const avgCraving = stats.cravings.reduce((a, b) => a + b, 0) / stats.cravings.length;
        if (avgCraving > hardestDay.avgCraving) {
          hardestDay = { day: parseInt(day), avgCraving };
        }
        if (avgCraving < easiestDay.avgCraving) {
          easiestDay = { day: parseInt(day), avgCraving };
        }
      });

      if (hardestDay.avgCraving > 5) {
        newInsights.push({
          id: "hardest-day",
          type: "warning",
          icon: Calendar,
          title: `${dayNames[hardestDay.day]}s Are Challenging`,
          description: `Your average craving level on ${dayNames[hardestDay.day]}s is ${hardestDay.avgCraving.toFixed(1)}/10. Consider scheduling extra support or activities for this day.`,
          action: `Plan a recovery activity for ${dayNames[hardestDay.day]}`,
          confidence: 85,
        });
      }
    }

    // Time-of-day trigger analysis
    if (triggers.length >= 10) {
      const timeSlots: Record<string, number> = {
        "Morning (6am-12pm)": 0,
        "Afternoon (12pm-6pm)": 0,
        "Evening (6pm-10pm)": 0,
        "Night (10pm-6am)": 0,
      };

      triggers.forEach(t => {
        const hour = parseInt(t.time?.split(":")[0] || "12");
        if (hour >= 6 && hour < 12) timeSlots["Morning (6am-12pm)"]++;
        else if (hour >= 12 && hour < 18) timeSlots["Afternoon (12pm-6pm)"]++;
        else if (hour >= 18 && hour < 22) timeSlots["Evening (6pm-10pm)"]++;
        else timeSlots["Night (10pm-6am)"]++;
      });

      const riskiestTime = Object.entries(timeSlots).sort((a, b) => b[1] - a[1])[0];
      if (riskiestTime[1] >= 3) {
        newInsights.push({
          id: "risky-time",
          type: "neutral",
          icon: Clock,
          title: `Peak Trigger Time: ${riskiestTime[0].split(" ")[0]}`,
          description: `${((riskiestTime[1] / triggers.length) * 100).toFixed(0)}% of your triggers occur during ${riskiestTime[0]}. Plan protective activities for this time.`,
          action: "Set a reminder for this time slot",
          confidence: 80,
        });
      }
    }

    // Coping effectiveness analysis
    if (triggers.length >= 5) {
      const copingStats: Record<string, { total: number; success: number }> = {};
      triggers.forEach(t => {
        if (t.coping_used) {
          if (!copingStats[t.coping_used]) copingStats[t.coping_used] = { total: 0, success: 0 };
          copingStats[t.coping_used].total++;
          if (t.outcome === "stayed_sober" || t.outcome === "resisted") {
            copingStats[t.coping_used].success++;
          }
        }
      });

      const bestCoping = Object.entries(copingStats)
        .filter(([_, stats]) => stats.total >= 2)
        .map(([strategy, stats]) => ({
          strategy,
          rate: (stats.success / stats.total) * 100,
        }))
        .sort((a, b) => b.rate - a.rate)[0];

      if (bestCoping && bestCoping.rate >= 70) {
        newInsights.push({
          id: "best-coping",
          type: "positive",
          icon: Shield,
          title: `Your Best Strategy: ${bestCoping.strategy}`,
          description: `This coping method has a ${bestCoping.rate.toFixed(0)}% success rate for you. Keep using it when cravings hit!`,
          confidence: 88,
        });
      }
    }

    // Streak and consistency analysis
    const consistentDays = moods.filter((m, i, arr) => {
      if (i === 0) return true;
      const prevDate = new Date(arr[i - 1].date);
      const currDate = new Date(m.date);
      return (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24) === 1;
    }).length;

    if (consistentDays >= 7) {
      newInsights.push({
        id: "consistency-streak",
        type: "positive",
        icon: Activity,
        title: `${consistentDays}-Day Tracking Streak! 🔥`,
        description: "Consistent self-monitoring is one of the strongest predictors of long-term recovery success. You're building powerful habits.",
        confidence: 95,
      });
    }

    setInsights(newInsights.slice(0, 6));
  };

  const generatePredictiveAlerts = (moods: any[], sleeps: any[], triggers: any[]) => {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;

    // Recent mood decline
    if (moods.length >= 5) {
      const recent = moods.slice(-3);
      const earlier = moods.slice(-6, -3);
      if (earlier.length >= 3) {
        const recentAvg = recent.reduce((a, b) => a + b.mood, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b.mood, 0) / earlier.length;
        if (recentAvg < earlierAvg - 1) {
          riskFactors.push("Declining mood trend detected");
          recommendations.push("Consider reaching out to your support network");
          riskScore += 25;
        }
      }

      // Rising cravings
      const recentCravings = recent.reduce((a, b) => a + b.craving_level, 0) / recent.length;
      if (recentCravings > 6) {
        riskFactors.push("Elevated craving levels");
        recommendations.push("Use the craving timer and breathing exercises");
        riskScore += 30;
      }
    }

    // Poor sleep pattern
    if (sleeps.length >= 3) {
      const recentSleep = sleeps.slice(-3);
      const avgSleep = recentSleep.reduce((a, b) => a + b.hours_slept, 0) / recentSleep.length;
      if (avgSleep < 6) {
        riskFactors.push("Sleep deprivation detected");
        recommendations.push("Prioritize getting 7-8 hours of sleep tonight");
        riskScore += 20;
      }
    }

    // Increased trigger frequency
    if (triggers.length >= 5) {
      const recentTriggers = triggers.filter(t => {
        const daysDiff = (new Date().getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      });
      if (recentTriggers.length > triggers.length / 2) {
        riskFactors.push("Increased trigger frequency this week");
        recommendations.push("Review your prevention plan");
        riskScore += 20;
      }
    }

    if (riskFactors.length === 0) {
      recommendations.push("Keep up your great habits!");
    }

    const riskLevel: "low" | "medium" | "high" = 
      riskScore >= 50 ? "high" : riskScore >= 25 ? "medium" : "low";

    setPredictiveAlert({
      riskLevel,
      riskFactors,
      recommendations,
      confidence: Math.min(90, 60 + (moods.length + sleeps.length + triggers.length)),
    });
  };

  // Chart data transformations
  const radarData = useMemo(() => [
    { subject: "Emotional", A: recoveryScore.emotional, fullMark: 100 },
    { subject: "Behavioral", A: recoveryScore.behavioral, fullMark: 100 },
    { subject: "Physical", A: recoveryScore.physical, fullMark: 100 },
    { subject: "Consistency", A: recoveryScore.social, fullMark: 100 },
  ], [recoveryScore]);

  const trendData = useMemo(() => {
    const dateMap = new Map<string, any>();
    moodData.forEach(m => {
      if (!dateMap.has(m.date)) dateMap.set(m.date, { date: m.date });
      dateMap.get(m.date).mood = m.mood;
      dateMap.get(m.date).craving = m.craving_level;
    });
    sleepData.forEach(s => {
      if (!dateMap.has(s.date)) dateMap.set(s.date, { date: s.date });
      dateMap.get(s.date).sleep = s.hours_slept;
    });
    return Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ ...d, dateLabel: format(parseISO(d.date), "MMM d") }));
  }, [moodData, sleepData]);

  const triggerBreakdown = useMemo(() => {
    const counts: Record<string, { total: number; resisted: number }> = {};
    triggerData.forEach(t => {
      if (!counts[t.trigger]) counts[t.trigger] = { total: 0, resisted: 0 };
      counts[t.trigger].total++;
      if (t.outcome === "stayed_sober" || t.outcome === "resisted") {
        counts[t.trigger].resisted++;
      }
    });
    return Object.entries(counts)
      .map(([name, stats]) => ({ 
        name, 
        total: stats.total, 
        resisted: stats.resisted,
        rate: Math.round((stats.resisted / stats.total) * 100)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [triggerData]);

  const COLORS = ['hsl(168 76% 42%)', 'hsl(38 92% 60%)', 'hsl(0 72% 55%)', 'hsl(217 91% 60%)', 'hsl(280 65% 60%)'];

  if (premiumLoading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="py-12 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!isPremium) {
    return (
      <Card className="gradient-card border-border/50 overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4 text-primary" />
            Advanced Analytics
            <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-amber-500">
              <Crown className="w-3.5 h-3.5" />
              Sober Club
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="relative">
            <div className="blur-sm pointer-events-none opacity-50">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-3 rounded-xl bg-primary/10 text-center">
                  <div className="text-lg font-bold text-primary">87</div>
                  <div className="text-[10px] text-muted-foreground">Recovery Score</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-center">
                  <div className="text-lg font-bold text-emerald-500">+12%</div>
                  <div className="text-[10px] text-muted-foreground">This Week</div>
                </div>
              </div>
              <div className="h-24 bg-secondary/30 rounded-xl" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
              <Lock className="w-6 h-6 text-amber-500 mb-2" />
              <h3 className="font-semibold text-sm text-foreground mb-0.5">Unlock Analytics</h3>
              <p className="text-xs text-muted-foreground text-center mb-3 px-4">
                AI insights, alerts & recovery scoring
              </p>
              <PremiumGate />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="py-12 flex items-center justify-center">
          <Brain className="w-8 h-8 animate-pulse text-primary" />
        </CardContent>
      </Card>
    );
  }

  const getInsightStyles = (type: AdvancedInsight["type"]) => {
    switch (type) {
      case "positive": return "bg-emerald-500/10 border-emerald-500/30";
      case "warning": return "bg-amber-500/10 border-amber-500/30";
      case "critical": return "bg-red-500/10 border-red-500/30";
      default: return "bg-blue-500/10 border-blue-500/30";
    }
  };

  const getRiskStyles = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low": return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-500" };
      case "medium": return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500" };
      case "high": return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-500" };
    }
  };

  return (
    <div className="space-y-3">

      {/* Predictive Alert */}
      {predictiveAlert && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`${getRiskStyles(predictiveAlert.riskLevel).bg} ${getRiskStyles(predictiveAlert.riskLevel).border} border`}>
            <CardContent className="pt-3 px-3 pb-3">
              <div className="flex items-start gap-2">
                <div className={`p-1.5 rounded-lg ${getRiskStyles(predictiveAlert.riskLevel).bg}`}>
                  {predictiveAlert.riskLevel === "low" ? (
                    <Shield className={`w-4 h-4 ${getRiskStyles(predictiveAlert.riskLevel).text}`} />
                  ) : predictiveAlert.riskLevel === "high" ? (
                    <AlertTriangle className={`w-4 h-4 ${getRiskStyles(predictiveAlert.riskLevel).text}`} />
                  ) : (
                    <Zap className={`w-4 h-4 ${getRiskStyles(predictiveAlert.riskLevel).text}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-xs font-semibold ${getRiskStyles(predictiveAlert.riskLevel).text} capitalize`}>
                      {predictiveAlert.riskLevel} Risk
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {predictiveAlert.confidence}%
                    </span>
                  </div>
                  {predictiveAlert.riskFactors.length > 0 && (
                    <ul className="text-[10px] text-muted-foreground mb-1.5 space-y-0.5">
                      {predictiveAlert.riskFactors.map((factor, i) => (
                        <li key={i}>• {factor}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {predictiveAlert.recommendations.map((rec, i) => (
                      <span key={i} className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded-full">
                        💡 {rec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-xl border ${getInsightStyles(insight.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded-lg bg-background/50">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className="text-xs font-semibold text-foreground">{insight.title}</h4>
                          <span className="text-[9px] text-muted-foreground">
                            {insight.confidence}%
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{insight.description}</p>
                        {insight.action && (
                          <Button variant="ghost" size="sm" className="mt-1 h-6 text-[10px] px-2">
                            <Target className="w-3 h-3 mr-0.5" />
                            {insight.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-3">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="trends" className="text-[10px]">Trends</TabsTrigger>
          <TabsTrigger value="triggers" className="text-[10px]">Triggers</TabsTrigger>
          <TabsTrigger value="balance" className="text-[10px]">Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mood, Sleep & Cravings</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(168 76% 42%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(168 76% 42%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="cravingGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(0 72% 55%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(0 72% 55%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 25% 20%)" />
                      <XAxis dataKey="dateLabel" tick={{ fill: "hsl(215 20% 65%)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 10 }} domain={[0, 10]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 45% 11%)",
                          border: "1px solid hsl(217 25% 20%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="mood" stroke="hsl(168 76% 42%)" fill="url(#moodGrad)" name="Mood" />
                      <Area type="monotone" dataKey="craving" stroke="hsl(0 72% 55%)" fill="url(#cravingGrad)" name="Craving" />
                      <Line type="monotone" dataKey="sleep" stroke="hsl(38 92% 60%)" strokeWidth={2} dot={false} name="Sleep (hrs)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">Start logging to see your trends!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers">
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Trigger Success Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {triggerBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {triggerBreakdown.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-xl bg-secondary/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className={`text-sm font-bold ${item.rate >= 70 ? 'text-emerald-500' : item.rate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                          {item.rate}% success
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.rate}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`h-full rounded-full ${item.rate >= 70 ? 'bg-emerald-500' : item.rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.resisted}/{item.total}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">Log triggers to see your success rates!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recovery Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(217 25% 20%)" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} 
                    />
                    <Radar
                      name="Recovery"
                      dataKey="A"
                      stroke="hsl(168 76% 42%)"
                      fill="hsl(168 76% 42%)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                A balanced recovery addresses all dimensions of wellness
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
