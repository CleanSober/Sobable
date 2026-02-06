import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useGamification } from "@/hooks/useGamification";
import { Loader2, Flame } from "lucide-react";
import sobableLogo from "@/assets/sobable-logo.png";
import { SobrietyCounter } from "@/components/SobrietyCounter";
import { MoneySaved } from "@/components/MoneySaved";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Onboarding } from "@/components/Onboarding";
import { BottomTabs, type TabId, TAB_ORDER } from "@/components/BottomTabs";
import { ProgressView } from "@/components/ProgressView";
import { TriggerLogger } from "@/components/TriggerLogger";
import { PatternAnalysis } from "@/components/PatternAnalysis";
import { UserProfile } from "@/components/UserProfile";
import { AchievementBadges } from "@/components/AchievementBadges";
import { CravingTimer } from "@/components/CravingTimer";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { RelapsePreventionPlan } from "@/components/RelapsePreventionPlan";
import { SleepTracker } from "@/components/SleepTracker";
import { QuickActions } from "@/components/QuickActions";
import { DailyRitual } from "@/components/DailyRitual";
import { MotivationalBanner } from "@/components/MotivationalBanner";
import { CommunityHub } from "@/components/community/CommunityHub";
import { NotificationsBell } from "@/components/community/NotificationsBell";
import { BreathingExercise } from "@/components/BreathingExercise";
import { GuidedMeditations } from "@/components/GuidedMeditations";
import { CrisisResources } from "@/components/CrisisResources";
import { PremiumAnalytics } from "@/components/PremiumAnalytics";
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations";
import { AIRecoveryCoach } from "@/components/AIRecoveryCoach";
import { Journal } from "@/components/Journal";
import { RiskPrediction } from "@/components/RiskPrediction";
import { NotificationCenter } from "@/components/NotificationCenter";
import { XPNotificationProvider } from "@/components/XPNotification";
import { AdBanner } from "@/components/AdBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useCapacitor } from "@/hooks/useCapacitor";
import { calculateDaysSober, calculateMoneySaved } from "@/lib/storage";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserData();
  const { userXP } = useGamification();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [swipeDirection, setSwipeDirection] = useState<number>(0);
  const navigate = useNavigate();

  const handleTabChange = (tab: TabId) => {
    const oldIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(tab);
    setSwipeDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTab(tab);
  };

  const { onTouchStart, onTouchEnd } = useSwipeNavigation(
    TAB_ORDER,
    activeTab,
    handleTabChange
  );
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
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="glass-card rounded-2xl p-4 text-center"
            >
              <p className="text-muted-foreground text-xs mb-0.5 font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 className="text-xl font-bold text-foreground">
                {profile?.display_name ? (
                  <>Keep going, <span className="text-gradient">{profile.display_name}</span>!</>
                ) : (
                  "You're doing amazing!"
                )} 🌟
              </h1>
            </motion.div>
            <SobrietyCounter daysSober={daysSober} startDate={userData.sobrietyStartDate} />
            {userData.dailySpending > 0 && <MoneySaved totalSaved={moneySaved} dailySpending={userData.dailySpending} daysSober={daysSober} />}
            <DailyRitual onNavigateToCheckIn={() => setActiveTab("checkin")} />
            <MotivationalBanner />
            <QuickActions onNavigateToCheckIn={() => setActiveTab("checkin")} />
            <AchievementBadges daysSober={daysSober} />
          </div>
        );

      case "checkin":
        return (
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-1">
              <h1 className="text-xl font-bold text-foreground mb-0.5">Daily Check-In</h1>
              <p className="text-sm text-muted-foreground">How are you feeling today?</p>
            </motion.div>
            <MoodCheckIn />
            <SleepTracker />
            <Journal daysSober={daysSober} />
            <BreathingExercise />
            <GuidedMeditations />
            <CalendarHeatmap startDate={userData.sobrietyStartDate} />
          </div>
        );

      case "triggers":
        return (
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-1">
              <h1 className="text-xl font-bold text-foreground mb-0.5">Triggers & Coping</h1>
              <p className="text-sm text-muted-foreground">Know yourself to protect yourself</p>
            </motion.div>
            <CravingTimer />
            <RiskPrediction />
            <TriggerLogger />
            <PatternAnalysis />
            <RelapsePreventionPlan />
            <CrisisResources />
          </div>
        );

      case "progress":
        return (
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-1">
              <h1 className="text-xl font-bold text-foreground mb-0.5">Your Journey</h1>
              <p className="text-sm text-muted-foreground">Every step counts</p>
            </motion.div>
            <ProgressView daysSober={daysSober} totalSaved={moneySaved} dailySpending={userData.dailySpending} />
            <PersonalizedRecommendations />
            <PremiumAnalytics />
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
      <div className="min-h-screen min-h-[100dvh] bg-background noise-overlay">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 blur-[100px] rounded-full" />
        </div>
        
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 safe-area-top"
        >
          {/* Glass header background */}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center justify-between relative">
            <div className="flex items-center gap-2.5">
              <img src={sobableLogo} alt="Sobable" className="w-9 h-9 rounded-xl shadow-lg shadow-primary/20" />
              <span className="text-lg font-bold text-foreground tracking-tight">Sobable</span>
              {(userXP?.daily_login_streak ?? 0) > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30"
                >
                  <Flame className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent">{userXP?.daily_login_streak}</span>
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <NotificationCenter />
              <UserProfile />
            </div>
          </div>
        </motion.header>

        <main
          className="container max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 relative overflow-x-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait" custom={swipeDirection}>
            <motion.div
              key={activeTab}
              custom={swipeDirection}
              initial={{ opacity: 0, x: swipeDirection * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: swipeDirection * -60 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <EmergencyButton />
        <AIRecoveryCoach />
        <AdBanner position="bottom" />
      </div>
    </XPNotificationProvider>
  );
};

export default Index;
