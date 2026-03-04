import { useEffect, useCallback, useState } from "react";
import { differenceInDays, differenceInHours, isToday, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SmartNotificationSettings {
  enabled: boolean;
  missedCheckIn: boolean;
  missedJournal: boolean;
  missedMeditation: boolean;
  streakAtRisk: boolean;
  weeklyReport: boolean;
  cravingSpike: boolean;
  lastMissedCheckInReminder: string | null;
  lastMissedJournalReminder: string | null;
  lastMissedMeditationReminder: string | null;
  lastStreakRiskReminder: string | null;
  lastWeeklyReportReminder: string | null;
  lastCravingSpikeReminder: string | null;
}

interface MissedAction {
  type: 'checkIn' | 'journal' | 'meditation' | 'trigger';
  lastCompleted: string | null;
  daysAgo: number;
}

const STORAGE_KEY = "smart_notification_settings";

const getDefaultSettings = (): SmartNotificationSettings => ({
  enabled: false,
  missedCheckIn: true,
  missedJournal: true,
  missedMeditation: true,
  streakAtRisk: true,
  weeklyReport: true,
  cravingSpike: true,
  lastMissedCheckInReminder: null,
  lastMissedJournalReminder: null,
  lastMissedMeditationReminder: null,
  lastStreakRiskReminder: null,
  lastWeeklyReportReminder: null,
  lastCravingSpikeReminder: null,
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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...getDefaultSettings(), ...parsed });
      } catch {
        setSettings(getDefaultSettings());
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      return true;
    }
    return false;
  }, [settings]);

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
      if (daysAgo >= 2) {
        missed.push({ type: 'journal', lastCompleted: lastJournal?.created_at || null, daysAgo });
      }
    }

    // Check meditation status
    if (!todayGoals || !todayGoals.meditation_done) {
      missed.push({ type: 'meditation', lastCompleted: null, daysAgo: 0 });
    }

    setMissedActions(missed);

    // Check if streak is at risk
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
        const currentHour = new Date().getHours();

        if (lastActivity <= yesterdayStr) {
          setStreakAtRisk(true);
        } else if (lastActivity === today) {
          setStreakAtRisk(false);
        } else if (currentHour >= 18 && lastActivity !== today) {
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
      const interval = setInterval(checkMissedActions, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, checkMissedActions]);

  const updateSettings = useCallback((updates: Partial<SmartNotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  }, [settings]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== "granted" || !settings.enabled) return;
    try {
      new Notification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
        ...options,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }, [permission, settings.enabled]);

  // Missed check-in reminder (after 2PM)
  const checkMissedCheckInReminder = useCallback(() => {
    if (!settings.enabled || !settings.missedCheckIn) return;
    if (missedActions.every(m => m.type !== 'checkIn')) return;

    const now = new Date();
    const lastReminder = settings.lastMissedCheckInReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 6) return;

    const currentHour = now.getHours();
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

  // Missed journal reminder (after 4PM, only if 2+ days missed)
  const checkMissedJournalReminder = useCallback(() => {
    if (!settings.enabled || !settings.missedJournal) return;

    const journalMissed = missedActions.find(m => m.type === 'journal');
    if (!journalMissed || journalMissed.daysAgo < 2) return;

    const now = new Date();
    const lastReminder = settings.lastMissedJournalReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 24) return;

    const currentHour = now.getHours();
    if (currentHour >= 16 && currentHour < 21) {
      sendNotification("📝 Your journal misses you", {
        body: `It's been ${journalMissed.daysAgo} days since your last entry. Writing helps process emotions.`,
        tag: "missed-journal",
      });
      updateSettings({ lastMissedJournalReminder: now.toISOString() });
    }
  }, [settings, missedActions, sendNotification, updateSettings]);

  // Missed meditation reminder (after 6PM)
  const checkMissedMeditationReminder = useCallback(() => {
    if (!settings.enabled || !settings.missedMeditation) return;
    if (missedActions.every(m => m.type !== 'meditation')) return;

    const now = new Date();
    const lastReminder = settings.lastMissedMeditationReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 12) return;

    const currentHour = now.getHours();
    if (currentHour >= 18 && currentHour < 22) {
      sendNotification("🧘 Time for some peace", {
        body: "A short breathing exercise can lower stress and cravings. Try 5 minutes tonight.",
        tag: "missed-meditation",
      });
      updateSettings({ lastMissedMeditationReminder: now.toISOString() });
    }
  }, [settings, missedActions, sendNotification, updateSettings]);

  // Streak at risk notification
  const checkStreakRiskReminder = useCallback(() => {
    if (!settings.enabled || !settings.streakAtRisk || !streakAtRisk) return;

    const now = new Date();
    const lastReminder = settings.lastStreakRiskReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 4) return;

    const currentHour = now.getHours();
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

    if (dayOfWeek === 0 && currentHour >= 9 && currentHour < 11) {
      const lastReminder = settings.lastWeeklyReportReminder;
      if (lastReminder && differenceInDays(now, new Date(lastReminder)) < 6) return;

      sendNotification("📊 Your Weekly Report is Ready!", {
        body: "See your progress, insights, and achievements from this week.",
        tag: "weekly-report",
      });
      updateSettings({ lastWeeklyReportReminder: now.toISOString() });
    }
  }, [settings, sendNotification, updateSettings]);

  // Craving spike alert — check recent mood entries for high cravings
  const checkCravingSpikeAlert = useCallback(async () => {
    if (!settings.enabled || !settings.cravingSpike || !user) return;

    const now = new Date();
    const lastReminder = settings.lastCravingSpikeReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 4) return;

    // Check the most recent mood entry from today
    const today = now.toISOString().split("T")[0];
    const { data: recentMood } = await supabase
      .from("mood_entries")
      .select("craving_level, created_at")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentMood && recentMood.craving_level >= 8) {
      // Only alert if entry was within last 30 min
      const entryTime = new Date(recentMood.created_at);
      const minutesAgo = (now.getTime() - entryTime.getTime()) / 60000;
      if (minutesAgo <= 30) {
        sendNotification("💪 High craving detected", {
          body: "Your craving level is high. Try the breathing exercise or craving timer now — you've got this!",
          tag: "craving-spike",
        });
        updateSettings({ lastCravingSpikeReminder: now.toISOString() });
      }
    }
  }, [settings, user, sendNotification, updateSettings]);

  // Run notification checks
  useEffect(() => {
    if (!settings.enabled) return;

    const checkAllNotifications = () => {
      checkMissedCheckInReminder();
      checkMissedJournalReminder();
      checkMissedMeditationReminder();
      checkStreakRiskReminder();
      checkWeeklyReportReminder();
      checkCravingSpikeAlert();
    };

    checkAllNotifications();
    const interval = setInterval(checkAllNotifications, 15 * 60 * 1000); // Every 15 min

    return () => clearInterval(interval);
  }, [settings.enabled, checkMissedCheckInReminder, checkMissedJournalReminder, checkMissedMeditationReminder, checkStreakRiskReminder, checkWeeklyReportReminder, checkCravingSpikeAlert]);

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
