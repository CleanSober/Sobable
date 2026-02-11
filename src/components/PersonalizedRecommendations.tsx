import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  TrendingUp,
  Moon,
  Heart,
  Zap,
  Crown,
  ChevronRight,
  Calendar,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PremiumGate } from "./community/PremiumGate";

interface ActionItem {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface Recommendations {
  strengthScore: number;
  strengths: string[];
  riskFactors: string[];
  actionPlan: ActionItem[];
  dailyFocus: string;
  weeklyGoal: string;
  motivationalMessage: string;
  stats: {
    daysSober: number;
    avgMood: number;
    avgCraving: number;
    avgSleep: number;
    triggerSuccessRate: number;
    moodEntriesCount: number;
    triggerEntriesCount: number;
  };
}

export const PersonalizedRecommendations = () => {
  const { user } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Please sign in to get recommendations");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/personalized-recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get recommendations");
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error("Recommendations error:", err);
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPremium && user) {
      fetchRecommendations();
    }
  }, [isPremium, user]);

  if (premiumLoading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!isPremium) {
    return (
      <Card className="gradient-card border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Recommendations
            <Badge variant="secondary" className="ml-auto bg-amber-500/20 text-amber-600 text-[10px]">
              <Crown className="w-3 h-3 mr-0.5" />
              Premium
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="text-center py-3">
            <p className="text-xs text-muted-foreground mb-3">
              Get AI-powered recommendations for your recovery.
            </p>
            <PremiumGate />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Your Plan
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={fetchRecommendations}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pb-3">
        {loading && !recommendations ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your recovery data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchRecommendations} variant="outline">
              Try Again
            </Button>
          </div>
        ) : recommendations ? (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Strength Score */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold">Recovery Strength</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-500">
                    {recommendations.strengthScore}%
                  </span>
                </div>
                <Progress 
                  value={recommendations.strengthScore} 
                  className="h-2 bg-emerald-500/20" 
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-1.5">
                <div className="p-2 rounded-lg bg-secondary/50 text-center">
                  <Calendar className="w-3.5 h-3.5 mx-auto mb-0.5 text-primary" />
                  <div className="text-sm font-bold">{recommendations.stats.daysSober}</div>
                  <div className="text-[9px] text-muted-foreground">Days</div>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50 text-center">
                  <Heart className="w-3.5 h-3.5 mx-auto mb-0.5 text-pink-500" />
                  <div className="text-sm font-bold">{recommendations.stats.avgMood}/5</div>
                  <div className="text-[9px] text-muted-foreground">Mood</div>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50 text-center">
                  <Moon className="w-3.5 h-3.5 mx-auto mb-0.5 text-indigo-500" />
                  <div className="text-sm font-bold">{recommendations.stats.avgSleep}h</div>
                  <div className="text-[9px] text-muted-foreground">Sleep</div>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50 text-center">
                  <TrendingUp className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-500" />
                  <div className="text-sm font-bold">{recommendations.stats.triggerSuccessRate}%</div>
                  <div className="text-[9px] text-muted-foreground">Resisted</div>
                </div>
              </div>

              {/* Daily Focus */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold">Today's Focus</span>
                </div>
                <p className="text-xs text-foreground">{recommendations.dailyFocus}</p>
              </div>

              {/* Weekly Goal */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold">This Week's Goal</span>
                </div>
                <p className="text-xs text-foreground">{recommendations.weeklyGoal}</p>
              </div>

              {/* Strengths */}
              {recommendations.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Your Strengths
                  </h4>
                  <div className="space-y-1">
                    {recommendations.strengths.map((strength, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px]">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {recommendations.riskFactors.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Areas to Watch
                  </h4>
                  <div className="space-y-1">
                    {recommendations.riskFactors.map((risk, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px]">
                        <div className="w-1 h-1 rounded-full bg-amber-500" />
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Plan */}
              <div>
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Your Action Plan
                </h4>
                <div className="space-y-2">
                  {recommendations.actionPlan.map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-2.5 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          action.priority === "high" 
                            ? "bg-red-500/20 text-red-500" 
                            : action.priority === "medium"
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-blue-500/20 text-blue-500"
                        }`}>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="text-xs font-medium flex items-center gap-1.5">
                            {action.title}
                            <Badge variant="outline" className="text-[9px] capitalize px-1 py-0">
                              {action.priority}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Motivational Message */}
              <div className="p-3 rounded-xl gradient-primary text-primary-foreground text-center">
                <Sparkles className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <p className="text-xs font-medium">{recommendations.motivationalMessage}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </CardContent>
    </Card>
  );
};
