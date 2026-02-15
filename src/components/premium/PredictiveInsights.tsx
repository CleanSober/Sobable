import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Crown, Sparkles, TrendingUp, AlertCircle, ChevronDown, ChevronUp, RefreshCw, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Insight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  confidence: number;
  strategies: string[];
}

export const PredictiveInsights = () => {
  const { isPremium } = usePremiumStatus();
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isPremium || !user) return;
    loadInsights();
  }, [isPremium, user]);

  const loadInsights = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("predictive_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    setInsights(data || []);
  };

  const generateInsights = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      const startStr = monthAgo.toISOString().split("T")[0];
      const endStr = now.toISOString().split("T")[0];

      const [moodRes, triggerRes, sleepRes] = await Promise.all([
        supabase.from("mood_entries").select("mood, craving_level, date").eq("user_id", user.id).gte("date", startStr).lte("date", endStr).order("date"),
        supabase.from("trigger_entries").select("trigger, situation, emotion, intensity, outcome, date, time").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
        supabase.from("sleep_entries").select("hours_slept, quality, date").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
      ]);

      const moods = moodRes.data || [];
      const triggers = triggerRes.data || [];
      const sleeps = sleepRes.data || [];

      // Clear old insights
      await supabase.from("predictive_insights").delete().eq("user_id", user.id);

      const newInsights: Omit<Insight, "id">[] = [];

      // Pattern 1: Day-of-week craving patterns
      if (moods.length >= 7) {
        const dayMap: Record<string, number[]> = {};
        moods.forEach(m => {
          const day = new Date(m.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
          if (!dayMap[day]) dayMap[day] = [];
          dayMap[day].push(m.craving_level);
        });

        let worstDay = "";
        let worstAvg = 0;
        Object.entries(dayMap).forEach(([day, levels]) => {
          const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
          if (avg > worstAvg) { worstDay = day; worstAvg = avg; }
        });

        if (worstAvg > 5) {
          newInsights.push({
            insight_type: "day_pattern",
            title: `${worstDay}s are your toughest days`,
            description: `Your cravings average ${worstAvg.toFixed(1)}/10 on ${worstDay}s, higher than other days. Planning extra support for ${worstDay}s could help.`,
            confidence: Math.min(0.9, moods.length / 30),
            strategies: [
              `Schedule a positive activity every ${worstDay}`,
              "Prepare coping strategies the night before",
              "Reach out to your support person proactively",
              `Use the craving timer immediately on ${worstDay} mornings`,
            ],
          });
        }
      }

      // Pattern 2: Sleep-mood correlation
      if (sleeps.length >= 5 && moods.length >= 5) {
        const sleepDates = new Set(sleeps.map(s => s.date));
        const poorSleepDays = sleeps.filter(s => Number(s.hours_slept) < 6).map(s => s.date);
        const poorSleepMoods = moods.filter(m => poorSleepDays.includes(m.date));
        const goodSleepMoods = moods.filter(m => sleepDates.has(m.date) && !poorSleepDays.includes(m.date));

        if (poorSleepMoods.length > 0 && goodSleepMoods.length > 0) {
          const poorAvg = poorSleepMoods.reduce((a, b) => a + b.craving_level, 0) / poorSleepMoods.length;
          const goodAvg = goodSleepMoods.reduce((a, b) => a + b.craving_level, 0) / goodSleepMoods.length;

          if (poorAvg - goodAvg > 1.5) {
            newInsights.push({
              insight_type: "sleep_correlation",
              title: "Poor sleep doubles your craving risk",
              description: `After nights with <6 hours of sleep, your cravings average ${poorAvg.toFixed(1)}/10 vs ${goodAvg.toFixed(1)}/10 after good sleep. That's a ${((poorAvg - goodAvg) / goodAvg * 100).toFixed(0)}% increase.`,
              confidence: 0.8,
              strategies: [
                "Set a consistent bedtime alarm",
                "Try the Sleep Reset pathway",
                "Use a sleep meditation on tough nights",
                "Avoid caffeine after 2pm",
              ],
            });
          }
        }
      }

      // Pattern 3: Trigger situation analysis
      if (triggers.length >= 5) {
        const situationMap: Record<string, { count: number; resisted: number }> = {};
        triggers.forEach(t => {
          if (!situationMap[t.situation]) situationMap[t.situation] = { count: 0, resisted: 0 };
          situationMap[t.situation].count++;
          if (t.outcome === "resisted" || t.outcome === "stayed_sober") situationMap[t.situation].resisted++;
        });

        const topSituation = Object.entries(situationMap).sort((a, b) => b[1].count - a[1].count)[0];
        if (topSituation && topSituation[1].count >= 3) {
          const resistRate = Math.round((topSituation[1].resisted / topSituation[1].count) * 100);
          newInsights.push({
            insight_type: "trigger_pattern",
            title: `"${topSituation[0]}" is your #1 trigger situation`,
            description: `This situation triggered you ${topSituation[1].count} times this month. You resisted ${resistRate}% of the time.`,
            confidence: 0.85,
            strategies: [
              `Create a specific plan for "${topSituation[0]}" situations`,
              "Identify warning signs that lead to this situation",
              "Practice the 5-4-3-2-1 grounding technique",
              "Have an exit strategy prepared",
            ],
          });
        }
      }

      // Pattern 4: Mood trend
      if (moods.length >= 14) {
        const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
        const secondHalf = moods.slice(Math.floor(moods.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b.mood, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b.mood, 0) / secondHalf.length;
        const trend = secondAvg - firstAvg;

        if (Math.abs(trend) > 0.5) {
          newInsights.push({
            insight_type: "mood_trend",
            title: trend > 0 ? "Your mood is trending upward! 📈" : "Your mood has been declining 📉",
            description: trend > 0
              ? `Your average mood improved from ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)} over the past month. Whatever you're doing is working!`
              : `Your mood dropped from ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)}. Let's identify what's changed.`,
            confidence: 0.75,
            strategies: trend > 0
              ? ["Keep your current routine going", "Journal about what's working", "Consider sharing your success"]
              : ["Review recent changes in your routine", "Talk to your support person", "Increase self-care activities", "Consider professional support if needed"],
          });
        }
      }

      // Fallback insight
      if (newInsights.length === 0) {
        newInsights.push({
          insight_type: "getting_started",
          title: "Building your insight profile",
          description: "Keep logging your mood, sleep, and triggers daily. With more data, I'll uncover patterns specific to your recovery journey.",
          confidence: 1,
          strategies: [
            "Log your mood at least once daily",
            "Track sleep for more accurate correlations",
            "Record triggers when they happen",
            "Complete daily goals consistently",
          ],
        });
      }

      // Save to DB
      for (const insight of newInsights) {
        await supabase.from("predictive_insights").insert({ user_id: user.id, ...insight });
      }

      await loadInsights();
      toast.success(`Found ${newInsights.length} insight${newInsights.length > 1 ? "s" : ""}!`);
    } catch (err) {
      console.error("Insight generation error:", err);
      toast.error("Failed to generate insights");
    } finally {
      setGenerating(false);
    }
  };

  // Premium lock is handled by PremiumLockOverlay wrapper in parent

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "day_pattern": return AlertCircle;
      case "sleep_correlation": return Brain;
      case "trigger_pattern": return AlertCircle;
      case "mood_trend": return TrendingUp;
      default: return Lightbulb;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="card-enhanced overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Brain className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-bold text-foreground">Predictive Insights</h3>
                  <Crown className="w-3 h-3 text-accent" />
                </div>
                <p className="text-[9px] text-muted-foreground">AI pattern analysis</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={generateInsights} disabled={generating}>
              {generating ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
              Analyze
            </Button>
          </div>

          {insights.length === 0 ? (
            <div className="text-center py-4">
              <Brain className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground mb-2">Tap "Analyze" to discover patterns in your recovery data</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {insights.map(insight => {
                const InsightIcon = getInsightIcon(insight.insight_type);
                const isExpanded = expanded === insight.id;

                return (
                  <motion.div key={insight.id} layout>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : insight.id)}
                      className="w-full text-left p-2 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition"
                    >
                      <div className="flex items-start gap-2">
                        <InsightIcon className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-foreground">{insight.title}</p>
                          <p className="text-[9px] text-muted-foreground line-clamp-2">{insight.description}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-2 mt-1 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <p className="text-[9px] font-semibold text-purple-500 mb-1">Prevention Strategies</p>
                            {insight.strategies.map((s, i) => (
                              <p key={i} className="text-[9px] text-muted-foreground mb-0.5">• {s}</p>
                            ))}
                            <div className="mt-1.5 flex items-center gap-1">
                              <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${insight.confidence * 100}%` }} />
                              </div>
                              <span className="text-[8px] text-muted-foreground">{Math.round(insight.confidence * 100)}% confidence</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
