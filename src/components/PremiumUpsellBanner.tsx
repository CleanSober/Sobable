import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface PremiumUpsellBannerProps {
  message?: string;
  context?: string;
}

export const PremiumUpsellBanner = memo(({ 
  message = "Unlock AI-powered recovery tools",
  context = "home"
}: PremiumUpsellBannerProps) => {
  const { isPremium, loading } = usePremiumStatus();
  const [dismissed, setDismissed] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  if (loading || isPremium || dismissed) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 p-3"
        >
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-background/50 transition"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{message}</p>
              <p className="text-[10px] text-muted-foreground">Starting at $2.92/mo · Cancel anytime</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowPricing(true)}
              className="h-7 px-3 text-[11px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex-shrink-0"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-md p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
          <PricingPlans onClose={() => setShowPricing(false)} featureContext="Sober Club" />
        </DialogContent>
      </Dialog>
    </>
  );
});

PremiumUpsellBanner.displayName = "PremiumUpsellBanner";
