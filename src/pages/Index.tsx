import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useGamification } from "@/hooks/useGamification";
import { Loader2, Flame, Bot, Crown, ChevronRight } from "lucide-react";
import sobableLogo from "@/assets/sobable-logo.png";
import { toast } from "sonner";
import { SobrietyCounter } from "@/components/SobrietyCounter";
import { MoneySaved } from "@/components/MoneySaved";
import { MoodCheckIn } from "@/components/MoodCheckIn";

import { Onboarding } from "@/components/Onboarding";
import { BottomTabs, type TabId, TAB_ORDER } from "@/components/BottomTabs";
import { ProgressView } from "@/components/ProgressView";
import { TriggerLogger } from "@/components/TriggerLogger";
import { PatternAnalysis } from "@/components/PatternAnalysis";
import { UserProfile } from "@/components/UserProfile";
import { AchievementBadges } from "@/components/AchievementBadges";
import { CravingTimer } from "@/components/CravingTimer";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { CheckInProgress } from "@/components/CheckInProgress";
import { HydrationTracker } from "@/components/HydrationTracker";
import { DailyAffirmation } from "@/components/DailyAffirmation";
import { HealthBenefitsTimeline } from "@/components/HealthBenefitsTimeline";
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
import { SmartRiskScore } from "@/components/premium/SmartRiskScore";
import { PremiumProgressInsights } from "@/components/progress/PremiumProgressInsights";
import { WeeklyRecap } from "@/components/premium/WeeklyRecap";
import { GuidedPathways } from "@/components/premium/GuidedPathways";
import { AccountabilityPartner } from "@/components/premium/AccountabilityPartner";
import { PredictiveInsights } from "@/components/premium/PredictiveInsights";
import { PremiumOnboarding } from "@/components/premium/PremiumOnboarding";
import { PremiumLockOverlay } from "@/components/premium/PremiumLockOverlay";
import { PremiumFeatureSection } from "@/components/premium/PremiumFeatureSection";
import { FeedbackPromptDialog } from "@/components/FeedbackPromptDialog";
import { useFeedbackPrompt } from "@/hooks/useFeedbackPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useCapacitor } from "@/hooks/useCapacitor";
import { calculateDaysSober, calculateMoneySaved } from "@/lib/storage";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserData();
  const { userXP } = useGamification();
  const { showPrompt: showFeedback, triggerFeedback, dismiss: dismissFeedback, markSubmitted: feedbackSubmitted } = useFeedbackPrompt();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [swipeDirection, setSwipeDirection] = useState<number>(0);
  const [coachOpen, setCoachOpen] = useState(false);
  const [showPremiumOnboarding, setShowPremiumOnboarding] = useState(false);
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

  // Welcome back toast with streak info
  const welcomeShownRef = useRef(false);
  useEffect(() => {
    if (welcomeShownRef.current || authLoading || profileLoading || !user || !profile?.onboarding_complete) return;
    if (!userXP) return;

    welcomeShownRef.current = true;

    const streak = userXP.daily_login_streak ?? 0;
    const name = profile?.display_name;
    const greeting = name ? `Welcome back, ${name}!` : "Welcome back!";

    // Small delay so the page renders first
    const timer = setTimeout(() => {
      if (streak > 1) {
        toast(greeting, {
          description: `🔥 ${streak}-day streak! Keep it going!`,
          duration: 4000,
        });
      } else if (streak === 1) {
        toast(greeting, {
          description: "🌱 Day 1 of your streak — let's build momentum!",
          duration: 4000,
        });
      } else {
        toast(greeting, {
          description: "✨ Great to see you again!",
          duration: 3000,
        });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [authLoading, profileLoading, user, userXP, profile]);

  // Show premium features onboarding once after first login
  useEffect(() => {
    if (!user || !profile?.onboarding_complete) return;
    const key = `premium_onboarding_shown_${user.id}`;
    if (!localStorage.getItem(key)) {
      const timer = setTimeout(() => {
        setShowPremiumOnboarding(true);
        localStorage.setItem(key, "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, profile?.onboarding_complete]);

  // Trigger feedback prompt on milestone days
  useEffect(() => {
    if (!profile?.sobriety_start_date || !user) return;
    const days = calculateDaysSober(profile.sobriety_start_date);
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    if (milestones.includes(days)) {
      triggerFeedback("milestone");
    }
  }, [profile?.sobriety_start_date, user, triggerFeedback]);

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
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="glass-card rounded-2xl p-3 text-center"
            >
              <p className="text-muted-foreground text-[10px] mb-0.5 font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 className="text-lg font-bold text-foreground">
                {profile?.display_name ? (
                  <>Keep going, <span className="text-gradient">{profile.display_name}</span>!</>
                ) : (
                  "You're doing amazing!"
                )} 🌟
              </h1>
            </motion.div>
            <SobrietyCounter daysSober={daysSober} startDate={userData.sobrietyStartDate} />
            <CheckInProgress />
            {userData.dailySpending > 0 && <MoneySaved totalSaved={moneySaved} dailySpending={userData.dailySpending} daysSober={daysSober} />}
            <DailyRitual onNavigateToCheckIn={() => setActiveTab("checkin")} />
            <MotivationalBanner />
            <QuickActions onNavigateToCheckIn={() => setActiveTab("checkin")} />
            <PremiumLockOverlay featureName="AI Risk Assessment">
              <SmartRiskScore />
            </PremiumLockOverlay>
            <PremiumLockOverlay featureName="AI Recovery Coach">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCoachOpen(true)}
                className="w-full card-enhanced p-3 flex items-center gap-3 text-left"
              >
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-foreground">AI Recovery Coach</h3>
                    <Crown className="w-3 h-3 text-accent" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Personalized insights from your recovery data</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.button>
            </PremiumLockOverlay>
            <PremiumLockOverlay featureName="Weekly Recap">
              <WeeklyRecap daysSober={daysSober} moneySaved={moneySaved} />
            </PremiumLockOverlay>
            <AchievementBadges daysSober={daysSober} />
          </div>
        );

      case "checkin":
        return (
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-1">
              <h1 className="text-lg font-bold text-foreground mb-0.5">Daily Check-In</h1>
              <p className="text-xs text-muted-foreground">How are you feeling today?</p>
            </motion.div>
            <CheckInProgress />
            <DailyAffirmation />
            <MoodCheckIn />
            <SleepTracker />
            <HydrationTracker />
            <Journal daysSober={daysSober} />
            <BreathingExercise />
            <GuidedMeditations />
            <CalendarHeatmap startDate={userData.sobrietyStartDate} />
          </div>
        );

      case "triggers":
        return (
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-1">
              <h1 className="text-lg font-bold text-foreground mb-0.5">Triggers & Coping</h1>
              <p className="text-xs text-muted-foreground">Know yourself to protect yourself</p>
            </motion.div>
            <CravingTimer />
            <PremiumLockOverlay featureName="Risk Insights">
              <RiskPrediction />
            </PremiumLockOverlay>
            <TriggerLogger />
            <PremiumLockOverlay featureName="Pattern Analysis">
              <PatternAnalysis />
            </PremiumLockOverlay>
            <RelapsePreventionPlan />
            <CrisisResources />
            
          </div>
        );

      case "progress":
        return (
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-1">
              <h1 className="text-lg font-bold text-foreground mb-0.5">Your Journey</h1>
              <p className="text-xs text-muted-foreground">Every step counts</p>
            </motion.div>
            <ProgressView daysSober={daysSober} totalSaved={moneySaved} dailySpending={userData.dailySpending} />
            <CalendarHeatmap startDate={userData.sobrietyStartDate} />
            <PremiumLockOverlay featureName="Deep Insights & Analytics">
              <PremiumProgressInsights daysSober={daysSober} />
            </PremiumLockOverlay>
            <PremiumFeatureSection
              title="Sober Club Premium"
              features={[
                { name: "Recovery Pathways" },
                { name: "Predictive Insights" },
                { name: "Accountability Partner" },
                { name: "AI Recommendations" },
                { name: "Advanced Analytics" },
              ]}
            >
              <GuidedPathways />
              <PredictiveInsights />
              <AccountabilityPartner />
              <PersonalizedRecommendations />
              <PremiumAnalytics />
            </PremiumFeatureSection>
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
          
          <div className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 py-2 flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground tracking-tight">Sobable</span>
              {(userXP?.daily_login_streak ?? 0) > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-accent/15 border border-accent/30"
                >
                  <Flame className="w-3 h-3 text-accent" />
                  <span className="text-[10px] font-bold text-accent">{userXP?.daily_login_streak}</span>
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
          className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 md:px-6 py-3 pb-24 relative overflow-x-hidden"
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
        <AIRecoveryCoach isOpen={coachOpen} onOpenChange={setCoachOpen} />
        <PremiumOnboarding open={showPremiumOnboarding} onClose={() => setShowPremiumOnboarding(false)} />
        <FeedbackPromptDialog open={showFeedback} onDismiss={dismissFeedback} onSubmitted={feedbackSubmitted} />
        <AdBanner position="bottom" />
      </div>
    </XPNotificationProvider>
  );
};

export default Index;
