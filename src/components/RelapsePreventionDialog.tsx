import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Heart, ListChecks, Phone, ArrowRight, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserData } from "@/hooks/useUserData";
import { hapticSuccess, makePhoneCall } from "@/lib/nativeActions";

interface RelapsePreventionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Phase = "inhale" | "hold" | "exhale";
const PHASE_DURATIONS: Record<Phase, number> = { inhale: 4, hold: 7, exhale: 8 };
const PHASE_LABELS: Record<Phase, string> = {
  inhale: "Breathe in",
  hold: "Hold",
  exhale: "Breathe out",
};
const TOTAL_BREATH_CYCLES = 3;

const COPING_STEPS = [
  "Name the feeling out loud — 'this is a craving, not a command.'",
  "Drink a full glass of cold water, slowly.",
  "Move your body for 60 seconds — stretch, walk, or shake it out.",
  "Text or call one safe person right now.",
  "Picture yourself 30 minutes from now, urge gone, proud you waited.",
];

export const RelapsePreventionDialog = ({ open, onOpenChange }: RelapsePreventionDialogProps) => {
  const { profile } = useUserData();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [cycle, setCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(PHASE_DURATIONS.inhale);
  const [checked, setChecked] = useState<boolean[]>(() => COPING_STEPS.map(() => false));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state whenever dialog opens
  useEffect(() => {
    if (open) {
      setStep(0);
      setPhase("inhale");
      setCycle(1);
      setSecondsLeft(PHASE_DURATIONS.inhale);
      setChecked(COPING_STEPS.map(() => false));
    }
  }, [open]);

  // Run breathing timer only on step 0 while dialog is open
  useEffect(() => {
    if (!open || step !== 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // Advance phase
        setPhase((prev) => {
          if (prev === "inhale") {
            setSecondsLeft(PHASE_DURATIONS.hold);
            return "hold";
          }
          if (prev === "hold") {
            setSecondsLeft(PHASE_DURATIONS.exhale);
            return "exhale";
          }
          // exhale -> next cycle
          setCycle((c) => {
            if (c >= TOTAL_BREATH_CYCLES) {
              hapticSuccess().catch(() => {});
              setStep(1);
              return c;
            }
            return c + 1;
          });
          setSecondsLeft(PHASE_DURATIONS.inhale);
          return "inhale";
        });
        return 1; // placeholder; real value set above
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, step]);

  const breathProgress = useMemo(() => {
    const totalCycleSeconds = PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold + PHASE_DURATIONS.exhale;
    const elapsedInPhase = PHASE_DURATIONS[phase] - secondsLeft;
    const phaseOffset =
      phase === "inhale" ? 0 : phase === "hold" ? PHASE_DURATIONS.inhale : PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold;
    const cycleProgress = (phaseOffset + elapsedInPhase) / totalCycleSeconds;
    return ((cycle - 1 + cycleProgress) / TOTAL_BREATH_CYCLES) * 100;
  }, [phase, secondsLeft, cycle]);

  const allChecked = checked.every(Boolean);
  const why = profile?.personal_reminder?.trim();

  const toggleStep = (i: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    hapticSuccess().catch(() => {});
  };

  const finish = async () => {
    await hapticSuccess().catch(() => {});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white text-xs font-bold">
              SOS
            </span>
            Relapse-Prevention Routine
          </DialogTitle>
          <DialogDescription className="text-xs">
            Step {step + 1} of 3 — you're doing the right thing by being here.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pt-3">
          <Progress value={((step + 1) / 3) * 100} className="h-1.5" />
        </div>

        <div className="p-5 pt-4">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="breathe"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Wind className="w-3.5 h-3.5" /> 4-7-8 breathing · cycle {cycle}/{TOTAL_BREATH_CYCLES}
                </div>
                <motion.div
                  className="relative my-4 w-44 h-44 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-500/30 flex items-center justify-center"
                  animate={{
                    scale: phase === "inhale" ? 1.15 : phase === "hold" ? 1.15 : 0.85,
                  }}
                  transition={{ duration: secondsLeft, ease: "easeInOut" }}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">{PHASE_LABELS[phase]}</div>
                    <div className="text-4xl font-bold tabular-nums text-foreground">{secondsLeft}</div>
                  </div>
                </motion.div>
                <Progress value={breathProgress} className="h-1 w-full" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={() => setStep(1)}
                >
                  Skip breathing <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="coping"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <ListChecks className="w-3.5 h-3.5" /> Urge-surfing checklist
                </div>
                <ul className="space-y-2">
                  {COPING_STEPS.map((text, i) => (
                    <li key={i}>
                      <button
                        onClick={() => toggleStep(i)}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${
                          checked[i]
                            ? "bg-primary/10 border-primary/40"
                            : "bg-secondary/40 border-transparent hover:bg-secondary/60"
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${
                            checked[i] ? "bg-primary border-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          {checked[i] && <Check className="w-3 h-3" />}
                        </span>
                        <span className={`text-sm ${checked[i] ? "text-foreground" : "text-muted-foreground"}`}>
                          {text}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-4"
                  onClick={() => setStep(2)}
                  disabled={!allChecked}
                >
                  {allChecked ? "Continue" : `Check off all ${COPING_STEPS.length} steps`}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="why"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Heart className="w-3.5 h-3.5" /> Remember your why
                </div>
                <div className="rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 p-4 text-center">
                  {why ? (
                    <p className="text-base font-medium text-foreground leading-relaxed">"{why}"</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Add your personal reminder in Settings so it appears here next time.
                    </p>
                  )}
                </div>

                {profile?.sponsor_phone && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => makePhoneCall(profile.sponsor_phone!)}
                  >
                    <Phone className="w-4 h-4 mr-2" /> Call your sponsor
                  </Button>
                )}

                <Button className="w-full mt-3" onClick={finish}>
                  I'm okay — close <Check className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:bg-secondary/60"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
};
