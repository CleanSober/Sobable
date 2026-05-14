import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Wind, BookHeart, ShieldAlert, Target, Heart, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMoodEntries } from "@/hooks/useUserData";
import { useTodayLocal } from "@/lib/dailyReset";
import { cn } from "@/lib/utils";
import type { TabId } from "@/components/BottomTabs";

interface NextBestActionProps {
  onNavigate: (tab: TabId) => void;
  onOpenSOS?: () => void;
  onOpenCoach?: () => void;
}

interface Suggestion {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  icon: React.ElementType;
  gradient: string; // from-x to-y
  priority: number;
  action: () => void;
}

export const NextBestAction = ({ onNavigate, onOpenSOS, onOpenCoach }: NextBestActionProps) => {
  const { user } = useAuth();
  const { getTodaysMoodEntry } = useMoodEntries();
  const today = useTodayLocal();

  const [moodDone, setMoodDone] = useState<boolean | null>(null);
  const [todayCraving, setTodayCraving] = useState<number | null>(null);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [goals, setGoals] = useState({
    mood_logged: false,
    trigger_logged: false,
    meditation_done: false,
    journal_written: false,
  });
  const [hour] = useState(() => new Date().getHours());

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setMoodDone(false);
      return;
    }

    (async () => {
      const entry = await getTodaysMoodEntry();
      if (cancelled) return;
      setMoodDone(!!entry);
      setTodayCraving(entry?.craving_level ?? null);
      setTodayMood(entry?.mood ?? null);

      const { data } = await supabase
        .from("daily_goals")
        .select("mood_logged, trigger_logged, meditation_done, journal_written")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();
      if (cancelled || !data) return;
      setGoals({
        mood_logged: !!data.mood_logged,
        trigger_logged: !!data.trigger_logged,
        meditation_done: !!data.meditation_done,
        journal_written: !!data.journal_written,
      });
    })();

    return () => { cancelled = true; };
  }, [user, today]);

  const suggestion = useMemo<Suggestion | null>(() => {
    if (moodDone === null) return null;

    const list: Suggestion[] = [];

    // 1. High craving → emergency-style suggestion
    if ((todayCraving ?? 0) >= 7) {
      list.push({
        id: "sos",
        title: "Craving spike detected",
        subtitle: "Try a 60-second breathing reset to ride the wave.",
        cta: "Open SOS",
        icon: ShieldAlert,
        gradient: "from-rose-500 to-amber-500",
        priority: 100,
        action: () => onOpenSOS?.(),
      });
    }

    // 2. Low mood → journal
    if (todayMood !== null && todayMood <= 4 && !goals.journal_written) {
      list.push({
        id: "journal",
        title: "Mood feels heavy today",
        subtitle: "A 2-minute journal can help untangle what's going on.",
        cta: "Write entry",
        icon: BookHeart,
        gradient: "from-emerald-400 to-teal-500",
        priority: 85,
        action: () => onNavigate("progress"),
      });
    }

    // 3. No check-in yet today
    if (!moodDone) {
      const morning = hour < 12;
      list.push({
        id: "checkin",
        title: morning ? "Start your day strong" : "Quick check-in",
        subtitle: morning
          ? "Log your mood to set the tone for today."
          : "Take 30 seconds to capture how today went.",
        cta: "Check in",
        icon: Sparkles,
        gradient: "from-amber-400 to-orange-500",
        priority: 80,
        action: () => onNavigate("checkin"),
      });
    }

    // 4. No trigger logged & it's evening
    if (moodDone && !goals.trigger_logged && hour >= 17) {
      list.push({
        id: "trigger",
        title: "Reflect on today's triggers",
        subtitle: "Logging triggers helps you spot patterns over time.",
        cta: "Log a trigger",
        icon: Target,
        gradient: "from-rose-400 to-pink-500",
        priority: 60,
        action: () => onNavigate("triggers"),
      });
    }

    // 5. Meditation not done, mid-day
    if (!goals.meditation_done && hour >= 10 && hour < 22) {
      list.push({
        id: "meditation",
        title: "Take a mindful pause",
        subtitle: "A short breathing session can reset your focus.",
        cta: "Start breathing",
        icon: Wind,
        gradient: "from-violet-400 to-purple-500",
        priority: 50,
        action: () => onNavigate("triggers"),
      });
    }

    // 6. Everything done → celebrate
    if (
      moodDone &&
      goals.trigger_logged &&
      goals.meditation_done &&
      goals.journal_written
    ) {
      list.push({
        id: "celebrate",
        title: "You completed every ritual today",
        subtitle: "Great work. Want to share your wins or talk to your coach?",
        cta: "Open coach",
        icon: Heart,
        gradient: "from-fuchsia-500 to-pink-500",
        priority: 40,
        action: () => onOpenCoach?.(),
      });
    }

    // 7. Default fallback when mood is logged
    if (list.length === 0) {
      list.push({
        id: "good",
        title: "You're on track",
        subtitle: "Keep the streak going — explore your progress so far.",
        cta: "View progress",
        icon: CheckCircle2,
        gradient: "from-teal-400 to-emerald-500",
        priority: 10,
        action: () => onNavigate("progress"),
      });
    }

    list.sort((a, b) => b.priority - a.priority);
    return list[0];
  }, [moodDone, todayCraving, todayMood, goals, hour, onNavigate, onOpenSOS, onOpenCoach]);

  if (!suggestion) return null;

  const Icon = suggestion.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.button
        key={suggestion.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.25 }}
        onClick={suggestion.action}
        className="w-full text-left card-enhanced overflow-hidden relative group"
        aria-label={suggestion.cta}
      >
        <div
          className={cn(
            "absolute inset-0 opacity-15 bg-gradient-to-br pointer-events-none",
            suggestion.gradient
          )}
        />
        <div className="relative p-3.5 flex items-center gap-3">
          <div
            className={cn(
              "shrink-0 p-2.5 rounded-xl bg-gradient-to-br shadow-sm",
              suggestion.gradient
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Next best action
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground truncate">
              {suggestion.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {suggestion.subtitle}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-xs font-medium text-foreground/80 group-hover:text-foreground">
            <span className="hidden sm:inline">{suggestion.cta}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.button>
    </AnimatePresence>
  );
};

export default NextBestAction;
