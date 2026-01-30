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
import { NotificationsBell } from "@/components/community/NotificationsBell";
import { StreakTracker } from "@/components/StreakTracker";
import { SmartInsights } from "@/components/SmartInsights";
import { BreathingExercise } from "@/components/BreathingExercise";
import { GuidedMeditations } from "@/components/GuidedMeditations";
import { CrisisResources } from "@/components/CrisisResources";
import { DataInsights } from "@/components/DataInsights";
import { PremiumAnalytics } from "@/components/PremiumAnalytics";
import { WeeklyProgressSummary } from "@/components/WeeklyProgressSummary";
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations";
import { AIRecoveryCoach } from "@/components/AIRecoveryCoach";
import { Journal } from "@/components/Journal";
import { HabitLoopCard } from "@/components/HabitLoopCard";
import { GamificationCard } from "@/components/GamificationCard";
import { DailyChallenges } from "@/components/DailyChallenges";
import { RiskPrediction } from "@/components/RiskPrediction";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ShareAndInvite } from "@/components/ShareAndInvite";
import { XPNotificationProvider } from "@/components/XPNotification";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useCapacitor } from "@/hooks/useCapacitor";
import { calculateDaysSober, calculateMoneySaved } from "@/lib/storage";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserData();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const navigate = useNavigate();
  
  // Initialize Capacitor for native mobile features
  useCapacitor();

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
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="glass-card rounded-2xl p-5 text-center"
            >
              <p className="text-muted-foreground text-sm mb-1 font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.display_name ? (
                  <>Keep going, <span className="text-gradient">{profile.display_name}</span>!</>
                ) : (
                  "You're doing amazing!"
                )} 🌟
              </h1>
            </motion.div>
            <SobrietyCounter daysSober={daysSober} startDate={userData.sobrietyStartDate} />
            {userData.dailySpending > 0 && <MoneySaved totalSaved={moneySaved} dailySpending={userData.dailySpending} daysSober={daysSober} />}
            <GamificationCard />
            <DailyChallenges />
            <HabitLoopCard onNavigateToCheckIn={() => setActiveTab("checkin")} />
            <MotivationalBanner />
            <DailyGoals />
            <QuickActions />
            <SmartInsights />
            <AchievementBadges daysSober={daysSober} />
            <ShareAndInvite />
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
            <Journal daysSober={daysSober} />
            <SleepTracker />
            <BreathingExercise />
            <GuidedMeditations />
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
            <RiskPrediction />
            <CravingTimer />
            <TriggerLogger />
            <PatternAnalysis />
            <RelapsePreventionPlan />
            <CrisisResources />
          </div>
        );

      case "progress":
        return (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              <h1 className="text-2xl font-bold text-foreground mb-1">Your Journey</h1>
              <p className="text-muted-foreground">Every step counts</p>
            </motion.div>
            <PersonalizedRecommendations />
            <WeeklyProgressSummary userData={userData} />
            <ProgressView daysSober={daysSober} totalSaved={moneySaved} dailySpending={userData.dailySpending} />
            <PremiumAnalytics />
            <DataInsights />
          </div>
        );

      case "community":
        return <CommunityHub />;

      default:
        return null;
    }
  };

  return (
    <XPNotificationProvider>
      <div className="min-h-screen bg-background noise-overlay">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 blur-[100px] rounded-full" />
        </div>
        
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40"
        >
          {/* Glass header background */}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl gradient-primary shadow-lg shadow-primary/20 icon-glow">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">Sobable</span>
            </div>
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <UserProfile />
            </div>
          </div>
        </motion.header>

        <main className="container max-w-2xl mx-auto px-4 py-6 pb-28 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <EmergencyButton />
        <AIRecoveryCoach />
      </div>
    </XPNotificationProvider>
  );
};

export default Index;
