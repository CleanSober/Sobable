import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Leaf } from "lucide-react";
import { SobrietyCounter } from "@/components/SobrietyCounter";
import { MoneySaved } from "@/components/MoneySaved";
import { DailyMotivation } from "@/components/DailyMotivation";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Onboarding } from "@/components/Onboarding";
import {
  getUserData,
  calculateDaysSober,
  calculateMoneySaved,
} from "@/lib/storage";

const Index = () => {
  const [userData, setUserData] = useState(getUserData());
  const [showOnboarding, setShowOnboarding] = useState(!userData?.onboardingComplete);

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
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center py-4"
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

        {/* Sobriety Counter */}
        <SobrietyCounter
          daysSober={daysSober}
          startDate={userData.sobrietyStartDate}
        />

        {/* Money Saved */}
        {userData.dailySpending > 0 && (
          <MoneySaved
            totalSaved={moneySaved}
            dailySpending={userData.dailySpending}
            daysSober={daysSober}
          />
        )}

        {/* Daily Motivation */}
        <DailyMotivation />

        {/* Mood Check-In */}
        <MoodCheckIn />
      </main>

      {/* Emergency Button */}
      <EmergencyButton />
    </div>
  );
};

export default Index;
