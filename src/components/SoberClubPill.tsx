import { useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useHaptics } from "@/hooks/useHaptics";
import { setPaywallVisibility } from "@/lib/paywallVisibility";

/**
 * Single, top-bar entry point to Sober Club (premium).
 * Replaces inline premium lock cards on the home surface so the
 * primary dashboard is not interrupted by upsells.
 */
export const SoberClubPill = () => {
  const { isPremium, loading } = usePremiumStatus();
  const { impact } = useHaptics();
  const [open, setOpen] = useState(false);

  if (loading || isPremium) return null;

  const handleOpen = () => {
    impact("light");
    setPaywallVisibility(true);
    setOpen(true);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={handleOpen}
        aria-label="Open Sober Club membership"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/25 bg-amber-500/[0.06] hover:bg-amber-500/[0.1] transition-colors"
      >
        <Crown className="w-3 h-3 text-amber-400" />
        <span className="text-[11px] font-medium tracking-[0.04em] text-amber-300/90">
          Sober Club
        </span>
      </motion.button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          setPaywallVisibility(o);
        }}
      >
        <DialogContent className="max-w-md p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
          <PricingPlans
            onClose={() => {
              setOpen(false);
              setPaywallVisibility(false);
            }}
            featureContext="Sober Club"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
