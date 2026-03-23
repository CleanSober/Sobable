import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Crown, Loader2, Shield, Bot, Users, Brain,
  Compass, Zap, Heart, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STRIPE_PLANS } from "@/lib/stripe";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

const features = [
  { icon: Bot, text: "AI Recovery Coach" },
  { icon: Brain, text: "Predictive Insights" },
  { icon: Users, text: "Accountability Partner" },
  { icon: Compass, text: "Guided Pathways" },
  { icon: BarChart3, text: "Weekly Recap" },
  { icon: Heart, text: "Community Access" },
  { icon: Zap, text: "Ad-Free Experience" },
];

interface PricingPlansProps {
  onClose?: () => void;
  featureContext?: string;
}

export const PricingPlans = memo(({ onClose, featureContext }: PricingPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const { startCheckout, checkoutLoading, isPremium, planName, openCustomerPortal } = useSubscription();

  const handleSubscribe = async () => {
    const plan = selectedPlan === "monthly"
      ? STRIPE_PLANS.premium_monthly
      : STRIPE_PLANS.premium_yearly;
    await startCheckout(plan.price_id);
  };

  if (isPremium) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-foreground">You're in the Sober Club!</h2>
        <p className="text-sm text-muted-foreground">Full access with your {planName} plan.</p>
        <Button onClick={openCustomerPortal} variant="outline" className="w-full">Manage Subscription</Button>
        {onClose && <Button onClick={onClose} variant="ghost" className="w-full">Close</Button>}
      </motion.div>
    );
  }

  return (
    <div className="px-5 py-5 space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
        >
          <Crown className="w-7 h-7 text-white" />
        </motion.div>

        <h2 className="text-lg font-bold text-foreground">
          {featureContext
            ? `Unlock ${featureContext}`
            : "Sober Club Premium"
          }
        </h2>
        <p className="text-xs text-muted-foreground max-w-[260px] mx-auto">
          Get full access to every premium tool to support your recovery.
        </p>
      </div>

      {/* Plan selector */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setSelectedPlan("monthly")}
          className={cn(
            "rounded-xl border-2 p-3 text-left transition-all duration-200",
            selectedPlan === "monthly"
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border/50 bg-secondary/30 hover:border-border"
          )}
        >
          <p className="text-xs font-semibold text-foreground">Monthly</p>
          <p className="text-2xl font-bold text-foreground mt-1">$7.99</p>
          <p className="text-[10px] text-muted-foreground">/month</p>
        </button>

        <button
          onClick={() => setSelectedPlan("yearly")}
          className={cn(
            "relative rounded-xl border-2 p-3 text-left transition-all duration-200",
            selectedPlan === "yearly"
              ? "border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10"
              : "border-border/50 bg-secondary/30 hover:border-border"
          )}
        >
          <Badge className="absolute -top-2 right-2 bg-amber-500 text-white text-[9px] px-1.5 py-0 border-0">
            BEST VALUE
          </Badge>
          <p className="text-xs font-semibold text-foreground">Yearly</p>
          <p className="text-2xl font-bold text-foreground mt-1">$34.99</p>
          <p className="text-[10px] text-muted-foreground">/year · $2.92/mo</p>
          <p className="text-[10px] text-green-500 font-medium mt-0.5">Save over 60%</p>
        </button>
      </div>

      {/* What's included */}
      <div className="rounded-xl bg-secondary/40 p-3">
        <p className="text-xs font-semibold text-foreground mb-2">What's included:</p>
        <div className="space-y-1.5">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Check className="w-3 h-3 text-green-500 shrink-0" />
              <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={handleSubscribe}
        disabled={checkoutLoading}
        className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
      >
        {checkoutLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Crown className="w-4 h-4 mr-1.5" />
            Subscribe — ${selectedPlan === "monthly" ? "7.99/mo" : "34.99/yr"}
          </>
        )}
      </Button>

      <div className="text-center space-y-1">
        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          Secure payment · Cancel anytime
        </p>
      </div>

      {onClose && (
        <button onClick={onClose} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5">
          Not now
        </button>
      )}
    </div>
  );
});

PricingPlans.displayName = "PricingPlans";
