import { useEffect, useCallback, useState } from "react";
import { differenceInDays, differenceInHours, isToday, parseISO, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SmartNotificationSettings {
  enabled: boolean;
  missedCheckIn: boolean;
  missedJournal: boolean;
  missedMeditation: boolean;
  streakAtRisk: boolean;
  weeklyReport: boolean;
  lastMissedCheckInReminder: string | null;
  lastStreakRiskReminder: string | null;
  lastWeeklyReportReminder: string | null;
}

interface MissedAction {
  type: 'checkIn' | 'journal' | 'meditation' | 'trigger';
  lastCompleted: string | null;
  daysAgo: number;
}

const getDefaultSettings = (): SmartNotificationSettings => ({
  enabled: false,
  missedCheckIn: true,
  missedJournal: true,
  missedMeditation: true,
  streakAtRisk: true,
  weeklyReport: true,
  lastMissedCheckInReminder: null,
  lastStreakRiskReminder: null,
  lastWeeklyReportReminder: null,
});

export const useSmartNotifications = (sobrietyStartDate?: string) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<SmartNotificationSettings>(getDefaultSettings);
  const [missedActions, setMissedActions] = useState<MissedAction[]>([]);
  const [streakAtRisk, setStreakAtRisk] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    const saved = localStorage.getItem("smart_notification_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Check for missed actions
  const checkMissedActions = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const missed: MissedAction[] = [];

    // Check daily goals for today
    const { data: todayGoals } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    // Check last mood entry
    const { data: lastMood } = await supabase
      .from("mood_entries")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastMood || !isToday(parseISO(lastMood.date))) {
      const daysAgo = lastMood ? differenceInDays(new Date(), parseISO(lastMood.date)) : 999;
      missed.push({ type: 'checkIn', lastCompleted: lastMood?.date || null, daysAgo });
    }

    // Check last journal entry
    const { data: lastJournal } = await supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastJournal || !isToday(parseISO(lastJournal.created_at))) {
      const daysAgo = lastJournal ? differenceInDays(new Date(), parseISO(lastJournal.created_at)) : 999;
      if (daysAgo >= 2) { // Only flag if 2+ days
        missed.push({ type: 'journal', lastCompleted: lastJournal?.created_at || null, daysAgo });
      }
    }

    // Check meditation status
    if (todayGoals && !todayGoals.meditation_done) {
      missed.push({ type: 'meditation', lastCompleted: null, daysAgo: 0 });
    }

    setMissedActions(missed);

    // Check if streak is at risk (last activity was yesterday and nothing done today)
    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("current_streak, last_activity_date")
      .eq("user_id", user.id)
      .eq("streak_type", "check_in")
      .maybeSingle();

    if (streakData && streakData.current_streak > 0) {
      const lastActivity = streakData.last_activity_date;
      if (lastActivity) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        
        // Streak at risk if last activity was yesterday and it's getting late
        const currentHour = new Date().getHours();
        if (lastActivity === yesterdayStr || (lastActivity < yesterdayStr)) {
          setStreakAtRisk(true);
        } else if (lastActivity === today) {
          setStreakAtRisk(false);
        } else if (currentHour >= 18 && lastActivity !== today) {
          // Evening warning if haven't checked in today
          setStreakAtRisk(true);
        } else {
          setStreakAtRisk(false);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkMissedActions();
      const interval = setInterval(checkMissedActions, 5 * 60 * 1000); // Check every 5 minutes
      return () => clearInterval(interval);
    }
  }, [user, checkMissedActions]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === "granted") {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      localStorage.setItem("smart_notification_settings", JSON.stringify(newSettings));
      return true;
    }
    return false;
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<SmartNotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem("smart_notification_settings", JSON.stringify(newSettings));
  }, [settings]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== "granted" || !settings.enabled) return;

    try {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }, [permission, settings.enabled]);

  // Smart notification for missed check-in (only after 2PM if not checked in)
  const checkMissedCheckInReminder = useCallback(() => {
    if (!settings.enabled || !settings.missedCheckIn) return;
    if (missedActions.every(m => m.type !== 'checkIn')) return;

    const now = new Date();
    const lastReminder = settings.lastMissedCheckInReminder;
    
    if (lastReminder) {
      const hoursSinceReminder = differenceInHours(now, new Date(lastReminder));
      if (hoursSinceReminder < 6) return; // Don't remind more than every 6 hours
    }

    const currentHour = now.getHours();
    // Send reminder after 2PM if not checked in
    if (currentHour >= 14 && currentHour < 20) {
      const checkIn = missedActions.find(m => m.type === 'checkIn');
      const message = checkIn && checkIn.daysAgo > 1 
        ? `You haven't checked in for ${checkIn.daysAgo} days. How are you feeling?`
        : "Take a quick moment to log how you're feeling today.";

      sendNotification("Your check-in is waiting ✨", {
        body: message,
        tag: "missed-checkin",
      });
      updateSettings({ lastMissedCheckInReminder: now.toISOString() });
    }
  }, [settings, missedActions, sendNotification, updateSettings]);

  // Streak at risk notification
  const checkStreakRiskReminder = useCallback(() => {
    if (!settings.enabled || !settings.streakAtRisk || !streakAtRisk) return;

    const now = new Date();
    const lastReminder = settings.lastStreakRiskReminder;
    
    if (lastReminder) {
      const hoursSinceReminder = differenceInHours(now, new Date(lastReminder));
      if (hoursSinceReminder < 4) return;
    }

    const currentHour = now.getHours();
    // Alert in evening if streak at risk
    if (currentHour >= 18 && currentHour < 22) {
      sendNotification("🔥 Streak at risk!", {
        body: "Complete your daily check-in before midnight to keep your streak alive!",
        tag: "streak-risk",
      });
      updateSettings({ lastStreakRiskReminder: now.toISOString() });
    }
  }, [settings, streakAtRisk, sendNotification, updateSettings]);

  // Weekly report notification (Sundays)
  const checkWeeklyReportReminder = useCallback(() => {
    if (!settings.enabled || !settings.weeklyReport) return;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentHour = now.getHours();
    
    // Sunday between 9-11 AM
    if (dayOfWeek === 0 && currentHour >= 9 && currentHour < 11) {
      const lastReminder = settings.lastWeeklyReportReminder;
      if (lastReminder) {
        const daysSince = differenceInDays(now, new Date(lastReminder));
        if (daysSince < 6) return;
      }

      sendNotification("📊 Your Weekly Report is Ready!", {
        body: "See your progress, insights, and achievements from this week.",
        tag: "weekly-report",
      });
      updateSettings({ lastWeeklyReportReminder: now.toISOString() });
    }
  }, [settings, sendNotification, updateSettings]);

  // Run notification checks
  useEffect(() => {
    if (!settings.enabled) return;

    const checkAllNotifications = () => {
      checkMissedCheckInReminder();
      checkStreakRiskReminder();
      checkWeeklyReportReminder();
    };

    checkAllNotifications();
    const interval = setInterval(checkAllNotifications, 30 * 60 * 1000); // Every 30 min

    return () => clearInterval(interval);
  }, [settings.enabled, checkMissedCheckInReminder, checkStreakRiskReminder, checkWeeklyReportReminder]);

  return {
    permission,
    settings,
    requestPermission,
    updateSettings,
    sendNotification,
    missedActions,
    streakAtRisk,
    isSupported: "Notification" in window,
    checkMissedActions,
  };
};
