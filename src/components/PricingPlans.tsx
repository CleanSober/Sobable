import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STRIPE_PLANS } from "@/lib/stripe";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

const features = [
  "AI Recovery Coach",
  "Unlimited community access",
  "Live chat rooms",
  "Advanced analytics",
  "Pattern insights",
  "Priority support",
];

interface PricingPlansProps {
  onClose?: () => void;
}

export const PricingPlans = memo(({ onClose }: PricingPlansProps) => {
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto p-6"
      >
        <Card className="gradient-card border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">You're in the Sober Club!</h2>
            <p className="text-muted-foreground">
              You have full access to all features with your {planName} plan.
            </p>
            <Button onClick={openCustomerPortal} variant="outline" className="w-full">
              Manage Subscription
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="ghost" className="w-full">
                Close
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto p-4 space-y-6"
    >
      <div className="text-center space-y-2">
        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 mb-2">
          7-Day Free Trial
        </Badge>
        <h2 className="text-2xl font-bold text-foreground">Join Sober Club</h2>
        <p className="text-muted-foreground">
          Try all premium features free for 7 days
        </p>
      </div>

      {/* Plan toggle */}
      <div className="flex justify-center gap-2 p-1 bg-secondary rounded-lg">
        <button
          onClick={() => setSelectedPlan("monthly")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            selectedPlan === "monthly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setSelectedPlan("yearly")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
            selectedPlan === "yearly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Yearly
          <Badge variant="secondary" className="bg-green-500/20 text-green-600 text-xs">
            Save 16%
          </Badge>
        </button>
      </div>

      {/* Selected plan card */}
      <Card className="gradient-card border-primary/30 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg">
              {selectedPlan === "monthly" ? "Sober Club Monthly" : "Sober Club Yearly"}
            </CardTitle>
          </div>
          <CardDescription>
            {selectedPlan === "yearly" && (
              <span className="text-green-600 font-medium">Save $15.89/year!</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold text-foreground">
              ${selectedPlan === "monthly" ? "7.99" : "79.99"}
            </span>
            <span className="text-muted-foreground">
              /{selectedPlan === "monthly" ? "month" : "year"}
            </span>
          </div>

          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={handleSubscribe}
            disabled={checkoutLoading}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Start 7-Day Free Trial
              </>
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p className="font-medium text-foreground/80">No charge for 7 days</p>
            <p>
              Then ${selectedPlan === "monthly" ? "7.99/month" : "79.99/year"}. Cancel anytime.
            </p>
          </div>
        </CardContent>
      </Card>

      {onClose && (
        <Button onClick={onClose} variant="ghost" className="w-full">
          Maybe Later
        </Button>
      )}
    </motion.div>
  );
});

PricingPlans.displayName = "PricingPlans";
