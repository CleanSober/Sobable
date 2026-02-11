import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, ChevronRight, Shield, Brain, Calendar, Users, Sparkles,
  Activity, Compass, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";

interface PremiumOnboardingProps {
  open: boolean;
  onClose: () => void;
}

const premiumFeatures = [
  {
    icon: Shield,
    title: "Smart Risk Score",
    description: "Get a daily AI-powered relapse risk assessment based on your mood, sleep, cravings, and trigger patterns.",
    color: "from-emerald-500 to-teal-500",
    shadowColor: "shadow-emerald-500/20",
    emoji: "🧠",
  },
  {
    icon: Calendar,
    title: "Weekly Progress Recap",
    description: "Beautiful animated summaries of your week — mood trends, goals completed, money saved — shareable with one tap.",
    color: "from-blue-500 to-indigo-500",
    shadowColor: "shadow-blue-500/20",
    emoji: "📊",
  },
  {
    icon: Compass,
    title: "Guided Recovery Pathways",
    description: "Follow structured multi-week programs like 'First 30 Days' and 'Stress Mastery' with daily tasks and milestones.",
    color: "from-primary to-accent",
    shadowColor: "shadow-primary/20",
    emoji: "🧘",
  },
  {
    icon: Users,
    title: "Accountability Partner",
    description: "Get AI-matched with a recovery peer based on your journey stage. Message, share goals, and grow together.",
    color: "from-violet-500 to-purple-500",
    shadowColor: "shadow-violet-500/20",
    emoji: "👥",
  },
  {
    icon: Brain,
    title: "Predictive Insights",
    description: "Discover hidden patterns like 'Fridays are your toughest days' with AI-powered analysis and prevention strategies.",
    color: "from-pink-500 to-rose-500",
    shadowColor: "shadow-pink-500/20",
    emoji: "🔮",
  },
];

export const PremiumOnboarding = ({ open, onClose }: PremiumOnboardingProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPricing, setShowPricing] = useState(false);

  const isLastSlide = currentSlide === premiumFeatures.length - 1;
  const feature = premiumFeatures[currentSlide];

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      setShowPricing(true);
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  }, [isLastSlide]);

  const handleSkip = useCallback(() => {
    onClose();
    setCurrentSlide(0);
    setShowPricing(false);
  }, [onClose]);

  const handlePricingClose = useCallback(() => {
    setShowPricing(false);
    onClose();
    setCurrentSlide(0);
  }, [onClose]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
        <AnimatePresence mode="wait">
          {showPricing ? (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-2xl overflow-hidden border border-border/50"
            >
              <PricingPlans onClose={handlePricingClose} />
            </motion.div>
          ) : (
            <motion.div
              key={`slide-${currentSlide}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-background rounded-2xl overflow-hidden border border-border/50"
            >
              {/* Header gradient */}
              <div className={`relative h-40 bg-gradient-to-br ${feature.color} flex items-center justify-center overflow-hidden`}>
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="relative z-10 text-center"
                >
                  <span className="text-5xl block mb-1">{feature.emoji}</span>
                  <feature.icon className="w-8 h-8 text-white/80 mx-auto" />
                </motion.div>

                {/* Skip button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Slide counter */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-medium">
                  {currentSlide + 1}/{premiumFeatures.length}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <h2 className="text-lg font-bold text-foreground">{feature.title}</h2>
                    <Crown className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>
                </motion.div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {premiumFeatures.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-secondary hover:bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                {/* CTA */}
                <Button
                  onClick={handleNext}
                  className={`w-full h-10 font-semibold text-sm text-white shadow-lg ${feature.shadowColor} bg-gradient-to-r ${feature.color}`}
                >
                  {isLastSlide ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Unlock All Features
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </Button>

                <button
                  onClick={handleSkip}
                  className="w-full mt-2 text-[11px] text-muted-foreground hover:text-foreground py-1.5 transition"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
