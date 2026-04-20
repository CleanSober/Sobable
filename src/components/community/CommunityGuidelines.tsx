import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Shield,
  MessageCircle,
  AlertTriangle,
  HandHeart,
  Lock,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const GUIDELINES_ACCEPTED_KEY = "sober_club_community_guidelines_accepted";

const RULES = [
  {
    icon: Heart,
    title: "Lead with compassion",
    description:
      "Everyone is at a different stage. Celebrate wins, hold space for struggles, and never judge someone's timeline.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: Shield,
    title: "Protect anonymity",
    description:
      "Never share someone's identity, personal details, or screenshots outside this space. What's shared here stays here.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: MessageCircle,
    title: "Be honest, not hurtful",
    description:
      "Share your truth respectfully. Tough love is welcome — cruelty, sarcasm at someone's expense, or unsolicited medical advice is not.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: AlertTriangle,
    title: "No triggering content",
    description:
      "Avoid glorifying substance use, sharing graphic relapse details, or posting content that could trigger others. Use content warnings when discussing difficult topics.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: HandHeart,
    title: "Support, don't prescribe",
    description:
      "Share what worked for you without insisting others follow the same path. Recovery is personal — respect every approach.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Lock,
    title: "Zero tolerance for harassment",
    description:
      "Hate speech, bullying, spam, and unwanted solicitation result in immediate removal. Use the report button — moderators act fast.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
] as const;

interface CommunityGuidelinesProps {
  onAccepted: () => void;
}

export const CommunityGuidelines = ({ onAccepted }: CommunityGuidelinesProps) => {
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    localStorage.setItem(GUIDELINES_ACCEPTED_KEY, "true");
    onAccepted();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-md mx-auto px-1 pb-[7rem]"
      style={{
        paddingBottom:
          "calc(7rem + var(--admob-banner-height, 0px) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.15, duration: 0.5 }}
          className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
        >
          <Sparkles className="w-6 h-6 text-primary" />
        </motion.div>
        <h2 className="text-lg font-bold text-foreground">Community Guidelines</h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
          This is a safe space for recovery. Please read and agree to these guidelines before joining.
        </p>
      </div>

      {/* Rules */}
      <div className="space-y-2 mb-4">
        {RULES.map((rule, index) => (
          <motion.div
            key={rule.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.2 + index * 0.08,
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Card className="gradient-card border-border/40 hover:border-border/60 transition-colors duration-200">
              <CardContent className="p-3 flex gap-3">
                <div
                  className={`w-8 h-8 rounded-xl ${rule.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <rule.icon className={`w-4 h-4 ${rule.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-foreground mb-0.5">
                    {rule.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Agreement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="space-y-3"
      >
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <Checkbox
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
            I've read and agree to follow these community guidelines. I understand that violations may result in removal from the community.
          </span>
        </label>

        <Button
          onClick={handleAccept}
          disabled={!agreed}
          className="w-full h-10 text-sm font-semibold"
        >
          <Check className="w-4 h-4 mr-1.5" />
          Join the Community
        </Button>
      </motion.div>
    </motion.div>
  );
};

/** Check if user has already accepted guidelines */
export const hasAcceptedGuidelines = (): boolean => {
  return localStorage.getItem(GUIDELINES_ACCEPTED_KEY) === "true";
};
