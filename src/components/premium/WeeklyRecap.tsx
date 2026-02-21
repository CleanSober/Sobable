import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Share2, Crown, Calendar, TrendingUp, Heart, Moon, Flame, Award, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeekStats {
  moodAvg: number;
  sleepAvg: number;
  journalCount: number;
  goalsCompleted: number;
  totalGoals: number;
  triggersResisted: number;
  totalTriggers: number;
  daysSober: number;
  moneySaved: number;
}

interface WeeklyRecapProps {
  daysSober: number;
  moneySaved: number;
}

export const WeeklyRecap = ({ daysSober, moneySaved }: WeeklyRecapProps) => {
  const { isPremium } = usePremiumStatus();
  const { user } = useAuth();
  const [stats, setStats] = useState<WeekStats | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPremium || !user) { setLoading(false); return; }

    const fetchWeekStats = async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const startStr = weekAgo.toISOString().split("T")[0];
      const endStr = now.toISOString().split("T")[0];

      const [moodRes, sleepRes, journalRes, goalsRes, triggerRes] = await Promise.all([
        supabase.from("mood_entries").select("mood").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
        supabase.from("sleep_entries").select("hours_slept").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
        supabase.from("journal_entries").select("id").eq("user_id", user.id).gte("created_at", weekAgo.toISOString()),
        supabase.from("daily_goals").select("mood_logged, journal_written, meditation_done").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
        supabase.from("trigger_entries").select("outcome").eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
      ]);

      const moods = moodRes.data || [];
      const sleeps = sleepRes.data || [];
      const goals = goalsRes.data || [];
      const triggers = triggerRes.data || [];

      setStats({
        moodAvg: moods.length > 0 ? moods.reduce((a, b) => a + b.mood, 0) / moods.length : 0,
        sleepAvg: sleeps.length > 0 ? sleeps.reduce((a, b) => a + Number(b.hours_slept), 0) / sleeps.length : 0,
        journalCount: journalRes.data?.length || 0,
        goalsCompleted: goals.filter(g => g.mood_logged && g.journal_written && g.meditation_done).length,
        totalGoals: goals.length,
        triggersResisted: triggers.filter(t => t.outcome === "resisted" || t.outcome === "stayed_sober").length,
        totalTriggers: triggers.length,
        daysSober,
        moneySaved,
      });
      setLoading(false);
    };

    fetchWeekStats();
  }, [isPremium, user, daysSober, moneySaved]);

  const handleShare = async () => {
    const s = stats || displayStats;
    const text = s
      ? `🎉 My Recovery Week Recap:\n🔥 ${s.daysSober} days sober\n😊 Mood: ${s.moodAvg.toFixed(1)}/10\n😴 Sleep: ${s.sleepAvg.toFixed(1)}h avg\n📝 ${s.journalCount} journal entries\n💰 $${s.moneySaved.toFixed(0)} saved\n\n#Recovery #Sobable`
      : "";

    if (navigator.share) {
      try {
        await navigator.share({ title: "My Recovery Week", text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  if (loading) return null;

  const displayStats: WeekStats = stats || {
    moodAvg: 7.2, sleepAvg: 7.5, journalCount: 5, goalsCompleted: 4,
    totalGoals: 7, triggersResisted: 3, totalTriggers: 4, daysSober, moneySaved
  };

  const highlights = [
    { icon: Heart, label: "Mood", value: `${displayStats.moodAvg.toFixed(1)}/10`, color: "text-pink-500", bg: "bg-pink-500/10" },
    { icon: Moon, label: "Sleep", value: `${displayStats.sleepAvg.toFixed(1)}h`, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { icon: Flame, label: "Streak", value: `${displayStats.daysSober}d`, color: "text-accent", bg: "bg-accent/10" },
    { icon: Award, label: "Goals", value: `${displayStats.goalsCompleted}/${displayStats.totalGoals}`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="card-enhanced overflow-hidden" ref={cardRef}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-bold text-foreground">Weekly Recap</h3>
                  <Crown className="w-3 h-3 text-accent" />
                </div>
                <p className="text-[9px] text-muted-foreground">Your progress this week</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={handleShare}>
              <Share2 className="w-3 h-3 mr-1" /> Share
            </Button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col items-center p-2 rounded-xl ${h.bg}`}
              >
                <h.icon className={`w-3.5 h-3.5 ${h.color} mb-0.5`} />
                <span className={`text-sm font-bold ${h.color}`}>{h.value}</span>
                <span className="text-[8px] text-muted-foreground">{h.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Summary bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">
                {displayStats.journalCount} journal entries • {displayStats.triggersResisted}/{displayStats.totalTriggers} triggers managed
              </span>
            </div>
            <span className="text-[10px] font-bold text-accent">${displayStats.moneySaved.toFixed(0)} saved</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
