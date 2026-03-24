import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Shield, MessageSquare, Users, Bot, Brain, Compass, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";

interface PremiumGateProps {
  onUpgrade?: () => void;
}

const highlights = [
  { icon: Bot, text: "AI Recovery Coach — 24/7 support" },
  { icon: Brain, text: "Predictive Insights & Risk Score" },
  { icon: Users, text: "Accountability Partner matching" },
  { icon: Compass, text: "Guided Recovery Pathways" },
  { icon: MessageSquare, text: "Forums & real-time chat rooms" },
  { icon: Zap, text: "Ad-free experience" },
] as const;

export const PremiumGate = memo(({ onUpgrade }: PremiumGateProps) => {
  const [showPricing, setShowPricing] = useState(false);

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setShowPricing(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[60vh] px-4"
      >
        <Card className="max-w-sm w-full gradient-card border-primary/20 shadow-xl shadow-primary/5">
          <CardContent className="pt-5 pb-4 text-center space-y-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
              className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
            >
              <Crown className="w-7 h-7 text-white" aria-hidden="true" />
            </motion.div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Join 2,400+ in Sober Club</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlock the full recovery toolkit
              </p>
            </div>

            <div className="flex items-center justify-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">4.9/5</span>
            </div>

            <ul className="space-y-2 text-left bg-secondary/50 rounded-xl p-3" role="list">
              {highlights.map(({ icon: Icon, text }, index) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-xs text-foreground">{text}</span>
                </motion.li>
              ))}
            </ul>

            <Button 
              onClick={handleUpgradeClick}
              className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
            >
              <Crown className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Upgrade to Premium
            </Button>

            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" aria-hidden="true" />
              Secure payment · Cancel anytime
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-md p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
          <PricingPlans onClose={() => setShowPricing(false)} featureContext="Community" />
        </DialogContent>
      </Dialog>
    </>
  );
});

PremiumGate.displayName = "PremiumGate";
