import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, ChevronRight, Lock, Shield, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface PremiumFeature {
  name: string;
  icon?: React.ReactNode;
}

interface PremiumFeatureSectionProps {
  children: React.ReactNode;
  features: PremiumFeature[];
  title?: string;
}

export const PremiumFeatureSection = ({ 
  children, 
  features, 
  title = "Premium Features" 
}: PremiumFeatureSectionProps) => {
  const { isPremium, loading } = usePremiumStatus();
  const [showPricing, setShowPricing] = useState(false);

  if (loading || isPremium) {
    return <>{children}</>;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.03] overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/25 to-orange-500/25 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="text-[10px] text-muted-foreground">Sober Club</p>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div className="px-4 pb-2 space-y-1.5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.06 }}
              className="flex items-center gap-2.5 py-1.5"
            >
              <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-3 h-3 text-amber-500/70" />
              </div>
              <span className="text-xs text-foreground/80 capitalize">{feature.name}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowPricing(true)}
          className="w-full px-4 py-3 border-t border-amber-500/10 flex items-center justify-between group hover:bg-amber-500/[0.04] transition-colors active:scale-[0.99]"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-xs font-semibold text-amber-500">Unlock All Features</span>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-500/50 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
        </button>
      </motion.div>

      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <PricingPlans onClose={() => setShowPricing(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
