import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";
import { SobrietyCounter } from "@/components/SobrietyCounter";
import { MoneySaved } from "@/components/MoneySaved";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Onboarding } from "@/components/Onboarding";
import { BottomTabs, type TabId } from "@/components/BottomTabs";
import { ProgressView } from "@/components/ProgressView";
import { MotivationView } from "@/components/MotivationView";
import { TriggerLogger } from "@/components/TriggerLogger";
import { PatternAnalysis } from "@/components/PatternAnalysis";
import { UserProfile } from "@/components/UserProfile";
import {
  getUserData,
  calculateDaysSober,
  calculateMoneySaved,
} from "@/lib/storage";

const Index = () => {
  const [userData, setUserData] = useState(getUserData());
  const [showOnboarding, setShowOnboarding] = useState(!userData?.onboardingComplete);
  const [activeTab, setActiveTab] = useState<TabId>("home");

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
    setShowOnboarding(!data?.onboardingComplete);
  }, []);

  const handleOnboardingComplete = () => {
    setUserData(getUserData());
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!userData) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const daysSober = calculateDaysSober(userData.sobrietyStartDate);
  const moneySaved = calculateMoneySaved(
    userData.sobrietyStartDate,
    userData.dailySpending
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-2"
            >
              <p className="text-muted-foreground mb-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                You're doing amazing! 🌟
              </h1>
            </motion.div>

            <SobrietyCounter
              daysSober={daysSober}
              startDate={userData.sobrietyStartDate}
            />

            {userData.dailySpending > 0 && (
              <MoneySaved
                totalSaved={moneySaved}
                dailySpending={userData.dailySpending}
                daysSober={daysSober}
              />
            )}
          </div>
        );

      case "checkin":
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-2"
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Daily Check-In
              </h1>
              <p className="text-muted-foreground">
                How are you feeling today?
              </p>
            </motion.div>
            <MoodCheckIn />
          </div>
        );

      case "triggers":
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-2"
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Triggers & Patterns
              </h1>
              <p className="text-muted-foreground">
                Know yourself to protect yourself
              </p>
            </motion.div>
            <TriggerLogger />
            <PatternAnalysis />
          </div>
        );

      case "progress":
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-2"
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Your Journey
              </h1>
              <p className="text-muted-foreground">
                Every step counts
              </p>
            </motion.div>
            <ProgressView
              daysSober={daysSober}
              totalSaved={moneySaved}
              dailySpending={userData.dailySpending}
            />
          </div>
        );

      case "motivation":
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-2"
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Stay Inspired
              </h1>
              <p className="text-muted-foreground">
                Fuel for your journey
              </p>
            </motion.div>
            <MotivationView />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/30"
      >
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Clean & Sober
            </span>
          </div>
          <UserProfile />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Tabs */}
      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Emergency Button */}
      <EmergencyButton />
    </div>
  );
};

export default Index;
