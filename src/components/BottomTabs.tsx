import { useState, memo } from "react";
import { Home, Heart, TrendingUp, Users, Brain, Crown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";
import { useOnlineCount } from "@/hooks/useOnlineCount";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

export type TabId = "home" | "checkin" | "triggers" | "progress" | "community";
export const TAB_ORDER: TabId[] = ["home", "checkin", "triggers", "progress", "community"];

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  isPremium?: boolean;
}

const tabs: Tab[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "checkin", label: "Check-In", icon: Heart },
  { id: "triggers", label: "Triggers", icon: Brain },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "community", label: "Community", icon: Users, isPremium: true },
];

interface BottomTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomTabs = memo(({ activeTab, onTabChange }: BottomTabsProps) => {
  const { impact } = useHaptics();
  const onlineCount = useOnlineCount();
  const { isPremium } = usePremiumStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleTabChange = (tabId: TabId) => {
    impact('light');
    if (tabId === "community" && isPremium && onlineCount > 0) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
    onTabChange(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
      {/* Glass background */}
      <div className="absolute inset-0 bg-card/80 backdrop-blur-2xl border-t border-border/40" />
      
      {/* Glow effect at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-1 relative">
        <div className="flex items-center justify-around py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const isTabPremium = tab.isPremium;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="relative flex flex-col items-center justify-center px-3 py-2 min-w-[56px] transition-all duration-300 active:scale-95"
              >
                {/* Tooltip for community tab */}
                <AnimatePresence>
                  {tab.id === "community" && showTooltip && isPremium && onlineCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
                    >
                      <div className="bg-popover text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg border border-border/50 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {onlineCount} {onlineCount === 1 ? "user" : "users"} online
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-popover border-r border-b border-border/50" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active indicator background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: isTabPremium 
                        ? "linear-gradient(135deg, hsl(42 100% 55% / 0.15), hsl(38 95% 50% / 0.1))"
                        : "linear-gradient(135deg, hsl(168 84% 45% / 0.15), hsl(158 72% 48% / 0.1))"
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                
                {/* Icon container */}
                <div className="relative">
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon
                      className={`w-5 h-5 relative z-10 transition-all duration-300 ${
                        isTabPremium 
                          ? isActive 
                            ? "text-accent drop-shadow-[0_0_8px_hsl(42_100%_55%/0.5)]" 
                            : "text-accent/60"
                          : isActive 
                            ? "text-primary drop-shadow-[0_0_8px_hsl(168_84%_45%/0.5)]" 
                            : "text-muted-foreground"
                      }`}
                    />
                  </motion.div>
                  
                  {/* Online users count badge for community tab (premium only) */}
                  {tab.id === "community" && isPremium && onlineCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30"
                    >
                      <span className="text-[10px] font-bold text-white leading-none">
                        {onlineCount > 99 ? "99+" : onlineCount}
                      </span>
                    </motion.div>
                  )}

                  {/* Crown badge for community tab (free users) */}
                  {!isPremium && tab.id === "community" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
                    >
                      <Crown className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                  )}
                  
                  {/* Active glow indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`absolute inset-0 blur-lg ${isTabPremium ? "bg-accent/30" : "bg-primary/30"}`}
                    />
                  )}
                </div>
                
                {/* Label */}
                <span
                  className={`text-[10px] mt-1 font-medium relative z-10 transition-all duration-300 leading-tight ${
                    isTabPremium
                      ? isActive ? "text-accent" : "text-accent/60"
                      : isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
