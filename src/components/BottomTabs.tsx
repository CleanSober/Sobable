import { Home, Heart, TrendingUp, Users, Brain, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";

export type TabId = "home" | "checkin" | "community" | "triggers" | "progress";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  isPremium?: boolean;
}

const tabs: Tab[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "checkin", label: "Check-In", icon: Heart },
  { id: "community", label: "Community", icon: Users, isPremium: true },
  { id: "triggers", label: "Triggers", icon: Brain },
  { id: "progress", label: "Progress", icon: TrendingUp },
];

interface BottomTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomTabs = ({ activeTab, onTabChange }: BottomTabsProps) => {
  const { impact } = useHaptics();
  
  const handleTabChange = (tabId: TabId) => {
    impact('light');
    onTabChange(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
      {/* Glass background */}
      <div className="absolute inset-0 bg-card/80 backdrop-blur-2xl border-t border-border/40" />
      
      {/* Glow effect at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container max-w-2xl mx-auto px-2 relative">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const isPremium = tab.isPremium;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="relative flex flex-col items-center justify-center px-4 py-2 min-w-[64px] transition-all duration-300"
              >
                {/* Active indicator background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: isPremium 
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
                      className={`w-6 h-6 relative z-10 transition-all duration-300 ${
                        isPremium 
                          ? isActive 
                            ? "text-accent drop-shadow-[0_0_8px_hsl(42_100%_55%/0.5)]" 
                            : "text-accent/60"
                          : isActive 
                            ? "text-primary drop-shadow-[0_0_8px_hsl(168_84%_45%/0.5)]" 
                            : "text-muted-foreground"
                      }`}
                    />
                  </motion.div>
                  
                  {/* Premium crown badge */}
                  {isPremium && (
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
                      className={`absolute inset-0 blur-lg ${isPremium ? "bg-accent/30" : "bg-primary/30"}`}
                    />
                  )}
                </div>
                
                {/* Label */}
                <span
                  className={`text-xs mt-1.5 font-medium relative z-10 transition-all duration-300 ${
                    isPremium
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
