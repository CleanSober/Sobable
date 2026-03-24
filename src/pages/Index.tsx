import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useGamification } from "@/hooks/useGamification";
import { Loader2, Flame, Bot, Crown, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { SobrietyCounter } from "@/components/SobrietyCounter";

import { Onboarding } from "@/components/Onboarding";
import { BottomTabs, type TabId, TAB_ORDER } from "@/components/BottomTabs";
import { UserProfile } from "@/components/UserProfile";
import { CheckInProgress } from "@/components/CheckInProgress";
import { DailyRitual } from "@/components/DailyRitual";

import { XPNotificationProvider } from "@/components/XPNotification";
import { PremiumLockOverlay } from "@/components/premium/PremiumLockOverlay";
import { useFeedbackPrompt } from "@/hooks/useFeedbackPrompt";
import { useMilestoneUpgrade } from "@/hooks/useMilestoneUpgrade";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useCapacitor } from "@/hooks/useCapacitor";
import { useSmartNotifications } from "@/hooks/useSmartNotifications";
import { calculateDaysSober, calculateMoneySaved } from "@/lib/storage";
import { NotificationCenter } from "@/components/NotificationCenter";

// Lazy load components not needed on initial paint
const MoneySaved = lazy(() => import("@/components/MoneySaved").then(m => ({ default: m.MoneySaved })));
const QuickActions = lazy(() => import("@/components/QuickActions").then(m => ({ default: m.QuickActions })));
const MoodCheckIn = lazy(() => import("@/components/MoodCheckIn").then(m => ({ default: m.MoodCheckIn })));
const AIRecoveryCoach = lazy(() => import("@/components/AIRecoveryCoach").then(m => ({ default: m.AIRecoveryCoach })));
const AdBanner = lazy(() => import("@/components/AdBanner").then(m => ({ default: m.AdBanner })));
const PremiumOnboarding = lazy(() => import("@/components/premium/PremiumOnboarding").then(m => ({ default: m.PremiumOnboarding })));
const FeedbackPromptDialog = lazy(() => import("@/components/FeedbackPromptDialog").then(m => ({ default: m.FeedbackPromptDialog })));
const MilestoneUpgradePrompt = lazy(() => import("@/components/MilestoneUpgradePrompt").then(m => ({ default: m.MilestoneUpgradePrompt })));

// Lazy load heavy tab content
const ProgressView = lazy(() => import("@/components/ProgressView").then(m => ({ default: m.ProgressView })));
const TriggerLogger = lazy(() => import("@/components/TriggerLogger").then(m => ({ default: m.TriggerLogger })));
const PatternAnalysis = lazy(() => import("@/components/PatternAnalysis").then(m => ({ default: m.PatternAnalysis })));
const AchievementBadges = lazy(() => import("@/components/AchievementBadges").then(m => ({ default: m.AchievementBadges })));
const CravingTimer = lazy(() => import("@/components/CravingTimer").then(m => ({ default: m.CravingTimer })));
const CalendarHeatmap = lazy(() => import("@/components/CalendarHeatmap").then(m => ({ default: m.CalendarHeatmap })));
const HydrationTracker = lazy(() => import("@/components/HydrationTracker").then(m => ({ default: m.HydrationTracker })));
const DailyAffirmation = lazy(() => import("@/components/DailyAffirmation").then(m => ({ default: m.DailyAffirmation })));

const RelapsePreventionPlan = lazy(() => import("@/components/RelapsePreventionPlan").then(m => ({ default: m.RelapsePreventionPlan })));
const SleepTracker = lazy(() => import("@/components/SleepTracker").then(m => ({ default: m.SleepTracker })));
const CommunityHub = lazy(() => import("@/components/community/CommunityHub").then(m => ({ default: m.CommunityHub })));
const BreathingExercise = lazy(() => import("@/components/BreathingExercise").then(m => ({ default: m.BreathingExercise })));
const GuidedMeditations = lazy(() => import("@/components/GuidedMeditations").then(m => ({ default: m.GuidedMeditations })));
const CrisisResources = lazy(() => import("@/components/CrisisResources").then(m => ({ default: m.CrisisResources })));
const PremiumAnalytics = lazy(() => import("@/components/PremiumAnalytics").then(m => ({ default: m.PremiumAnalytics })));
const PersonalizedRecommendations = lazy(() => import("@/components/PersonalizedRecommendations").then(m => ({ default: m.PersonalizedRecommendations })));
const Journal = lazy(() => import("@/components/Journal").then(m => ({ default: m.Journal })));
const RiskPrediction = lazy(() => import("@/components/RiskPrediction").then(m => ({ default: m.RiskPrediction })));

const PremiumProgressInsights = lazy(() => import("@/components/progress/PremiumProgressInsights").then(m => ({ default: m.PremiumProgressInsights })));
const WeeklyRecap = lazy(() => import("@/components/premium/WeeklyRecap").then(m => ({ default: m.WeeklyRecap })));
const GuidedPathways = lazy(() => import("@/components/premium/GuidedPathways").then(m => ({ default: m.GuidedPathways })));
const AccountabilityPartner = lazy(() => import("@/components/premium/AccountabilityPartner").then(m => ({ default: m.AccountabilityPartner })));
const PredictiveInsights = lazy(() => import("@/components/premium/PredictiveInsights").then(m => ({ default: m.PredictiveInsights })));
const PremiumFeatureSection = lazy(() => import("@/components/premium/PremiumFeatureSection").then(m => ({ default: m.PremiumFeatureSection })));

const TabLoader = memo(() => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-6 h-6 animate-spin text-primary" />
  </div>
));

const Index = () => {
  const { user, loading: authLoading, isGuest } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserData();
  const { userXP } = useGamification();
  const { showPrompt: showFeedback, triggerFeedback, dismiss: dismissFeedback, markSubmitted: feedbackSubmitted } = useFeedbackPrompt();
  const { pendingPrompt, showPricing: milestoneShowPricing, setShowPricing: setMilestoneShowPricing, triggerMilestone, dismissPrompt, upgradeFromPrompt } = useMilestoneUpgrade();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [swipeDirection, setSwipeDirection] = useState<number>(0);
  const [coachOpen, setCoachOpen] = useState(false);
  const [showPremiumOnboarding, setShowPremiumOnboarding] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(prev => {
      const oldIndex = TAB_ORDER.indexOf(prev);
      const newIndex = TAB_ORDER.indexOf(tab);
      setSwipeDirection(newIndex > oldIndex ? 1 : -1);
      return tab;
    });
  }, []);

  const { onTouchStart, onTouchEnd } = useSwipeNavigation(
    TAB_ORDER,
    activeTab,
    handleTabChange
  );
  // Initialize Capacitor for native mobile features
  useCapacitor();

  // Initialize smart notifications system - runs all notification checks periodically
  const { requestPermission: requestNotifPermission } = useSmartNotifications(profile?.sobriety_start_date || undefined);

  // Prompt notification permission once after onboarding
  useEffect(() => {
    if (!user || !profile?.onboarding_complete) return;
    const prompted = localStorage.getItem(`sobable_notif_prompted_${user.id}`);
    if (prompted) return;
    
    const timer = setTimeout(async () => {
      if ("Notification" in window && Notification.permission === "default") {
        const granted = await requestNotifPermission();
        if (granted) {
          toast.success("🔔 Notifications enabled!", { description: "You'll get smart reminders to stay on track." });
        }
      }
      localStorage.setItem(`sobable_notif_prompted_${user.id}`, "true");
    }, 5000);
    return () => clearTimeout(timer);
  }, [user, profile?.onboarding_complete, requestNotifPermission]);

  useEffect(() => {
    if (!authLoading && !user && !isGuest) {
      navigate("/auth");
    }
  }, [user, authLoading, isGuest, navigate]);

  // Daily motivational messages pool
  const dailyMotivations = useMemo(() => [
    { emoji: "💪", message: "Every single day you choose yourself. That's real strength." },
    { emoji: "🌅", message: "A new sunrise, a new chance to be proud of who you're becoming." },
    { emoji: "🦋", message: "Growth isn't always visible — but it's always happening inside you." },
    { emoji: "⭐", message: "You are doing something most people only dream about. Keep going." },
    { emoji: "🔥", message: "Your courage today is writing your comeback story." },
    { emoji: "🌊", message: "Waves come and go. You're still standing. That's everything." },
    { emoji: "🏔️", message: "One step at a time — you're climbing higher than you think." },
    { emoji: "🌟", message: "The hardest battles are fought by the strongest people. That's you." },
    { emoji: "🌿", message: "Healing isn't linear, but every moment of sobriety counts." },
    { emoji: "💎", message: "Pressure creates diamonds. You're becoming unbreakable." },
    { emoji: "🕊️", message: "Freedom isn't given — it's earned. And you're earning it every day." },
    { emoji: "🌻", message: "You're not just surviving anymore. You're learning to thrive." },
    { emoji: "🎯", message: "Showing up is the hardest part — and you just did it." },
    { emoji: "🧠", message: "Your brain is literally rewiring itself right now. Trust the process." },
    { emoji: "❤️‍🔥", message: "The version of you a year from now will thank you for today." },
    { emoji: "🛡️", message: "You've already proven you're stronger than your worst day." },
    { emoji: "🌈", message: "After every storm comes clarity. You're in the clearing now." },
    { emoji: "⚡", message: "Recovery isn't weakness — it's the most powerful thing you'll ever do." },
    { emoji: "🎭", message: "You don't have to pretend anymore. This is the real you, and you're amazing." },
    { emoji: "🌙", message: "Rest when you need to, but never quit. Tomorrow needs you sober." },
    { emoji: "🏆", message: "Champions aren't born — they're built one sober day at a time." },
    { emoji: "🧭", message: "You may not see the whole path, but you're heading in the right direction." },
    { emoji: "🌱", message: "Small roots grow into mighty trees. Your consistency is your superpower." },
    { emoji: "✨", message: "The world is brighter when you're present in it. Stay." },
    { emoji: "🫂", message: "You're never alone in this — even when it feels like it." },
    { emoji: "🔑", message: "You hold the key to your own freedom. And you're using it." },
    { emoji: "🌄", message: "Look how far you've come. Don't you dare give up now." },
    { emoji: "💜", message: "Be gentle with yourself today. You're doing harder things than most people know." },
    { emoji: "🎶", message: "Life has a rhythm again because you chose recovery. Feel it." },
    { emoji: "🪴", message: "You planted a seed the day you started. Watch what grows." },
  ], []);

  // Welcome back toast with daily motivation
  const welcomeShownRef = useRef(false);
  useEffect(() => {
    if (welcomeShownRef.current || authLoading || profileLoading || !user || !profile?.onboarding_complete) return;
    if (!userXP) return;

    welcomeShownRef.current = true;

    const streak = userXP.daily_login_streak ?? 0;
    const name = profile?.display_name;
    const daysSober = profile?.sobriety_start_date ? calculateDaysSober(profile.sobriety_start_date) : 0;

    // Pick today's motivation based on date so it's consistent within a day
    const today = new Date();
    const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % dailyMotivations.length;
    const motivation = dailyMotivations[dayIndex];

    // Only show the daily motivation once per calendar day
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const lastMotivationDay = localStorage.getItem(`sobable_daily_motivation_${user.id}`);
    const isNewDay = lastMotivationDay !== todayKey;

    const timer = setTimeout(() => {
      // First toast: personalized greeting with streak
      const greeting = name ? `Welcome back, ${name}!` : "Welcome back!";
      if (streak > 1) {
        toast(greeting, {
          description: `🔥 ${streak}-day streak${daysSober > 0 ? ` · ${daysSober} days sober` : ""}! Keep it going!`,
          duration: 4000,
        });
      } else if (streak === 1) {
        toast(greeting, {
          description: "🌱 Day 1 of your streak — let's build momentum!",
          duration: 4000,
        });
      } else {
        toast(greeting, {
          description: daysSober > 0 ? `✨ ${daysSober} days of strength. Great to see you!` : "✨ Great to see you again!",
          duration: 3500,
        });
      }

      // Second toast: daily motivational message (only once per day)
      if (isNewDay) {
        localStorage.setItem(`sobable_daily_motivation_${user.id}`, todayKey);
        setTimeout(() => {
          toast(`${motivation.emoji} Daily Inspiration`, {
            description: motivation.message,
            duration: 6000,
          });
        }, 2500);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [authLoading, profileLoading, user, userXP, profile, dailyMotivations]);

  // Premium onboarding removed — users see premium features via PricingPlans dialog

  // Trigger feedback prompt on milestone days
  useEffect(() => {
    if (!profile?.sobriety_start_date || !user) return;
    const days = calculateDaysSober(profile.sobriety_start_date);
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    if (milestones.includes(days)) {
      triggerFeedback("milestone");
    }
  }, [profile?.sobriety_start_date, user, triggerFeedback]);

  // Trigger milestone upgrade prompts at key engagement moments
  useEffect(() => {
    if (!user || !profile?.onboarding_complete) return;
    const streak = userXP?.daily_login_streak ?? 0;
    const daysSober = profile?.sobriety_start_date ? calculateDaysSober(profile.sobriety_start_date) : 0;

    // Streak milestones
    if (streak >= 3) triggerMilestone("streak_3");
    if (streak >= 7) triggerMilestone("streak_7");
    if (streak >= 14) triggerMilestone("streak_14");
    if (streak >= 30) triggerMilestone("streak_30");

    // Sobriety milestones
    if (daysSober >= 7) triggerMilestone("sober_7");
    if (daysSober >= 30) triggerMilestone("sober_30");
    if (daysSober >= 90) triggerMilestone("sober_90");

    // First-action milestones (check DB counts)
    const checkFirstActions = async () => {
      const [moodRes, journalRes, triggerRes] = await Promise.all([
        supabase.from("mood_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("trigger_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if ((moodRes.count ?? 0) >= 1) triggerMilestone("first_mood");
      if ((journalRes.count ?? 0) >= 1) triggerMilestone("first_journal");
      if ((triggerRes.count ?? 0) >= 1) triggerMilestone("first_trigger");
    };
    checkFirstActions();
  }, [user, profile?.onboarding_complete, userXP?.daily_login_streak, profile?.sobriety_start_date, triggerMilestone]);

  if (authLoading || (!isGuest && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !isGuest) return null;

  // Guest mode: use localStorage for profile data
  const guestProfile = isGuest && !user ? (() => {
    const stored = localStorage.getItem("sobable_guest_profile");
    return stored ? JSON.parse(stored) : null;
  })() : null;

  const effectiveProfile = user ? profile : guestProfile;
  const showOnboarding = !effectiveProfile?.onboarding_complete;

  const handleOnboardingComplete = async (data: {
    name: string;
    substances: string[];
    sobrietyStartDate: string;
    dailySpending: number;
    sponsorPhone?: string;
    emergencyContact?: string;
    personalReminder?: string;
  }) => {
    if (user) {
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
    } else {
      // Guest mode: save to localStorage
      const guestData = {
        display_name: data.name,
        substances: data.substances,
        sobriety_start_date: data.sobrietyStartDate,
        daily_spending: data.dailySpending,
        sponsor_phone: data.sponsorPhone,
        emergency_contact: data.emergencyContact,
        personal_reminder: data.personalReminder,
        onboarding_complete: true,
      };
      localStorage.setItem("sobable_guest_profile", JSON.stringify(guestData));
      // Force re-render
      window.location.reload();
    }
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const daysSober = effectiveProfile?.sobriety_start_date
    ? calculateDaysSober(effectiveProfile.sobriety_start_date)
    : 0;
  const moneySaved = effectiveProfile?.sobriety_start_date && effectiveProfile?.daily_spending
    ? calculateMoneySaved(effectiveProfile.sobriety_start_date, effectiveProfile.daily_spending, effectiveProfile.savings_start_date)
    : 0;
  const savingsDaysSober = effectiveProfile?.sobriety_start_date
    ? calculateDaysSober(effectiveProfile.savings_start_date || effectiveProfile.sobriety_start_date)
    : 0;

  // Convert profile to userData format for components that need it
  const userData = {
    name: effectiveProfile?.display_name || "",
    substances: effectiveProfile?.substances || [],
    sobrietyStartDate: effectiveProfile?.sobriety_start_date || new Date().toISOString().split("T")[0],
    dailySpending: effectiveProfile?.daily_spending || 0,
    sponsorPhone: effectiveProfile?.sponsor_phone,
    emergencyContact: effectiveProfile?.emergency_contact,
    personalReminder: effectiveProfile?.personal_reminder,
    onboardingComplete: effectiveProfile?.onboarding_complete || false,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-3">
            {/* Guest sign-up banner */}
            {isGuest && !user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-enhanced p-3 flex items-center gap-3 border-primary/30"
              >
                <div className="p-2 rounded-xl bg-primary/15">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">Create a free account</h3>
                  <p className="text-[10px] text-muted-foreground">Save your progress across devices & unlock all features</p>
                </div>
                <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={() => navigate("/auth")}>
                  Sign Up
                </Button>
              </motion.div>
            )}
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="glass-card rounded-2xl p-3 text-center"
            >
              <p className="text-muted-foreground text-[10px] mb-0.5 font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 className="text-lg font-bold text-foreground">
                {effectiveProfile?.display_name ? (
                  <>Keep going, <span className="text-gradient">{effectiveProfile.display_name}</span>!</>
                ) : (
                  "You're doing amazing!"
                )} 🌟
              </h1>
            </motion.div>
            <SobrietyCounter daysSober={daysSober} startDate={userData.sobrietyStartDate} />
            <CheckInProgress />
            {userData.dailySpending > 0 && <MoneySaved totalSaved={moneySaved} dailySpending={userData.dailySpending} daysSober={savingsDaysSober} onReset={async () => {
              const prevDate = effectiveProfile?.savings_start_date || effectiveProfile?.sobriety_start_date || null;
              if (prevDate) {
                localStorage.setItem("sobable_savings_reset_undo", JSON.stringify({
                  previousDate: prevDate,
                  resetAt: Date.now(),
                }));
              }
              if (user) {
                await updateProfile({ savings_start_date: new Date().toISOString().split("T")[0] } as any);
              } else {
                const gp = JSON.parse(localStorage.getItem("sobable_guest_profile") || "{}");
                gp.savings_start_date = new Date().toISOString().split("T")[0];
                localStorage.setItem("sobable_guest_profile", JSON.stringify(gp));
              }
              toast.success("Savings counter reset! Your sobriety date is unchanged.");
            }} onUndo={async () => {
              const raw = localStorage.getItem("sobable_savings_reset_undo");
              if (!raw) return;
              const { previousDate } = JSON.parse(raw);
              if (user) {
                await updateProfile({ savings_start_date: previousDate === effectiveProfile?.sobriety_start_date ? null : previousDate } as any);
              } else {
                const gp = JSON.parse(localStorage.getItem("sobable_guest_profile") || "{}");
                gp.savings_start_date = previousDate;
                localStorage.setItem("sobable_guest_profile", JSON.stringify(gp));
              }
              localStorage.removeItem("sobable_savings_reset_undo");
              toast.success("Savings reset undone! Your previous tracking has been restored.");
            }} />}
            <DailyRitual onNavigateToCheckIn={() => setActiveTab("checkin")} />
            <QuickActions onNavigateToCheckIn={() => setActiveTab("checkin")} />
            <Suspense fallback={<TabLoader />}>
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
            </Suspense>
          </div>
        );

      case "checkin":
        return (
          <Suspense fallback={<TabLoader />}>
            <div className="space-y-3">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-1">
                <h1 className="text-lg font-bold text-foreground mb-0.5">Daily Check-In</h1>
                <p className="text-xs text-muted-foreground">How are you feeling today?</p>
              </motion.div>
              <DailyAffirmation />
              <MoodCheckIn />
              <SleepTracker />
              <HydrationTracker />
              <Journal daysSober={daysSober} />
              <BreathingExercise />
              <GuidedMeditations />
            </div>
          </Suspense>
        );

      case "triggers":
        return (
          <Suspense fallback={<TabLoader />}>
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
          </Suspense>
        );

      case "progress":
        return (
          <Suspense fallback={<TabLoader />}>
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
                title="Sober Club"
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
          </Suspense>
        );

      case "community":
        return (
          <Suspense fallback={<TabLoader />}>
            <CommunityHub />
          </Suspense>
        );

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
              <span className="text-base font-bold text-foreground tracking-tight">Sober Club</span>
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
        <Suspense fallback={null}>
          {coachOpen && <AIRecoveryCoach isOpen={coachOpen} onOpenChange={setCoachOpen} />}
          {showPremiumOnboarding && <PremiumOnboarding open={showPremiumOnboarding} onClose={() => setShowPremiumOnboarding(false)} />}
          {showFeedback && <FeedbackPromptDialog open={showFeedback} onDismiss={dismissFeedback} onSubmitted={feedbackSubmitted} />}
          <AdBanner position="bottom" />
          <MilestoneUpgradePrompt
            prompt={pendingPrompt}
            onDismiss={dismissPrompt}
            onUpgrade={upgradeFromPrompt}
            showPricing={milestoneShowPricing}
            onPricingChange={setMilestoneShowPricing}
          />
        </Suspense>
      </div>
    </XPNotificationProvider>
  );
};

export default Index;
