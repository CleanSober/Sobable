import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, DollarSign, ClipboardCheck, LifeBuoy, ChevronRight } from "lucide-react";

interface WelcomeTourProps {
  open: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Flame,
    title: "Your sobriety counter",
    body: "Track every day you stay strong. Your streak lives at the top of Home — tap it any time for a quick boost.",
    accent: "from-orange-500 to-rose-500",
  },
  {
    icon: DollarSign,
    title: "Money saved",
    body: "Watch the savings add up in real time, based on what you used to spend. Set milestones to celebrate.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: ClipboardCheck,
    title: "Daily check-ins",
    body: "A short mood and trigger check-in each day powers your insights, streaks, and personalized recommendations.",
    accent: "from-sky-500 to-indigo-500",
  },
  {
    icon: LifeBuoy,
    title: "Emergency support",
    body: "Feeling shaky? The Emergency button gives instant access to coping tools and your support contacts.",
    accent: "from-amber-500 to-yellow-500",
  },
];

export const WelcomeTour = ({ open, onComplete }: WelcomeTourProps) => {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  const next = () => (isLast ? onComplete() : setStep(s => s + 1));

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onComplete(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${current.accent} text-white shadow-lg`}>
                <Icon className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{current.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"}`}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onComplete} className="text-muted-foreground">
              Skip
            </Button>
            <Button onClick={next} className="flex-1">
              {isLast ? "Get started" : "Next"}
              {!isLast && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
