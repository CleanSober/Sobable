import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Crown, Sparkles, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface PremiumLockOverlayProps {
  children: React.ReactNode;
  featureName?: string;
  icon?: React.ReactNode;
}

export const PremiumLockOverlay = ({ children, featureName = "this feature", icon }: PremiumLockOverlayProps) => {
  const { isPremium, loading } = usePremiumStatus();
  const [showPricing, setShowPricing] = useState(false);

  if (loading || isPremium) {
    return <>{children}</>;
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setShowPricing(true)}
        className="w-full rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.04] p-4 text-left group hover:border-amber-500/30 transition-all duration-200 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber-500" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate">
                {featureName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500/70 flex-shrink-0" />
              <span className="text-[10px] text-muted-foreground">
                Sober Club · Try free for 7 days
              </span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-4 h-4 text-amber-500/50 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>
      </motion.button>

      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <PricingPlans onClose={() => setShowPricing(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
