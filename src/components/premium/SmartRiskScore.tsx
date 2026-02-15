import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, TrendingDown, TrendingUp, Activity, Crown, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RiskFactor {
  name: string;
  impact: "high" | "medium" | "low";
  description: string;
}

export const SmartRiskScore = () => {
  const { isPremium } = usePremiumStatus();
  const { user } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>("low");
  const [factors, setFactors] = useState<RiskFactor[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const calculateRiskScore = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

      const [moodRes, triggerRes, sleepRes, goalsRes] = await Promise.all([
        supabase.from("mood_entries").select("mood, craving_level").eq("user_id", user.id).gte("date", weekAgo).lte("date", today),
        supabase.from("trigger_entries").select("intensity, outcome").eq("user_id", user.id).gte("date", weekAgo).lte("date", today),
        supabase.from("sleep_entries").select("hours_slept, quality").eq("user_id", user.id).gte("date", weekAgo).lte("date", today),
        supabase.from("daily_goals").select("mood_logged, journal_written, meditation_done, trigger_logged").eq("user_id", user.id).gte("date", weekAgo).lte("date", today),
      ]);

      const moods = moodRes.data || [];
      const triggers = triggerRes.data || [];
      const sleeps = sleepRes.data || [];
      const goals = goalsRes.data || [];

      let riskScore = 30; // base
      const riskFactors: RiskFactor[] = [];
      const recs: string[] = [];

      // Mood analysis
      if (moods.length > 0) {
        const avgMood = moods.reduce((a, b) => a + b.mood, 0) / moods.length;
        const avgCraving = moods.reduce((a, b) => a + b.craving_level, 0) / moods.length;
        
        if (avgMood < 4) {
          riskScore += 20;
          riskFactors.push({ name: "Low Mood", impact: "high", description: `Average mood ${avgMood.toFixed(1)}/10 this week` });
          recs.push("Consider talking to your support person or trying a guided meditation");
        } else if (avgMood < 6) {
          riskScore += 10;
          riskFactors.push({ name: "Moderate Mood", impact: "medium", description: `Average mood ${avgMood.toFixed(1)}/10` });
        }

        if (avgCraving > 6) {
          riskScore += 25;
          riskFactors.push({ name: "High Cravings", impact: "high", description: `Average craving level ${avgCraving.toFixed(1)}/10` });
          recs.push("Use the craving timer when urges hit and practice breathing exercises");
        } else if (avgCraving > 4) {
          riskScore += 12;
          riskFactors.push({ name: "Moderate Cravings", impact: "medium", description: `Average craving ${avgCraving.toFixed(1)}/10` });
        }
      } else {
        riskScore += 15;
        riskFactors.push({ name: "No Mood Data", impact: "medium", description: "No check-ins this week" });
        recs.push("Log your mood daily to get more accurate risk assessment");
      }

      // Trigger analysis
      if (triggers.length > 3) {
        const unresisted = triggers.filter(t => t.outcome !== "resisted" && t.outcome !== "stayed_sober").length;
        if (unresisted > 2) {
          riskScore += 15;
          riskFactors.push({ name: "Unmanaged Triggers", impact: "high", description: `${unresisted} triggers not fully managed` });
          recs.push("Review your prevention plan and update coping strategies");
        }
      }

      // Sleep analysis
      if (sleeps.length > 0) {
        const avgSleep = sleeps.reduce((a, b) => a + Number(b.hours_slept), 0) / sleeps.length;
        if (avgSleep < 6) {
          riskScore += 15;
          riskFactors.push({ name: "Poor Sleep", impact: "high", description: `Averaging ${avgSleep.toFixed(1)} hours` });
          recs.push("Focus on sleep hygiene — try the Sleep Reset pathway");
        }
      }

      // Goal consistency
      if (goals.length > 0) {
        const completionRate = goals.filter(g => g.mood_logged && g.journal_written && g.meditation_done).length / goals.length;
        if (completionRate < 0.3) {
          riskScore += 10;
          riskFactors.push({ name: "Low Engagement", impact: "medium", description: `${Math.round(completionRate * 100)}% daily goal completion` });
          recs.push("Try to complete at least your mood check-in and journal daily");
        }
      }

      riskScore = Math.min(100, Math.max(0, riskScore));
      const level = riskScore >= 70 ? "high" : riskScore >= 40 ? "moderate" : "low";

      if (recs.length === 0) {
        recs.push("Keep up the great work! Your recovery metrics look strong 💪");
      }

      setScore(riskScore);
      setRiskLevel(level);
      setFactors(riskFactors);
      setRecommendations(recs);

      // Save to DB
      await supabase.from("risk_scores").insert({
        user_id: user.id,
        score: riskScore,
        risk_level: level,
        factors: riskFactors as any,
        recommendations: recs,
      });
    } catch (err) {
      console.error("Risk score error:", err);
      toast.error("Failed to calculate risk score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPremium && user) {
      // Check for existing score from today
      const loadExisting = async () => {
        const today = new Date().toISOString().split("T")[0];
        const { data } = await supabase
          .from("risk_scores")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", today + "T00:00:00")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setScore(data.score);
          setRiskLevel(data.risk_level);
          setFactors((data.factors as any) || []);
          setRecommendations(data.recommendations || []);
        } else {
          calculateRiskScore();
        }
      };
      loadExisting();
    }
  }, [isPremium, user]);

  // Premium lock is handled by PremiumLockOverlay wrapper in parent

  const getRiskColor = () => {
    if (riskLevel === "high") return "text-red-500";
    if (riskLevel === "moderate") return "text-amber-500";
    return "text-emerald-500";
  };

  const getRiskBg = () => {
    if (riskLevel === "high") return "from-red-500/20 to-red-500/5";
    if (riskLevel === "moderate") return "from-amber-500/20 to-amber-500/5";
    return "from-emerald-500/20 to-emerald-500/5";
  };

  const getRiskIcon = () => {
    if (riskLevel === "high") return AlertTriangle;
    if (riskLevel === "moderate") return Activity;
    return Shield;
  };

  const RiskIcon = getRiskIcon();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="card-enhanced overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${getRiskBg()}`}>
                <RiskIcon className={`w-4 h-4 ${getRiskColor()}`} />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-bold text-foreground">Risk Score</h3>
                  <Crown className="w-3 h-3 text-accent" />
                </div>
                <p className="text-[9px] text-muted-foreground">Daily AI assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {score !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-xl font-bold ${getRiskColor()}`}
                >
                  {score}
                </motion.div>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={calculateRiskScore} disabled={loading}>
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {score !== null && (
            <>
              {/* Risk bar */}
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${
                    riskLevel === "high" ? "bg-red-500" : riskLevel === "moderate" ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </div>

              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between text-[10px] text-muted-foreground"
              >
                <span className={`font-semibold capitalize ${getRiskColor()}`}>{riskLevel} risk</span>
                <span className="flex items-center gap-0.5">
                  {factors.length} factors {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {factors.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {factors.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 p-1.5 rounded-lg bg-secondary/50">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${
                              f.impact === "high" ? "bg-red-500" : f.impact === "medium" ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                            <div>
                              <p className="text-[10px] font-semibold text-foreground">{f.name}</p>
                              <p className="text-[9px] text-muted-foreground">{f.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {recommendations.length > 0 && (
                      <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-[9px] font-semibold text-primary mb-1">Recommendations</p>
                        {recommendations.map((r, i) => (
                          <p key={i} className="text-[9px] text-muted-foreground mb-0.5">• {r}</p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {loading && score === null && (
            <div className="flex items-center justify-center py-3">
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground ml-2">Analyzing your data...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
