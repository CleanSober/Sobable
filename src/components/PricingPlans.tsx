import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Crown, Sparkles, Loader2, Shield, Star, Users, Brain,
  Compass, Zap, Heart, Bot, BarChart3, ArrowRight, ChevronLeft,
  TrendingUp, Lock, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STRIPE_PLANS } from "@/lib/stripe";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

const features = [
  { icon: Bot, text: "AI Recovery Coach", desc: "24/7 personalized guidance" },
  { icon: Shield, text: "Smart Risk Score", desc: "Daily relapse prevention" },
  { icon: Brain, text: "Predictive Insights", desc: "Discover your patterns" },
  { icon: Users, text: "Accountability Partner", desc: "AI-matched peer support" },
  { icon: Compass, text: "Guided Pathways", desc: "Structured programs" },
  { icon: BarChart3, text: "Weekly Recap", desc: "Animated progress summaries" },
  { icon: Heart, text: "Unlimited Community", desc: "Forums & live chat" },
  { icon: Zap, text: "Ad-Free Experience", desc: "Zero distractions" },
];

const testimonials = [
  { name: "Sarah M.", days: 147, text: "The Risk Score warned me before I even realized I was struggling.", avatar: "S" },
  { name: "James T.", days: 89, text: "My accountability partner keeps me honest. Worth every penny.", avatar: "J" },
  { name: "Priya K.", days: 215, text: "The AI coach feels like having a therapist in my pocket.", avatar: "P" },
];

const stats = [
  { value: "2,400+", label: "Active Members" },
  { value: "87%", label: "Stay Sober Longer" },
  { value: "4.9★", label: "App Rating" },
];

interface PricingPlansProps {
  onClose?: () => void;
  featureContext?: string;
}

type FunnelStep = "hook" | "social" | "pricing";

export const PricingPlans = memo(({ onClose, featureContext }: PricingPlansProps) => {
  const [step, setStep] = useState<FunnelStep>("hook");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const { startCheckout, checkoutLoading, isPremium, planName, openCustomerPortal } = useSubscription();

  const handleSubscribe = async () => {
    const plan = selectedPlan === "monthly"
      ? STRIPE_PLANS.premium_monthly
      : STRIPE_PLANS.premium_yearly;
    await startCheckout(plan.price_id);
  };

  const nextStep = useCallback(() => {
    if (step === "hook") setStep("social");
    else if (step === "social") setStep("pricing");
  }, [step]);

  const prevStep = useCallback(() => {
    if (step === "pricing") setStep("social");
    else if (step === "social") setStep("hook");
  }, [step]);

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

  const stepIndex = step === "hook" ? 0 : step === "social" ? 1 : 2;

  return (
    <div className="relative overflow-hidden">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pt-4 pb-2">
        {["hook", "social", "pricing"].map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i <= stepIndex ? "bg-amber-500 w-8" : "bg-muted w-4"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Hook — Emotional appeal */}
        {step === "hook" && (
          <motion.div
            key="hook"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="px-5 pb-5 space-y-4"
          >
            {/* Hero */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <Crown className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-xl font-bold text-foreground">
                {featureContext
                  ? `Unlock ${featureContext}`
                  : "Your Recovery Deserves More"
                }
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Join thousands who've supercharged their sobriety journey with tools that actually work.
              </p>
            </div>

            {/* Key benefits — big & visual */}
            <div className="grid grid-cols-2 gap-2">
              {features.slice(0, 4).map(({ icon: Icon, text, desc }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="rounded-xl bg-secondary/60 p-3 space-y-1.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-tight">{text}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Urgency */}
            <div className="flex items-center justify-center gap-2 py-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">Try free for 7 days — cancel anytime</span>
            </div>

            <Button
              onClick={nextStep}
              className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
            >
              See Why Members Stay
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            {onClose && (
              <button onClick={onClose} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                Not now
              </button>
            )}
          </motion.div>
        )}

        {/* Step 2: Social Proof */}
        {step === "social" && (
          <motion.div
            key="social"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="px-5 pb-5 space-y-4"
          >
            <div className="text-center space-y-1.5">
              <h2 className="text-lg font-bold text-foreground">Loved by Thousands</h2>
              <p className="text-xs text-muted-foreground">Real members, real transformations</p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-2">
              {stats.map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center rounded-xl bg-secondary/60 py-3"
                >
                  <p className="text-lg font-bold text-primary">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-2.5">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex gap-2.5 rounded-xl bg-secondary/40 p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground italic leading-snug">"{t.text}"</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-muted-foreground">{t.name}</span>
                      <span className="text-[10px] text-primary font-medium">{t.days} days sober</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 5-star rating */}
            <div className="flex items-center justify-center gap-0.5 pt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs text-muted-foreground ml-1.5">800+ reviews</span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={prevStep}
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={nextStep}
                className="flex-1 h-11 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
              >
                Choose Your Plan
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Pricing & Checkout */}
        {step === "pricing" && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="px-5 pb-5 space-y-4"
          >
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-foreground">Pick Your Plan</h2>
              <p className="text-xs text-muted-foreground">Start free, upgrade when ready</p>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Monthly */}
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

              {/* Yearly */}
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
              <p className="text-xs font-semibold text-foreground mb-2">Everything included:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {features.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-green-500 shrink-0" />
                    <span className="text-[10px] text-foreground leading-tight">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={prevStep}
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  className="flex-1 h-11 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-1.5" />
                      Start 7-Day Free Trial
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center space-y-0.5">
                <p className="text-[10px] font-medium text-foreground/80">
                  ✅ No charge for 7 days — cancel anytime
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Then ${selectedPlan === "monthly" ? "7.99/month" : "34.99/year"}
                </p>
              </div>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1">
              <Shield className="w-3 h-3" />
              <span>Secure payment · Cancel anytime · 30-day refund</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PricingPlans.displayName = "PricingPlans";
