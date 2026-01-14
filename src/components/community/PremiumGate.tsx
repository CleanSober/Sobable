import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PremiumGateProps {
  onUpgrade?: () => void;
}

export const PremiumGate = ({ onUpgrade }: PremiumGateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <Card className="max-w-md mx-auto gradient-card border-primary/20">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Premium Feature</h2>
            <p className="text-muted-foreground">
              Connect with our supportive community, join forums, and chat live with others on the same journey.
            </p>
          </div>

          <div className="space-y-3 text-left bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm">Unlimited forum access</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm">Real-time chat rooms</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm">Connect with peers</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm">Priority support</span>
            </div>
          </div>

          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
