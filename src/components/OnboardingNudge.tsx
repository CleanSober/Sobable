import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Wind,
  AlertTriangle,
  Shield,
  Sparkles,
  Check,
  ChevronRight,
} from "lucide-react";
import type { TabId } from "@/components/BottomTabs";
import type { LucideIcon } from "lucide-react";

interface OnboardingNudgeProps {
  profileCreatedAt?: string | null;
  onNavigate: (tab: TabId) => void;
}

const SHOWN_KEY = "sober_club_onboarding_nudge_shown_v1";

type FeatureKey = "journal" | "trigger" | "breathing" | "prevention";

interface FeatureItem {
  key: FeatureKey;
  label: string;
  description: string;
  icon: LucideIcon;
  tab: TabId;
}

const FEATURES: FeatureItem[] = [
  {
    key: "journal",
    label: "Write a journal entry",
    description: "Reflect with AI-guided prompts",
    icon: BookOpen,
    tab: "checkin",
  },
  {
    key: "trigger",
    label: "Log a trigger",
    description: "Spot patterns before they spiral",
    icon: AlertTriangle,
    tab: "triggers",
  },
  {
    key: "breathing",
    label: "Try a breathing exercise",
    description: "Reset in 90 seconds",
    icon: Wind,
    tab: "checkin",
  },
  {
    key: "prevention",
    label: "Build a prevention plan",
    description: "Your toolkit for hard moments",
    icon: Shield,
    tab: "triggers",
  },
];

/**
 * One-time nudge shown 3–7 days after signup that surfaces features the user
 * hasn't tried yet. Fires once, then persists a flag so we never nag again.
 */
export const OnboardingNudge = ({
  profileCreatedAt,
  onNavigate,
}: OnboardingNudgeProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [missing, setMissing] = useState<FeatureItem[]>([]);
  const [tried, setTried] = useState<FeatureKey[]>([]);

  useEffect(() => {
    if (!user || !profileCreatedAt) return;

    const flagKey = `${SHOWN_KEY}:${user.id}`;
    if (localStorage.getItem(flagKey)) return;

    // Only show during week 1 window: days 3..7
    const created = new Date(profileCreatedAt).getTime();
    const ageDays = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
    if (ageDays < 3 || ageDays > 7) return;

    let cancelled = false;

    (async () => {
      const [journal, trigger, meditation, prevention] = await Promise.all([
        supabase
          .from("journal_entries")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("trigger_entries")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("daily_goals")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("meditation_done", true),
        supabase
          .from("prevention_plans")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      if (cancelled) return;

      const used: Record<FeatureKey, boolean> = {
        journal: (journal.count ?? 0) > 0,
        trigger: (trigger.count ?? 0) > 0,
        breathing: (meditation.count ?? 0) > 0,
        prevention: (prevention.count ?? 0) > 0,
      };

      const missingList = FEATURES.filter((f) => !used[f.key]);
      const triedList = FEATURES.filter((f) => used[f.key]).map((f) => f.key);

      // Don't show if user already tried everything or hasn't engaged at all
      // (the latter is handled by other onboarding flows).
      if (missingList.length === 0 || missingList.length === FEATURES.length) {
        return;
      }

      setMissing(missingList);
      setTried(triedList);
      setOpen(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, profileCreatedAt]);

  const dismiss = () => {
    if (user) {
      localStorage.setItem(`${SHOWN_KEY}:${user.id}`, "1");
    }
    setOpen(false);
  };

  const handleGo = (tab: TabId) => {
    dismiss();
    onNavigate(tab);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="mx-auto mb-2 w-14 h-14 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 border border-accent/40 flex items-center justify-center"
          >
            <Sparkles className="w-7 h-7 text-accent" />
          </motion.div>
          <DialogTitle className="text-center text-xl">
            You're off to a strong start
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {tried.length > 0
              ? `You've already used ${tried.length} tool${tried.length > 1 ? "s" : ""}. Here's what else is waiting for you:`
              : "A few more tools could give your week a real boost:"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-1">
          {missing.slice(0, 3).map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.button
                key={f.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => handleGo(f.tab)}
                className="w-full p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex items-center gap-3 text-left"
              >
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {f.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {f.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.button>
            );
          })}
        </div>

        {tried.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
            <Check className="w-3 h-3 text-primary" />
            {tried.length} of {FEATURES.length} tools tried
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={dismiss} className="mt-1">
          Maybe later
        </Button>
      </DialogContent>
    </Dialog>
  );
};
