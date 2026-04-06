import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";
import { setPaywallVisibility } from "@/lib/paywallVisibility";

interface MilestoneUpgradePromptProps {
  prompt: { title: string; message: string; emoji: string } | null;
  onDismiss: () => void;
  onUpgrade: () => void;
  showPricing: boolean;
  onPricingChange: (open: boolean) => void;
}

export const MilestoneUpgradePrompt = memo(({
  prompt,
  onDismiss,
  onUpgrade,
  showPricing,
  onPricingChange,
}: MilestoneUpgradePromptProps) => {
  return (
    <>
      <AnimatePresence>
        {prompt && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 left-3 right-3 z-50 max-w-lg mx-auto"
          >
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-amber-500/10">
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/5 pointer-events-none" />
              
              <button
                onClick={onDismiss}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition z-10"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-2xl">
                    {prompt.emoji}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <h3 className="text-sm font-bold text-foreground">{prompt.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{prompt.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    onClick={onUpgrade}
                    size="sm"
                    className="flex-1 h-9 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Join Sober Club
                  </Button>
                  <Button
                    onClick={onDismiss}
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs text-muted-foreground"
                  >
                    Maybe later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showPricing} onOpenChange={(open) => {
        onPricingChange(open);
        setPaywallVisibility(open);
      }}>
        <DialogContent className="max-w-md p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
          <PricingPlans onClose={() => {
            onPricingChange(false);
            setPaywallVisibility(false);
          }} featureContext="Sober Club" />
        </DialogContent>
      </Dialog>
    </>
  );
});

MilestoneUpgradePrompt.displayName = "MilestoneUpgradePrompt";
