import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Plus, Minus, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DAILY_GOAL = 8; // glasses

export const HydrationTracker = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const storageKey = user ? `hydration_${user.id}_${today}` : null;

  const [glasses, setGlasses] = useState(0);

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) setGlasses(parseInt(saved, 10));
    }
  }, [storageKey]);

  const updateGlasses = (value: number) => {
    const next = Math.max(0, Math.min(value, 20));
    setGlasses(next);
    if (storageKey) localStorage.setItem(storageKey, String(next));

    if (next === DAILY_GOAL) {
      toast.success("💧 Hydration goal reached! Great job!");
    }
  };

  const pct = Math.min((glasses / DAILY_GOAL) * 100, 100);
  const goalReached = glasses >= DAILY_GOAL;

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Droplets className={`w-4 h-4 ${goalReached ? "text-blue-400" : "text-primary"}`} />
          Hydration
          <span className="ml-auto text-[10px] font-normal text-muted-foreground">
            {glasses}/{DAILY_GOAL} glasses
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-2">
        {/* Water level visual */}
        <div className="relative h-16 rounded-xl bg-secondary/30 overflow-hidden border border-border/30">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/40 to-blue-400/20"
            initial={{ height: 0 }}
            animate={{ height: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">
              {goalReached ? "✅" : `${glasses} 💧`}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateGlasses(glasses - 1)}
            disabled={glasses <= 0}
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <Button
            className="h-9 px-5 text-xs gradient-primary"
            onClick={() => updateGlasses(glasses + 1)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Glass
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateGlasses(0)}
            disabled={glasses === 0}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground">
          {goalReached
            ? "You're well hydrated — keep it up! 🎉"
            : `${DAILY_GOAL - glasses} more to reach your daily goal`}
        </p>
      </CardContent>
    </Card>
  );
};
