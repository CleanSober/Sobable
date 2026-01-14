import { memo } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, Shield, MessageSquare, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PremiumGateProps {
  onUpgrade?: () => void;
}

const features = [
  { icon: MessageSquare, text: "Unlimited forum access" },
  { icon: Users, text: "Real-time chat rooms" },
  { icon: Heart, text: "Connect with peers" },
  { icon: Shield, text: "Priority support" },
] as const;

export const PremiumGate = memo(({ onUpgrade }: PremiumGateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[60vh] px-4"
    >
      <Card className="max-w-md w-full gradient-card border-primary/20 shadow-xl shadow-primary/5">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {/* Crown icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
          >
            <Crown className="w-10 h-10 text-white" aria-hidden="true" />
          </motion.div>
          
          {/* Title and description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Premium Feature</h2>
            <p className="text-muted-foreground leading-relaxed">
              Connect with our supportive community, join forums, and chat live with others on the same journey.
            </p>
          </div>

          {/* Features list */}
          <ul className="space-y-3 text-left bg-secondary/50 rounded-xl p-4" role="list">
            {features.map(({ icon: Icon, text }, index) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <span className="text-sm text-foreground">{text}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA button */}
          <Button 
            onClick={onUpgrade}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40 hover:scale-[1.02]"
          >
            <Crown className="w-4 h-4 mr-2" aria-hidden="true" />
            Upgrade to Premium
          </Button>

          {/* Security note */}
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" aria-hidden="true" />
            Secure payment processing
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
});

PremiumGate.displayName = "PremiumGate";
