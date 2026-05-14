import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalDateString } from "@/lib/dailyReset";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ComebackWelcomeProps {
  sobrietyStartDate?: string | null;
  displayName?: string | null;
  onResetCounter?: () => Promise<void> | void;
  onNavigateCheckIn?: () => void;
}

const DISMISS_KEY = "sober_club_comeback_dismissed_v1";

/**
 * Detects when a user is returning after 3+ days of inactivity and shows a
 * non-judgmental "welcome back" screen instead of letting them face a stale
 * dashboard or a hard counter reset.
 */
export const ComebackWelcome = ({
  sobrietyStartDate,
  displayName,
  onResetCounter,
  onNavigateCheckIn,
}: ComebackWelcomeProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [gapDays, setGapDays] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const check = async () => {
      const today = getLocalDateString();

      // Already shown today? Don't nag.
      const lastShown = localStorage.getItem(`${DISMISS_KEY}:${user.id}`);
      if (lastShown === today) return;

      // Pull the most recent activity signal from mood + daily_goals.
      const [moodRes, goalsRes] = await Promise.all([
        supabase
          .from("mood_entries")
          .select("date")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("daily_goals")
          .select("date")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const dates = [moodRes.data?.date, goalsRes.data?.date].filter(
        Boolean,
      ) as string[];
      if (dates.length === 0) return; // brand new user — no comeback needed

      const lastActivity = dates.sort().pop()!;
      const last = new Date(lastActivity + "T00:00:00");
      const now = new Date(today + "T00:00:00");
      const diff = Math.floor(
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (cancelled) return;
      if (diff >= 3) {
        setGapDays(diff);
        setOpen(true);
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const dismiss = (markShown = true) => {
    if (user && markShown) {
      localStorage.setItem(
        `${DISMISS_KEY}:${user.id}`,
        getLocalDateString(),
      );
    }
    setOpen(false);
  };

  const handleStillSober = () => {
    toast.success("Welcome back. Your streak is intact. 💛");
    dismiss();
  };

  const handleSlip = () => {
    setConfirmReset(true);
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      await onResetCounter?.();
      toast.success("New chapter begins today. We're proud you're back. 🌱");
      setConfirmReset(false);
      dismiss();
    } catch (e) {
      toast.error("Couldn't update your counter. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  const handleCheckIn = () => {
    dismiss();
    onNavigateCheckIn?.();
  };

  const firstName = displayName?.split(" ")[0];

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
        <DialogContent className="max-w-sm border-primary/30 bg-gradient-to-br from-background to-primary/5">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="mx-auto mb-2 w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40 flex items-center justify-center"
            >
              <Heart className="w-7 h-7 text-primary" />
            </motion.div>
            <DialogTitle className="text-center text-xl">
              {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed">
              It's been{" "}
              <span className="text-foreground font-semibold">
                {gapDays} days
              </span>{" "}
              since your last check-in. No judgment — recovery isn't linear, and
              showing up again is what counts.
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2 pt-2"
            >
              <Button
                onClick={handleStillSober}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                I'm still on track
              </Button>
              <Button
                onClick={handleCheckIn}
                variant="outline"
                className="w-full"
              >
                Do today's check-in
              </Button>
              {sobrietyStartDate && onResetCounter && (
                <Button
                  onClick={handleSlip}
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  I had a slip — start fresh
                </Button>
              )}
            </motion.div>
            <p className="text-[11px] text-center text-muted-foreground pt-2">
              You can always come back. That's the only rule.
            </p>
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              This resets your sobriety counter to today. Your history, journal,
              and badges all stay. A slip isn't a failure — it's data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>
              Not yet
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmReset();
              }}
              disabled={resetting}
            >
              {resetting ? "Saving…" : "Reset counter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
