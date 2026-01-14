import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Loader2 } from "lucide-react";
import { SobrietyCounter } from "@/components/SobrietyCounter";
import { MoneySaved } from "@/components/MoneySaved";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Onboarding } from "@/components/Onboarding";
import { BottomTabs, type TabId } from "@/components/BottomTabs";
import { ProgressView } from "@/components/ProgressView";
import { TriggerLogger } from "@/components/TriggerLogger";
import { PatternAnalysis } from "@/components/PatternAnalysis";
import { UserProfile } from "@/components/UserProfile";
import { AchievementBadges } from "@/components/AchievementBadges";
import { CravingTimer } from "@/components/CravingTimer";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { RelapsePreventionPlan } from "@/components/RelapsePreventionPlan";
import { SleepTracker } from "@/components/SleepTracker";
import { DailyGoals } from "@/components/DailyGoals";
import { QuickActions } from "@/components/QuickActions";
import { MotivationalBanner } from "@/components/MotivationalBanner";
import { CommunityHub } from "@/components/community/CommunityHub";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { calculateDaysSober, calculateMoneySaved } from "@/lib/storage";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserData();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const showOnboarding = !profile?.onboarding_complete;

  const handleOnboardingComplete = async (data: {
    name: string;
    substances: string[];
    sobrietyStartDate: string;
    dailySpending: number;
    sponsorPhone?: string;
    emergencyContact?: string;
    personalReminder?: string;
  }) => {
    await updateProfile({
      display_name: data.name,
      substances: data.substances,
      sobriety_start_date: data.sobrietyStartDate,
      daily_spending: data.dailySpending,
      sponsor_phone: data.sponsorPhone,
      emergency_contact: data.emergencyContact,
      personal_reminder: data.personalReminder,
      onboarding_complete: true,
    });
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const daysSober = profile?.sobriety_start_date
    ? calculateDaysSober(profile.sobriety_start_date)
    : 0;
  const moneySaved = profile?.sobriety_start_date && profile?.daily_spending
    ? calculateMoneySaved(profile.sobriety_start_date, profile.daily_spending)
    : 0;

  // Convert profile to userData format for components that need it
  const userData = {
    name: profile?.display_name || "",
    substances: profile?.substances || [],
    sobrietyStartDate: profile?.sobriety_start_date || new Date().toISOString().split("T")[0],
    dailySpending: profile?.daily_spending || 0,
    sponsorPhone: profile?.sponsor_phone,
    emergencyContact: profile?.emergency_contact,
    personalReminder: profile?.personal_reminder,
    onboardingComplete: profile?.onboarding_complete || false,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              <p className="text-muted-foreground mb-1">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.display_name ? `Keep going, ${profile.display_name}!` : "You're doing amazing!"} 🌟
              </h1>
            </motion.div>
            <MotivationalBanner />
            <SobrietyCounter daysSober={daysSober} startDate={userData.sobrietyStartDate} />
            {userData.dailySpending > 0 && <MoneySaved totalSaved={moneySaved} dailySpending={userData.dailySpending} daysSober={daysSober} />}
            <QuickActions />
            <DailyGoals />
            <AchievementBadges daysSober={daysSober} />
          </div>
        );

      case "checkin":
        return (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              <h1 className="text-2xl font-bold text-foreground mb-1">Daily Check-In</h1>
              <p className="text-muted-foreground">How are you feeling today?</p>
            </motion.div>
            <MoodCheckIn />
            <SleepTracker />
            <CalendarHeatmap startDate={userData.sobrietyStartDate} />
          </div>
        );

      case "triggers":
        return (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              <h1 className="text-2xl font-bold text-foreground mb-1">Triggers & Coping</h1>
              <p className="text-muted-foreground">Know yourself to protect yourself</p>
            </motion.div>
            <CravingTimer />
            <TriggerLogger />
            <PatternAnalysis />
            <RelapsePreventionPlan />
          </div>
        );

      case "progress":
        return (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              <h1 className="text-2xl font-bold text-foreground mb-1">Your Journey</h1>
              <p className="text-muted-foreground">Every step counts</p>
            </motion.div>
            <ProgressView daysSober={daysSober} totalSaved={moneySaved} dailySpending={userData.dailySpending} />
          </div>
        );

      case "community":
        return <CommunityHub />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            <span className="text-lg font-semibold text-foreground">Clean & Sober</span>
          </div>
          <UserProfile />
        </div>
      </motion.header>

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

      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <EmergencyButton />
    </div>
  );
};

export default Index;
