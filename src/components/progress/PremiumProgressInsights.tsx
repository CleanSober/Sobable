import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, BarChart3, Brain, Zap, Download, Crown,
  Moon, Heart, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PremiumProgressInsightsProps {
  daysSober: number;
}

interface CorrelationData {
  date: string;
  mood: number;
  sleep: number;
  craving: number;
}

interface TriggerBreakdown {
  trigger: string;
  count: number;
  resistedCount: number;
  avgIntensity: number;
}

interface WeekComparison {
  metric: string;
  thisWeek: number;
  lastWeek: number;
  unit: string;
}

export const PremiumProgressInsights = ({ daysSober }: PremiumProgressInsightsProps) => {
  const { user } = useAuth();
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [triggerBreakdown, setTriggerBreakdown] = useState<TriggerBreakdown[]>([]);
  const [weekComparison, setWeekComparison] = useState<WeekComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchPremiumData();
  }, [user]);

  const fetchPremiumData = async () => {
    if (!user) return;
    setLoading(true);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const startStr = thirtyDaysAgo.toISOString().split("T")[0];
    const endStr = now.toISOString().split("T")[0];

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

    try {
      const [moodRes, sleepRes, triggerRes, thisWeekMoodRes, lastWeekMoodRes, thisWeekJournalRes, lastWeekJournalRes] = await Promise.all([
        supabase.from("mood_entries").select("date, mood, craving_level").eq("user_id", user.id).gte("date", startStr).lte("date", endStr).order("date"),
        supabase.from("sleep_entries").select("date, hours_slept, quality").eq("user_id", user.id).gte("date", startStr).lte("date", endStr).order("date"),
        supabase.from("trigger_entries").select("trigger, intensity, outcome").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
        supabase.from("mood_entries").select("mood, craving_level").eq("user_id", user.id).gte("date", thisWeekStart.toISOString().split("T")[0]).lte("date", endStr),
        supabase.from("mood_entries").select("mood, craving_level").eq("user_id", user.id).gte("date", lastWeekStart.toISOString().split("T")[0]).lte("date", lastWeekEnd.toISOString().split("T")[0]),
        supabase.from("journal_entries").select("id").eq("user_id", user.id).gte("created_at", thisWeekStart.toISOString()).lte("created_at", now.toISOString()),
        supabase.from("journal_entries").select("id").eq("user_id", user.id).gte("created_at", lastWeekStart.toISOString()).lte("created_at", lastWeekEnd.toISOString()),
      ]);

      // Build correlation data
      const moods = moodRes.data || [];
      const sleeps = sleepRes.data || [];
      const sleepMap = new Map(sleeps.map(s => [s.date, Number(s.hours_slept)]));

      const corr: CorrelationData[] = moods.map(m => ({
        date: m.date,
        mood: m.mood,
        sleep: sleepMap.get(m.date) || 0,
        craving: m.craving_level,
      }));
      setCorrelationData(corr);

      // Build trigger breakdown
      const triggers = triggerRes.data || [];
      const triggerMap = new Map<string, { count: number; resisted: number; totalIntensity: number }>();
      triggers.forEach(t => {
        const existing = triggerMap.get(t.trigger) || { count: 0, resisted: 0, totalIntensity: 0 };
        existing.count++;
        if (t.outcome === "resisted" || t.outcome === "stayed_sober") existing.resisted++;
        existing.totalIntensity += t.intensity;
        triggerMap.set(t.trigger, existing);
      });
      const breakdown: TriggerBreakdown[] = Array.from(triggerMap.entries())
        .map(([trigger, data]) => ({
          trigger,
          count: data.count,
          resistedCount: data.resisted,
          avgIntensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTriggerBreakdown(breakdown);

      // Build week comparison
      const thisWeekMoods = thisWeekMoodRes.data || [];
      const lastWeekMoods = lastWeekMoodRes.data || [];
      const thisWeekJournals = thisWeekJournalRes.data || [];
      const lastWeekJournals = lastWeekJournalRes.data || [];

      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      setWeekComparison([
        { metric: "Avg Mood", thisWeek: Math.round(avg(thisWeekMoods.map(m => m.mood)) * 10) / 10, lastWeek: Math.round(avg(lastWeekMoods.map(m => m.mood)) * 10) / 10, unit: "/10" },
        { metric: "Avg Craving", thisWeek: Math.round(avg(thisWeekMoods.map(m => m.craving_level)) * 10) / 10, lastWeek: Math.round(avg(lastWeekMoods.map(m => m.craving_level)) * 10) / 10, unit: "/10" },
        { metric: "Journal Entries", thisWeek: thisWeekJournals.length, lastWeek: lastWeekJournals.length, unit: "" },
        { metric: "Check-Ins", thisWeek: thisWeekMoods.length, lastWeek: lastWeekMoods.length, unit: "" },
      ]);
    } catch (error) {
      console.error("Error fetching premium data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mood-Sleep correlation insight
  const correlationInsight = useMemo(() => {
    const daysWithBoth = correlationData.filter(d => d.sleep > 0 && d.mood > 0);
    if (daysWithBoth.length < 3) return null;

    const goodSleepDays = daysWithBoth.filter(d => d.sleep >= 7);
    const poorSleepDays = daysWithBoth.filter(d => d.sleep < 6);

    const goodSleepMoodAvg = goodSleepDays.length > 0
      ? goodSleepDays.reduce((s, d) => s + d.mood, 0) / goodSleepDays.length
      : 0;
    const poorSleepMoodAvg = poorSleepDays.length > 0
      ? poorSleepDays.reduce((s, d) => s + d.mood, 0) / poorSleepDays.length
      : 0;

    const moodDifference = goodSleepMoodAvg - poorSleepMoodAvg;
    const goodSleepCravingAvg = goodSleepDays.length > 0
      ? goodSleepDays.reduce((s, d) => s + d.craving, 0) / goodSleepDays.length
      : 0;
    const poorSleepCravingAvg = poorSleepDays.length > 0
      ? poorSleepDays.reduce((s, d) => s + d.craving, 0) / poorSleepDays.length
      : 0;

    return {
      goodSleepMoodAvg: Math.round(goodSleepMoodAvg * 10) / 10,
      poorSleepMoodAvg: Math.round(poorSleepMoodAvg * 10) / 10,
      moodDifference: Math.round(moodDifference * 10) / 10,
      goodSleepCravingAvg: Math.round(goodSleepCravingAvg * 10) / 10,
      poorSleepCravingAvg: Math.round(poorSleepCravingAvg * 10) / 10,
      dataPoints: daysWithBoth.length,
      goodSleepDays: goodSleepDays.length,
      poorSleepDays: poorSleepDays.length,
    };
  }, [correlationData]);

  const handleExportData = async () => {
    if (!user) return;
    try {
      const [moods, journals, triggers, sleeps] = await Promise.all([
        supabase.from("mood_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("journal_entries").select("title, content, created_at, tags, mood_score").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("trigger_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("sleep_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        daysSober,
        moods: moods.data || [],
        journals: journals.data || [],
        triggers: triggers.data || [],
        sleep: sleeps.data || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recovery-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch {
      toast.error("Failed to export data");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="card-enhanced p-4 animate-pulse">
            <div className="h-4 w-32 bg-secondary rounded mb-3" />
            <div className="h-20 bg-secondary/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mood-Sleep Correlation */}
      {correlationInsight && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-enhanced p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10">
              <Brain className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-sm font-semibold text-foreground">Sleep-Mood Correlation</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">PRO</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">
            Based on {correlationInsight.dataPoints} days of data
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-1 mb-1">
                <Moon className="w-3 h-3 text-indigo-400" />
                <span className="text-[9px] text-muted-foreground">Good Sleep (7h+)</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">{correlationInsight.goodSleepMoodAvg}</span>
                <span className="text-[9px] text-muted-foreground">avg mood</span>
              </div>
              <p className="text-[8px] text-emerald-500 mt-0.5">Craving: {correlationInsight.goodSleepCravingAvg}/10</p>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-1 mb-1">
                <Moon className="w-3 h-3 text-red-400" />
                <span className="text-[9px] text-muted-foreground">Poor Sleep (&lt;6h)</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">{correlationInsight.poorSleepMoodAvg}</span>
                <span className="text-[9px] text-muted-foreground">avg mood</span>
              </div>
              <p className="text-[8px] text-red-400 mt-0.5">Craving: {correlationInsight.poorSleepCravingAvg}/10</p>
            </div>
          </div>

          {correlationInsight.moodDifference > 0 && (
            <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] text-foreground">
                💡 <span className="font-medium">Insight:</span> On nights you sleep 7+ hours, your mood is{" "}
                <span className="font-bold text-emerald-500">{correlationInsight.moodDifference} points higher</span> and cravings are{" "}
                <span className="font-bold text-emerald-500">{Math.round((correlationInsight.poorSleepCravingAvg - correlationInsight.goodSleepCravingAvg) * 10) / 10} points lower</span>.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Trigger Pattern Breakdown */}
      {triggerBreakdown.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-enhanced p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-sm font-semibold text-foreground">Trigger Patterns</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">PRO</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">Top triggers over the past 30 days</p>

          <div className="space-y-2">
            {triggerBreakdown.map((t, i) => {
              const resistRate = t.count > 0 ? Math.round((t.resistedCount / t.count) * 100) : 0;
              return (
                <div key={t.trigger} className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-foreground w-20 truncate capitalize">{t.trigger}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${resistRate}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className={`h-full rounded-full ${resistRate >= 75 ? "bg-emerald-500" : resistRate >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground w-14 text-right">
                    {resistRate}% resisted
                  </span>
                  <span className="text-[8px] text-muted-foreground/60 w-8 text-right">×{t.count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Week-over-Week Comparison */}
      {weekComparison.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-enhanced p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Week Comparison</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">PRO</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {weekComparison.map(w => {
              const isCraving = w.metric === "Avg Craving";
              const diff = w.thisWeek - w.lastWeek;
              const improved = isCraving ? diff < 0 : diff > 0;
              const unchanged = Math.abs(diff) < 0.1;

              return (
                <div key={w.metric} className="p-2 rounded-xl bg-secondary/50 border border-border/30">
                  <p className="text-[9px] text-muted-foreground mb-1">{w.metric}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-foreground">{w.thisWeek}{w.unit}</span>
                    {!unchanged && (
                      <span className={`text-[9px] flex items-center ${improved ? "text-emerald-500" : "text-red-400"}`}>
                        {improved ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                        {isCraving ? (diff < 0 ? "" : "+") : (diff > 0 ? "+" : "")}{Math.round(diff * 10) / 10}
                      </span>
                    )}
                    {unchanged && <Minus className="w-2.5 h-2.5 text-muted-foreground" />}
                  </div>
                  <p className="text-[8px] text-muted-foreground/60">Last week: {w.lastWeek}{w.unit}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Export Data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportData}
          className="w-full h-9 text-xs gap-2 border-amber-500/20 text-amber-600 hover:bg-amber-500/5"
        >
          <Download className="w-3.5 h-3.5" />
          Export All Recovery Data
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">PRO</span>
        </Button>
      </motion.div>
    </div>
  );
};
