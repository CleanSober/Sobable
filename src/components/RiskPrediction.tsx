import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, TrendingUp, TrendingDown, Brain, Lightbulb, ChevronRight, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PremiumGate } from "./community/PremiumGate";
import { subDays, parseISO, format, isToday, getDay } from "date-fns";

interface RiskFactor {
  name: string;
  level: "low" | "medium" | "high";
  description: string;
  recommendation: string;
}

interface PredictionData {
  overallRisk: "low" | "medium" | "high";
  riskScore: number;
  factors: RiskFactor[];
  positiveFactors: string[];
  trendDirection: "improving" | "stable" | "declining";
}

export const RiskPrediction = () => {
  const { user } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      analyzePrediction();
    }
  }, [user]);

  const analyzePrediction = async () => {
    if (!user) return;

    const startDate = subDays(new Date(), 14).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    // Fetch recent data
    const [moodRes, sleepRes, triggerRes, streakRes] = await Promise.all([
      supabase.from("mood_entries").select("*").eq("user_id", user.id).gte("date", startDate).order("date"),
      supabase.from("sleep_entries").select("*").eq("user_id", user.id).gte("date", startDate).order("date"),
      supabase.from("trigger_entries").select("*").eq("user_id", user.id).gte("date", startDate).order("date"),
      supabase.from("user_streaks").select("*").eq("user_id", user.id).eq("streak_type", "check_in").maybeSingle(),
    ]);

    const moodData = moodRes.data || [];
    const sleepData = (sleepRes.data || []).map(s => ({ ...s, hours_slept: Number(s.hours_slept) }));
    const triggerData = triggerRes.data || [];
    const streak = streakRes.data;

    const factors: RiskFactor[] = [];
    const positiveFactors: string[] = [];
    let riskScore = 50; // Base score

    // Analyze mood trends
    if (moodData.length >= 3) {
      const recentMoods = moodData.slice(-5);
      const avgMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
      const avgCraving = recentMoods.reduce((sum, m) => sum + m.craving_level, 0) / recentMoods.length;

      if (avgMood < 3) {
        riskScore += 15;
        factors.push({
          name: "Low Mood",
          level: "high",
          description: `Your average mood is ${avgMood.toFixed(1)}/10 recently`,
          recommendation: "Consider reaching out to a friend or trying a guided meditation",
        });
      } else if (avgMood >= 4) {
        positiveFactors.push(`Mood is stable (${avgMood.toFixed(1)}/10)`);
        riskScore -= 5;
      }

      if (avgCraving > 6) {
        riskScore += 20;
        factors.push({
          name: "Elevated Cravings",
          level: "high",
          description: `Average craving level is ${avgCraving.toFixed(1)}/10`,
          recommendation: "Use the craving timer or breathing exercises when urges arise",
        });
      } else if (avgCraving < 4) {
        positiveFactors.push("Cravings are well-managed");
        riskScore -= 10;
      }

      // Check for declining mood trend
      if (recentMoods.length >= 3) {
        const firstHalf = recentMoods.slice(0, Math.floor(recentMoods.length / 2));
        const secondHalf = recentMoods.slice(Math.floor(recentMoods.length / 2));
        const firstAvg = firstHalf.reduce((s, m) => s + m.mood, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((s, m) => s + m.mood, 0) / secondHalf.length;

        if (secondAvg < firstAvg - 1) {
          riskScore += 10;
          factors.push({
            name: "Declining Mood Trend",
            level: "medium",
            description: "Your mood has been trending downward",
            recommendation: "Take time for self-care and activities you enjoy",
          });
        }
      }
    } else {
      factors.push({
        name: "Limited Data",
        level: "low",
        description: "Not enough mood data for accurate prediction",
        recommendation: "Log your mood daily for better insights",
      });
    }

    // Analyze sleep
    if (sleepData.length >= 3) {
      const recentSleep = sleepData.slice(-5);
      const avgSleep = recentSleep.reduce((sum, s) => sum + s.hours_slept, 0) / recentSleep.length;
      const avgQuality = recentSleep.reduce((sum, s) => sum + s.quality, 0) / recentSleep.length;

      if (avgSleep < 6) {
        riskScore += 15;
        factors.push({
          name: "Sleep Deprivation",
          level: "high",
          description: `Averaging only ${avgSleep.toFixed(1)} hours of sleep`,
          recommendation: "Prioritize getting 7-8 hours of sleep tonight",
        });
      } else if (avgSleep >= 7 && avgQuality >= 3) {
        positiveFactors.push("Good sleep quality");
        riskScore -= 10;
      }

      if (avgQuality < 3) {
        riskScore += 10;
        factors.push({
          name: "Poor Sleep Quality",
          level: "medium",
          description: "Sleep quality has been low recently",
          recommendation: "Try the sleep meditation before bed",
        });
      }
    }

    // Analyze triggers
    if (triggerData.length >= 3) {
      const recentTriggers = triggerData.slice(-7);
      const failedCopes = recentTriggers.filter(
        t => t.outcome === "relapsed" || t.outcome === "gave_in"
      ).length;
      const successRate = 1 - (failedCopes / recentTriggers.length);

      if (successRate < 0.5) {
        riskScore += 20;
        factors.push({
          name: "Coping Challenges",
          level: "high",
          description: "Recent triggers have been difficult to manage",
          recommendation: "Review and update your prevention plan",
        });
      } else if (successRate >= 0.8) {
        positiveFactors.push(`Strong coping (${Math.round(successRate * 100)}% success)`);
        riskScore -= 15;
      }

      // High frequency triggers
      if (recentTriggers.length >= 5) {
        riskScore += 10;
        factors.push({
          name: "Frequent Triggers",
          level: "medium",
          description: `${recentTriggers.length} triggers in the past week`,
          recommendation: "Identify patterns and adjust your environment if possible",
        });
      }
    }

    // Analyze streak
    if (streak?.current_streak) {
      if (streak.current_streak >= 7) {
        positiveFactors.push(`${streak.current_streak}-day streak!`);
        riskScore -= 10;
      }
    }

    // Day of week analysis
    const dayOfWeek = getDay(new Date());
    const weekendDays = [0, 5, 6]; // Sunday, Friday, Saturday
    if (weekendDays.includes(dayOfWeek) && triggerData.length > 0) {
      const weekendTriggers = triggerData.filter(t => {
        const d = getDay(parseISO(t.date));
        return weekendDays.includes(d);
      });
      if (weekendTriggers.length > triggerData.length * 0.5) {
        factors.push({
          name: "Weekend Risk",
          level: "medium",
          description: "Weekends tend to be challenging for you",
          recommendation: "Plan activities and have extra support ready",
        });
        riskScore += 5;
      }
    }

    // Clamp score
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine overall risk level
    let overallRisk: "low" | "medium" | "high" = "low";
    if (riskScore >= 70) overallRisk = "high";
    else if (riskScore >= 40) overallRisk = "medium";

    // Determine trend
    let trendDirection: "improving" | "stable" | "declining" = "stable";
    if (positiveFactors.length > factors.length) trendDirection = "improving";
    else if (factors.filter(f => f.level === "high").length >= 2) trendDirection = "declining";

    setPrediction({
      overallRisk,
      riskScore,
      factors,
      positiveFactors,
      trendDirection,
    });
    setLoading(false);
  };

  // Premium gate handled by PremiumLockOverlay wrapper
  if (!premiumLoading && !isPremium) {
    return null;
  }

  if (loading || premiumLoading) {
    return null; // Don't show loading state for this widget
  }

  if (!prediction || (prediction.factors.length === 0 && prediction.positiveFactors.length === 0)) {
    return null; // Don't show if no insights
  }

  const riskColors = {
    low: "bg-green-500/10 border-green-500/30 text-green-500",
    medium: "bg-amber-500/10 border-amber-500/30 text-amber-500",
    high: "bg-red-500/10 border-red-500/30 text-red-500",
  };

  const riskIcons = {
    low: Shield,
    medium: AlertTriangle,
    high: AlertTriangle,
  };

  const RiskIcon = riskIcons[prediction.overallRisk];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`border ${riskColors[prediction.overallRisk].replace("text-", "border-").split(" ")[1]}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-5 h-5 text-primary" />
              Risk Insights
            </CardTitle>
            <Badge className={riskColors[prediction.overallRisk]}>
              <RiskIcon className="w-3 h-3 mr-1" />
              {prediction.overallRisk === "low" ? "Low Risk" : prediction.overallRisk === "medium" ? "Moderate" : "Elevated"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Trend indicator */}
          <div className="flex items-center gap-2 text-sm">
            {prediction.trendDirection === "improving" ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Trending positive</span>
              </>
            ) : prediction.trendDirection === "declining" ? (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Needs attention</span>
              </>
            ) : (
              <>
                <div className="w-4 h-0.5 bg-muted-foreground" />
                <span className="text-muted-foreground">Stable</span>
              </>
            )}
          </div>

          {/* Positive factors */}
          {prediction.positiveFactors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prediction.positiveFactors.map((factor, i) => (
                <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/30">
                  ✓ {factor}
                </Badge>
              ))}
            </div>
          )}

          {/* Risk factors (collapsed by default if low risk) */}
          {prediction.factors.length > 0 && (
            <>
              {(prediction.overallRisk !== "low" || expanded) && (
                <div className="space-y-2">
                  {prediction.factors.slice(0, expanded ? undefined : 2).map((factor, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-3 rounded-lg border ${riskColors[factor.level]}`}
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{factor.name}</p>
                          <p className="text-xs opacity-80">{factor.description}</p>
                          <p className="text-xs mt-1 font-medium">💡 {factor.recommendation}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {prediction.factors.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="w-full"
                >
                  {expanded ? "Show less" : `Show ${prediction.factors.length - 2} more`}
                  <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${expanded ? "rotate-90" : ""}`} />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
