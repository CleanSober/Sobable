import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface PremiumLockOverlayProps {
  children: React.ReactNode;
  featureName?: string;
}

export const PremiumLockOverlay = ({ children, featureName = "this feature" }: PremiumLockOverlayProps) => {
  const { isPremium, loading } = usePremiumStatus();
  const [showPricing, setShowPricing] = useState(false);

  if (loading || isPremium) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden">
        {/* Faded preview content */}
        <div className="opacity-40 blur-[1px] pointer-events-none select-none" aria-hidden="true">
          {children}
        </div>

        {/* Lock overlay */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowPricing(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-background/30 via-background/60 to-background/80 cursor-pointer group"
        >
          <div className="p-2.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div className="text-center px-4">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1 justify-center">
              <Crown className="w-3 h-3 text-amber-500" />
              Sober Club
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Unlock {featureName}
            </p>
          </div>
          <span className="text-[10px] font-medium text-amber-500 group-hover:underline flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3" />
            Try free for 7 days
          </span>
        </motion.button>
      </div>

      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <PricingPlans onClose={() => setShowPricing(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
