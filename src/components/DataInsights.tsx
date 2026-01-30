import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Moon, Brain, Heart, Calendar, Loader2, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PremiumGate } from "./community/PremiumGate";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, ZAxis } from "recharts";
import { format, subDays, parseISO } from "date-fns";

interface MoodData {
  date: string;
  mood: number;
  craving_level: number;
}

interface SleepData {
  date: string;
  hours_slept: number;
  quality: number;
}

interface TriggerData {
  date: string;
  intensity: number;
  trigger: string;
  emotion: string;
  outcome: string;
}

interface Correlation {
  factor1: string;
  factor2: string;
  correlation: "positive" | "negative" | "neutral";
  strength: number;
  insight: string;
}

export const DataInsights = () => {
  const { user } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [triggerData, setTriggerData] = useState<TriggerData[]>([]);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, timeRange]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const startDate = subDays(new Date(), parseInt(timeRange)).toISOString().split("T")[0];

    const [moodRes, sleepRes, triggerRes] = await Promise.all([
      supabase
        .from("mood_entries")
        .select("date, mood, craving_level")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .order("date"),
      supabase
        .from("sleep_entries")
        .select("date, hours_slept, quality")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .order("date"),
      supabase
        .from("trigger_entries")
        .select("date, intensity, trigger, emotion, outcome")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .order("date"),
    ]);

    setMoodData(moodRes.data || []);
    setSleepData((sleepRes.data || []).map(d => ({ ...d, hours_slept: Number(d.hours_slept) })));
    setTriggerData(triggerRes.data || []);
    setLoading(false);
  };

  // Calculate correlations
  const correlations = useMemo<Correlation[]>(() => {
    const insights: Correlation[] = [];

    // Sleep vs Mood correlation
    if (sleepData.length >= 5 && moodData.length >= 5) {
      const sleepByDate = new Map(sleepData.map(s => [s.date, s]));
      const matchedData = moodData.filter(m => sleepByDate.has(m.date)).map(m => ({
        mood: m.mood,
        sleep: sleepByDate.get(m.date)!.hours_slept,
        quality: sleepByDate.get(m.date)!.quality,
      }));

      if (matchedData.length >= 3) {
        const avgSleepHighMood = matchedData.filter(d => d.mood >= 4).map(d => d.sleep);
        const avgSleepLowMood = matchedData.filter(d => d.mood <= 2).map(d => d.sleep);
        
        if (avgSleepHighMood.length > 0 && avgSleepLowMood.length > 0) {
          const highAvg = avgSleepHighMood.reduce((a, b) => a + b, 0) / avgSleepHighMood.length;
          const lowAvg = avgSleepLowMood.reduce((a, b) => a + b, 0) / avgSleepLowMood.length;
          
          if (highAvg > lowAvg + 0.5) {
            insights.push({
              factor1: "Sleep",
              factor2: "Mood",
              correlation: "positive",
              strength: Math.min((highAvg - lowAvg) / 2, 1),
              insight: `You tend to feel better after ${highAvg.toFixed(1)}+ hours of sleep. Prioritize rest!`,
            });
          }
        }
      }
    }

    // Sleep quality vs Cravings
    if (sleepData.length >= 3 && moodData.length >= 3) {
      const qualityByDate = new Map(sleepData.map(s => [s.date, s.quality]));
      const matchedCravings = moodData.filter(m => qualityByDate.has(m.date));
      
      if (matchedCravings.length >= 3) {
        const goodSleep = matchedCravings.filter(m => qualityByDate.get(m.date)! >= 4);
        const poorSleep = matchedCravings.filter(m => qualityByDate.get(m.date)! <= 2);
        
        if (goodSleep.length > 0 && poorSleep.length > 0) {
          const avgCravingGood = goodSleep.reduce((a, b) => a + b.craving_level, 0) / goodSleep.length;
          const avgCravingPoor = poorSleep.reduce((a, b) => a + b.craving_level, 0) / poorSleep.length;
          
          if (avgCravingPoor > avgCravingGood + 1) {
            insights.push({
              factor1: "Sleep Quality",
              factor2: "Cravings",
              correlation: "negative",
              strength: Math.min((avgCravingPoor - avgCravingGood) / 5, 1),
              insight: `Poor sleep increases your cravings by ${((avgCravingPoor - avgCravingGood) / avgCravingGood * 100).toFixed(0)}%. Quality rest helps resist urges.`,
            });
          }
        }
      }
    }

    // Trigger success patterns
    if (triggerData.length >= 5) {
      const successRate = triggerData.filter(t => t.outcome === "stayed_sober" || t.outcome === "resisted").length / triggerData.length;
      
      if (successRate >= 0.7) {
        insights.push({
          factor1: "Coping Strategies",
          factor2: "Success",
          correlation: "positive",
          strength: successRate,
          insight: `You're handling ${(successRate * 100).toFixed(0)}% of triggers successfully. Your strategies are working!`,
        });
      } else if (successRate < 0.5 && triggerData.length >= 3) {
        insights.push({
          factor1: "Coping Strategies",
          factor2: "Success",
          correlation: "negative",
          strength: 1 - successRate,
          insight: `Consider trying new coping strategies. The breathing exercises and AI coach might help.`,
        });
      }
    }

    // Day of week patterns
    if (moodData.length >= 14) {
      const dayMoods: Record<number, number[]> = {};
      moodData.forEach(m => {
        const day = parseISO(m.date).getDay();
        if (!dayMoods[day]) dayMoods[day] = [];
        dayMoods[day].push(m.craving_level);
      });

      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let maxDay = 0, maxAvg = 0;
      Object.entries(dayMoods).forEach(([day, cravings]) => {
        const avg = cravings.reduce((a, b) => a + b, 0) / cravings.length;
        if (avg > maxAvg) {
          maxAvg = avg;
          maxDay = parseInt(day);
        }
      });

      if (maxAvg > 4) {
        insights.push({
          factor1: "Day of Week",
          factor2: "Cravings",
          correlation: "neutral",
          strength: maxAvg / 10,
          insight: `${dayNames[maxDay]}s tend to be harder for you. Plan extra support for these days.`,
        });
      }
    }

    return insights;
  }, [moodData, sleepData, triggerData]);

  // Combined chart data
  const chartData = useMemo(() => {
    const dateMap = new Map<string, any>();

    moodData.forEach(m => {
      if (!dateMap.has(m.date)) dateMap.set(m.date, { date: m.date });
      dateMap.get(m.date).mood = m.mood;
      dateMap.get(m.date).craving = m.craving_level;
    });

    sleepData.forEach(s => {
      if (!dateMap.has(s.date)) dateMap.set(s.date, { date: s.date });
      dateMap.get(s.date).sleep = s.hours_slept;
      dateMap.get(s.date).sleepQuality = s.quality;
    });

    return Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        ...d,
        dateLabel: format(parseISO(d.date), "MMM d"),
      }));
  }, [moodData, sleepData]);

  // Trigger breakdown
  const triggerBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    triggerData.forEach(t => {
      counts[t.trigger] = (counts[t.trigger] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [triggerData]);

  // Premium gate for Data Insights
  if (!premiumLoading && !isPremium) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="gradient-card border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Data Insights
                </CardTitle>
                <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                  <Crown className="w-4 h-4" />
                  Sober Club
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Blurred preview */}
                <div className="blur-sm pointer-events-none opacity-50 space-y-3">
                  <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">Sleep → Mood: Better sleep = better mood!</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-40 bg-muted/30 rounded-lg" />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                  <Lock className="w-8 h-8 text-amber-500 mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Unlock Data Insights</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4 px-4">
                    Advanced charts and correlation analysis
                  </p>
                  <PremiumGate />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (loading || premiumLoading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="gradient-card border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Data Insights
              </CardTitle>
              <div className="flex gap-1">
                {(["7", "30", "90"] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      timeRange === range
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {range}d
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {correlations.length > 0 ? (
              <div className="space-y-3">
                {correlations.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      c.correlation === "positive"
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : c.correlation === "negative"
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-blue-500/10 border-blue-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        c.correlation === "positive" ? "bg-emerald-500/20" : 
                        c.correlation === "negative" ? "bg-amber-500/20" : "bg-blue-500/20"
                      }`}>
                        {c.correlation === "positive" ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : c.correlation === "negative" ? (
                          <TrendingDown className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Brain className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            {c.factor1} → {c.factor2}
                          </span>
                          <div className="flex-1 h-1 bg-secondary rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                c.correlation === "positive" ? "bg-emerald-500" :
                                c.correlation === "negative" ? "bg-amber-500" : "bg-blue-500"
                              }`}
                              style={{ width: `${c.strength * 100}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-foreground">{c.insight}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Keep logging your mood, sleep, and triggers to see personalized insights.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mood & Sleep Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(168 76% 42%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(168 76% 42%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(38 92% 60%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(38 92% 60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 25% 20%)" />
                      <XAxis dataKey="dateLabel" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} domain={[0, 10]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 45% 11%)",
                          border: "1px solid hsl(217 25% 20%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="mood" stroke="hsl(168 76% 42%)" fill="url(#moodGradient)" name="Mood" />
                      <Area type="monotone" dataKey="sleep" stroke="hsl(38 92% 60%)" fill="url(#sleepGradient)" name="Sleep (hrs)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No data yet. Start logging!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Craving Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 25% 20%)" />
                      <XAxis dataKey="dateLabel" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} domain={[0, 10]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 45% 11%)",
                          border: "1px solid hsl(217 25% 20%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="craving" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={{ r: 3 }} name="Craving Level" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No craving data yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers">
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              {triggerBreakdown.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={triggerBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 25% 20%)" />
                      <XAxis type="number" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 45% 11%)",
                          border: "1px solid hsl(217 25% 20%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(168 76% 42%)" radius={[0, 4, 4, 0]} name="Occurrences" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No triggers logged yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
