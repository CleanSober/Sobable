import { useState } from "react";
import { motion } from "framer-motion";
import { Award, ChevronRight, Lock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { badges } from "@/lib/badges";
import { AchievementBadges } from "@/components/AchievementBadges";

interface Props {
  daysSober: number;
  startDate?: string;
}

/**
 * Compact dashboard summary of achievement badges.
 * Shows count, next-up badge with progress, and a few recent unlocks.
 * Tapping "View all" opens the full AchievementBadges grid in a modal.
 */
export const AchievementBadgesPreview = ({ daysSober, startDate }: Props) => {
  const [open, setOpen] = useState(false);

  const unlocked = badges.filter((b) => daysSober >= b.daysRequired);
  const locked = badges.filter((b) => daysSober < b.daysRequired);
  const nextBadge = locked[0];
  const daysToNext = nextBadge ? nextBadge.daysRequired - daysSober : 0;
  const progressPct = nextBadge
    ? Math.max(0, Math.min(100, ((nextBadge.daysRequired - daysToNext) / nextBadge.daysRequired) * 100))
    : 100;

  // Show up to the 5 most recently unlocked badges, then the next-up as a 6th tile
  const recentUnlocked = [...unlocked].reverse().slice(0, 5);

  return (
    <>
      <Card className="gradient-card border-border/50 overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-primary" />
              Achievement Badges
            </CardTitle>
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {unlocked.length}/{badges.length}
            </span>
          </div>
          {nextBadge && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                {daysToNext}d → <span className="text-primary font-medium">{nextBadge.name}</span>
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="px-3 pb-3">
          {/* Mini badge row */}
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {recentUnlocked.map((badge) => {
              const Icon = badge.icon;
              return (
                <button
                  key={badge.id}
                  onClick={() => setOpen(true)}
                  aria-label={badge.name}
                  className={`relative aspect-square rounded-lg flex items-center justify-center bg-gradient-to-br ${badge.color} border border-white/20 active:scale-95 transition-transform`}
                >
                  <Icon className="w-4 h-4 text-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-card flex items-center justify-center">
                    <Star className="w-1.5 h-1.5 text-white" />
                  </span>
                </button>
              );
            })}
            {/* Fill remaining slots */}
            {Array.from({ length: Math.max(0, 6 - recentUnlocked.length) }).map((_, i) => {
              const isNextSlot = i === 0 && nextBadge;
              return (
                <button
                  key={`empty-${i}`}
                  onClick={() => setOpen(true)}
                  aria-label={isNextSlot ? `Next up: ${nextBadge?.name}` : "Locked badge"}
                  className={`aspect-square rounded-lg flex items-center justify-center border ${
                    isNextSlot
                      ? "bg-muted/40 border-primary/40 border-dashed"
                      : "bg-muted/30 border-border/40"
                  }`}
                >
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors text-xs font-medium text-foreground active:scale-[0.99]"
          >
            <span>View all badges</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-4 gap-3">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Award className="w-4 h-4 text-primary" />
              Achievement Badges
            </DialogTitle>
          </DialogHeader>
          <AchievementBadges daysSober={daysSober} startDate={startDate} />
        </DialogContent>
      </Dialog>
    </>
  );
};
