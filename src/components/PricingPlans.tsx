import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Loader2, Shield, Star, Users, Brain, Compass, Zap, Heart, Bot, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STRIPE_PLANS } from "@/lib/stripe";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

const features = [
  { icon: Bot, text: "AI Recovery Coach — 24/7 personalized guidance" },
  { icon: Shield, text: "Smart Risk Score — daily relapse prevention" },
  { icon: Brain, text: "Predictive Insights — discover your patterns" },
  { icon: Users, text: "Accountability Partner — AI-matched peer support" },
  { icon: Compass, text: "Guided Recovery Pathways — structured programs" },
  { icon: BarChart3, text: "Weekly Recap — animated progress summaries" },
  { icon: Heart, text: "Unlimited community, forums & live chat" },
  { icon: Zap, text: "Ad-free experience + priority support" },
];

const testimonials = [
  { name: "Sarah M.", days: 147, text: "The Risk Score warned me before I even realized I was struggling." },
  { name: "James T.", days: 89, text: "My accountability partner keeps me honest. Worth every penny." },
  { name: "Priya K.", days: 215, text: "The AI coach feels like having a therapist in my pocket." },
];

interface PricingPlansProps {
  onClose?: () => void;
}

export const PricingPlans = memo(({ onClose }: PricingPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
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
      className="max-w-lg mx-auto p-4 space-y-5"
    >
      <div className="text-center space-y-2">
        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 mb-1">
          🎉 7-Day Free Trial
        </Badge>
        <h2 className="text-2xl font-bold text-foreground">Join Sober Club</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">2,400+ members</span> already transforming their recovery
        </p>
      </div>

      {/* Social proof bar */}
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
        <span className="text-xs text-muted-foreground ml-1.5">4.9/5 from 800+ reviews</span>
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
              <span className="text-green-600 font-medium">Save $15.89/year — that's 2 months free!</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="text-center">
            <span className="text-4xl font-bold text-foreground">
              ${selectedPlan === "monthly" ? "7.99" : "79.99"}
            </span>
            <span className="text-muted-foreground">
              /{selectedPlan === "monthly" ? "month" : "year"}
            </span>
            {selectedPlan === "yearly" && (
              <p className="text-xs text-muted-foreground mt-0.5">Just $6.67/month</p>
            )}
          </div>

          <ul className="space-y-2.5">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-foreground leading-snug">{text}</span>
              </motion.li>
            ))}
          </ul>

          <Button
            onClick={handleSubscribe}
            disabled={checkoutLoading}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
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
            <p className="font-medium text-foreground/80">✅ No charge for 7 days — cancel anytime</p>
            <p>
              Then ${selectedPlan === "monthly" ? "7.99/month" : "79.99/year"}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial */}
      <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
        <p className="text-xs font-semibold text-foreground text-center">Members love Sober Club</p>
        <div className="space-y-2">
          {testimonials.map((t) => (
            <div key={t.name} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-[11px] text-foreground italic">"{t.text}"</p>
                <p className="text-[10px] text-muted-foreground">{t.name} · {t.days} days sober</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Money-back guarantee */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        <span>Secure payment · Cancel anytime · Full refund within 30 days</span>
      </div>

      {onClose && (
        <Button onClick={onClose} variant="ghost" className="w-full text-xs">
          Maybe Later
        </Button>
      )}
    </motion.div>
  );
});

PricingPlans.displayName = "PricingPlans";
