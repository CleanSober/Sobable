import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, AlertCircle, Sparkles, Moon, Activity, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PremiumGate } from "./community/PremiumGate";

interface Insight {
  id: string;
  type: "positive" | "warning" | "neutral";
  icon: React.ElementType;
  title: string;
  description: string;
}

export const SmartInsights = () => {
  const { user } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    generateInsights();
  }, [user]);

  const generateInsights = async () => {
    if (!user) return;
    setLoading(true);

    const generatedInsights: Insight[] = [];
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Analyze mood patterns
    const { data: moodData } = await supabase
      .from("mood_entries")
      .select("mood, craving_level, date")
      .eq("user_id", user.id)
      .gte("date", weekAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (moodData && moodData.length >= 3) {
      const avgMood = moodData.reduce((sum, e) => sum + e.mood, 0) / moodData.length;
      const avgCraving = moodData.reduce((sum, e) => sum + e.craving_level, 0) / moodData.length;
      
      // Check mood trend
      const recentMoods = moodData.slice(-3);
      const earlierMoods = moodData.slice(0, 3);
      const recentAvg = recentMoods.reduce((sum, e) => sum + e.mood, 0) / recentMoods.length;
      const earlierAvg = earlierMoods.reduce((sum, e) => sum + e.mood, 0) / earlierMoods.length;

      if (recentAvg > earlierAvg + 0.5) {
        generatedInsights.push({
          id: "mood-improving",
          type: "positive",
          icon: TrendingUp,
          title: "Mood is improving! 📈",
          description: "Your mood has been trending upward this week. Keep up the great work!"
        });
      } else if (recentAvg < earlierAvg - 0.5) {
        generatedInsights.push({
          id: "mood-declining",
          type: "warning",
          icon: TrendingDown,
          title: "Check in with yourself",
          description: "Your mood has dipped recently. Consider reaching out to your support network."
        });
      }

      if (avgCraving < 3) {
        generatedInsights.push({
          id: "low-cravings",
          type: "positive",
          icon: Sparkles,
          title: "Cravings under control",
          description: "Your craving levels have been low. Your coping strategies are working!"
        });
      } else if (avgCraving > 6) {
        generatedInsights.push({
          id: "high-cravings",
          type: "warning",
          icon: AlertCircle,
          title: "High craving levels detected",
          description: "Consider using the craving timer or calling your sponsor when urges hit."
        });
      }
    }

    // Analyze sleep patterns
    const { data: sleepData } = await supabase
      .from("sleep_entries")
      .select("hours_slept, quality")
      .eq("user_id", user.id)
      .gte("date", weekAgo.toISOString().split("T")[0]);

    if (sleepData && sleepData.length >= 3) {
      const avgSleep = sleepData.reduce((sum, e) => sum + Number(e.hours_slept), 0) / sleepData.length;
      const avgQuality = sleepData.reduce((sum, e) => sum + e.quality, 0) / sleepData.length;

      if (avgSleep < 6) {
        generatedInsights.push({
          id: "low-sleep",
          type: "warning",
          icon: Moon,
          title: "Sleep needs attention",
          description: `Averaging ${avgSleep.toFixed(1)} hours of sleep. Try to get 7-8 hours for better recovery.`
        });
      } else if (avgSleep >= 7 && avgQuality >= 4) {
        generatedInsights.push({
          id: "good-sleep",
          type: "positive",
          icon: Moon,
          title: "Sleep is on track! 🌙",
          description: "Great sleep patterns support your recovery. Keep prioritizing rest."
        });
      }
    }

    // Analyze trigger patterns
    const { data: triggerData } = await supabase
      .from("trigger_entries")
      .select("trigger, emotion, outcome")
      .eq("user_id", user.id)
      .gte("date", weekAgo.toISOString().split("T")[0]);

    if (triggerData && triggerData.length > 0) {
      // Check for both "stayed_sober" and "resisted" for backwards compatibility
      const successfulCopes = triggerData.filter(
        t => t.outcome === "stayed_sober" || t.outcome === "resisted"
      ).length;
      const successRate = (successfulCopes / triggerData.length) * 100;

      if (successRate >= 80) {
        generatedInsights.push({
          id: "coping-success",
          type: "positive",
          icon: Activity,
          title: "Strong coping skills! 💪",
          description: `${successRate.toFixed(0)}% of triggers handled successfully. You're building resilience.`
        });
      }

      // Find most common trigger
      const triggerCounts: Record<string, number> = {};
      triggerData.forEach(t => {
        triggerCounts[t.trigger] = (triggerCounts[t.trigger] || 0) + 1;
      });
      const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];
      
      if (topTrigger && topTrigger[1] >= 2) {
        generatedInsights.push({
          id: "common-trigger",
          type: "neutral",
          icon: Brain,
          title: `Watch for: ${topTrigger[0]}`,
          description: `This trigger appeared ${topTrigger[1]} times this week. Plan ahead for similar situations.`
        });
      }
    }

    // Default insight if nothing else
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: "default",
        type: "neutral",
        icon: Brain,
        title: "Keep logging your data",
        description: "The more you track, the better insights we can provide to support your journey."
      });
    }

    setInsights(generatedInsights.slice(0, 4));
    setLoading(false);
  };

  const getTypeStyles = (type: Insight["type"]) => {
    switch (type) {
      case "positive":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
      case "warning":
        return "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400";
    }
  };

  // Premium gate for Smart Insights
  if (!premiumLoading && !isPremium) {
    return (
      <Card className="gradient-card border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            Smart Insights
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-amber-500">
              <Crown className="w-4 h-4" />
              Sober Club
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Blurred preview */}
            <div className="blur-sm pointer-events-none opacity-50 space-y-3">
              <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background/50">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Mood is improving!</h4>
                    <p className="text-sm text-muted-foreground mt-1">Your mood trends upward this week.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background/50">
                    <Moon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Sleep is on track!</h4>
                    <p className="text-sm text-muted-foreground mt-1">Great sleep patterns support recovery.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
              <Lock className="w-8 h-8 text-amber-500 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Unlock Smart Insights</h3>
              <p className="text-sm text-muted-foreground text-center mb-4 px-4">
                AI-powered analysis of your mood, sleep, and recovery patterns
              </p>
              <PremiumGate />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || premiumLoading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
            Analyzing patterns...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-primary" />
          Smart Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">Personalized observations from your data</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${getTypeStyles(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background/50">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
