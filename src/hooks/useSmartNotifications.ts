import { useEffect, useCallback, useState } from "react";
import { differenceInDays, differenceInHours, isToday, parseISO, format } from "date-fns";
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
  comebackNudge: boolean;
  dailyMotivation: boolean;
  progressCelebration: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  lastMissedCheckInReminder: string | null;
  lastMissedJournalReminder: string | null;
  lastMissedMeditationReminder: string | null;
  lastStreakRiskReminder: string | null;
  lastWeeklyReportReminder: string | null;
  lastCravingSpikeReminder: string | null;
  lastComebackNudge: string | null;
  lastDailyMotivation: string | null;
  lastProgressCelebration: string | null;
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
  comebackNudge: true,
  dailyMotivation: true,
  progressCelebration: true,
  quietHoursEnabled: true,
  quietHoursStart: 22,
  quietHoursEnd: 8,
  lastMissedCheckInReminder: null,
  lastMissedJournalReminder: null,
  lastMissedMeditationReminder: null,
  lastStreakRiskReminder: null,
  lastWeeklyReportReminder: null,
  lastCravingSpikeReminder: null,
  lastComebackNudge: null,
  lastDailyMotivation: null,
  lastProgressCelebration: null,
});

// ── Varied, emotionally-rich message pools ──

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const checkInMessages = {
  titles: [
    "How are you really doing? 💛",
    "Quick check-in — 30 seconds 🕐",
    "Your future self will thank you ✨",
    "One tap, one step forward 🌱",
    "We're rooting for you today 💪",
  ],
  bodies: (daysAgo: number) => {
    if (daysAgo > 3) return [
      `It's been ${daysAgo} days — no judgment, just come back. We missed you.`,
      `${daysAgo} days since your last check-in. Every comeback starts with one tap.`,
      `Hey, ${daysAgo} days is nothing. What matters is right now. Check in? 🤝`,
    ];
    return [
      "Log how you're feeling — it takes 15 seconds and helps you see patterns.",
      "Even on tough days, tracking matters. You're building self-awareness.",
      "Your mood data becomes your superpower. Quick check-in?",
      "Just one tap to stay on track. How's today going?",
    ];
  },
};

const journalMessages = {
  titles: [
    "📝 Got 2 minutes to write?",
    "📝 Your thoughts matter",
    "📝 Put it on paper, let it go",
    "📝 Journal time — your safe space",
  ],
  bodies: (daysAgo: number) => [
    `It's been ${daysAgo} days. Writing even one sentence can shift your perspective.`,
    "People who journal regularly are 42% more likely to achieve their goals.",
    "Your journal is judgment-free. What's on your mind today?",
    "Sometimes the hardest feelings become clearest on paper. Try it?",
  ],
};

const meditationMessages = {
  titles: [
    "🧘 5 minutes of calm waiting",
    "🧘 Breathe — you deserve it",
    "🧘 Wind down tonight",
    "🧘 Your evening reset",
  ],
  bodies: [
    "A short breathing exercise lowers cortisol by 23%. Your body will thank you.",
    "Tonight's challenge: 5 minutes of breathing. That's it. You've got this.",
    "Meditation isn't about being perfect — it's about pausing. Try it now?",
    "End today on a calm note. One breathing exercise before bed?",
  ],
};

const streakRiskMessages = {
  titles: [
    "🔥 Don't let your streak slip!",
    "🔥 Your streak needs you!",
    "🔥 Almost midnight — save your streak!",
    "🔥 {streak} days strong — keep going!",
  ],
  bodies: (streak: number) => [
    `${streak} days of consistency is incredible. Don't let today be the day it resets.`,
    "One quick check-in is all it takes. You didn't come this far to stop now.",
    `Your ${streak}-day streak is on the line. 60 seconds to save it!`,
    "Future you will be so glad you did this. Check in now!",
  ],
};

const weeklyReportMessages = {
  titles: [
    "📊 Your week in review is ready!",
    "📊 Look how far you've come this week",
    "📊 Sunday check: see your wins!",
  ],
  bodies: [
    "Your progress, insights, and achievements — all in one beautiful summary.",
    "Every week you show up is a week closer to the life you want.",
    "Numbers don't lie — see how you crushed it this week.",
  ],
};

const cravingSpikeMessages = {
  titles: [
    "💪 We see you're struggling — we're here",
    "💪 Craving detected — you have tools",
    "💪 This feeling is temporary",
    "💪 You're stronger than this moment",
  ],
  bodies: [
    "Try the breathing exercise or craving timer. This will pass — it always does.",
    "Cravings peak and fall within 20 minutes. Ride this wave — open the app.",
    "Call your support contact, try a breathing exercise, or journal about it. You've got options.",
    "Remember why you started. Open the app and use a coping tool now. 🤝",
  ],
};

const comebackMessages = {
  titles: [
    "We miss you 💛",
    "Hey, you okay? 🤗",
    "Your journey isn't over 🌅",
    "One step at a time 🌱",
  ],
  bodies: (daysAway: number, sobrietyDays?: number) => {
    const base = [
      "No judgment, no pressure. Just open the app when you're ready. We're here.",
      "Recovery isn't linear. Every day you come back is a victory.",
      "The hardest part is opening the app. Everything after that gets easier.",
    ];
    if (sobrietyDays && sobrietyDays > 30) {
      base.push(`You've built ${sobrietyDays} days of strength. Don't forget that.`);
    }
    if (daysAway > 7) {
      base.push("It's been a while, and that's okay. Your data is safe and waiting for you.");
    }
    return base;
  },
};

const dailyMotivationMessages = {
  titles: [
    "🌅 Good morning, warrior",
    "🌅 Today is yours",
    "🌅 Rise and recover",
    "☀️ A new day, a new chance",
    "🌟 You woke up — that's step one",
  ],
  bodies: (sobrietyDays?: number, streak?: number) => {
    const msgs = [
      "Every sober day is a gift you give yourself. Make today count.",
      "You didn't come this far to only come this far. Keep going.",
      "The person you're becoming is worth the discomfort you feel now.",
      "Recovery is not a race. It's a series of small, brave choices.",
      "You are proof that people can change. Show the world today.",
    ];
    if (sobrietyDays) {
      msgs.push(`Day ${sobrietyDays} — every single one of those days, you chose YOU.`);
    }
    if (streak && streak > 7) {
      msgs.push(`${streak}-day streak! Consistency is your superpower. 🔥`);
    }
    return msgs;
  },
};

const progressCelebrationMessages = {
  milestones: [
    { days: 1, title: "🎯 Day 1 — it begins!", body: "The hardest step is the first one. You just took it. Proud of you!" },
    { days: 3, title: "🎯 3 days strong!", body: "72 hours. Your body is already starting to heal. Keep going!" },
    { days: 7, title: "🎯 One week! 🌟", body: "7 days sober. That's 168 hours of courage. You're incredible." },
    { days: 14, title: "🎯 Two weeks! 💪", body: "14 days. Your sleep is improving, your mind is clearing. Feel it?" },
    { days: 30, title: "🎯 ONE MONTH! 🎉", body: "30 days of choosing yourself. Your liver is regenerating, your brain is healing." },
    { days: 60, title: "🎯 60 days! 🏆", body: "Two months. Most people never make it here. You're extraordinary." },
    { days: 90, title: "🎯 90 DAYS! 🎊", body: "A quarter year sober. Research shows habits solidify around this mark. You did it!" },
    { days: 180, title: "🎯 Half a year! 🌈", body: "180 days. Six months of freedom. You've rebuilt so much already." },
    { days: 365, title: "🎯 ONE YEAR!!! 🎆", body: "365 days sober. This is life-changing. You are an absolute inspiration." },
    { days: 500, title: "🎯 500 DAYS! 👑", body: "500 days. You've proven that this is who you are now. Unstoppable." },
    { days: 730, title: "🎯 TWO YEARS! 🏅", body: "730 days of freedom. You've rewritten your story completely." },
    { days: 1000, title: "🎯 1,000 DAYS! 🌟", body: "A thousand days. You're not just surviving — you're thriving." },
    { days: 1095, title: "🎯 THREE YEARS! 💎", body: "1,095 days. You are living proof that recovery is possible." },
  ],
  streakMilestones: [
    { streak: 7, title: "🔥 7-day streak!", body: "A full week of daily check-ins. Consistency builds recovery." },
    { streak: 14, title: "🔥 14-day streak!", body: "Two weeks consistent! You're building an unbreakable habit." },
    { streak: 30, title: "🔥 30-day streak!", body: "A month of daily engagement. You're in the top 5% of users!" },
    { streak: 60, title: "🔥 60-day streak! 🏆", body: "60 days straight. Your commitment is extraordinary." },
    { streak: 100, title: "🔥 100-DAY STREAK! 👑", body: "Triple digits! You are UNSTOPPABLE." },
  ],
};

export const useSmartNotifications = (sobrietyStartDate?: string) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<SmartNotificationSettings>(getDefaultSettings);
  const [missedActions, setMissedActions] = useState<MissedAction[]>([]);
  const [streakAtRisk, setStreakAtRisk] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

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

  const checkMissedActions = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const missed: MissedAction[] = [];

    const { data: todayGoals } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

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

    if (!todayGoals || !todayGoals.meditation_done) {
      missed.push({ type: 'meditation', lastCompleted: null, daysAgo: 0 });
    }

    setMissedActions(missed);

    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("current_streak, last_activity_date")
      .eq("user_id", user.id)
      .eq("streak_type", "check_in")
      .maybeSingle();

    if (streakData) {
      setCurrentStreak(streakData.current_streak || 0);
      if (streakData.current_streak > 0) {
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

  const isInQuietHours = useCallback(() => {
    if (!settings.quietHoursEnabled) return false;
    const hour = new Date().getHours();
    const { quietHoursStart, quietHoursEnd } = settings;
    if (quietHoursStart > quietHoursEnd) {
      return hour >= quietHoursStart || hour < quietHoursEnd;
    }
    return hour >= quietHoursStart && hour < quietHoursEnd;
  }, [settings.quietHoursEnabled, settings.quietHoursStart, settings.quietHoursEnd]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== "granted" || !settings.enabled) return;
    if (isInQuietHours()) return;
    try {
      new Notification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
        ...options,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }, [permission, settings.enabled, isInQuietHours]);

  // ── Missed check-in (after 2 PM) ──
  const checkMissedCheckInReminder = useCallback(() => {
    if (!settings.enabled || !settings.missedCheckIn) return;
    if (missedActions.every(m => m.type !== 'checkIn')) return;

    const now = new Date();
    const lastReminder = settings.lastMissedCheckInReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 6) return;

    const currentHour = now.getHours();
    if (currentHour >= 14 && currentHour < 20) {
      const checkIn = missedActions.find(m => m.type === 'checkIn');
      const daysAgo = checkIn?.daysAgo || 0;
      sendNotification(pickRandom(checkInMessages.titles), {
        body: pickRandom(checkInMessages.bodies(daysAgo)),
        tag: "missed-checkin",
      });
      updateSettings({ lastMissedCheckInReminder: now.toISOString() });
    }
  }, [settings, missedActions, sendNotification, updateSettings]);

  // ── Missed journal (after 4 PM, 2+ days) ──
  const checkMissedJournalReminder = useCallback(() => {
    if (!settings.enabled || !settings.missedJournal) return;
    const journalMissed = missedActions.find(m => m.type === 'journal');
    if (!journalMissed || journalMissed.daysAgo < 2) return;

    const now = new Date();
    const lastReminder = settings.lastMissedJournalReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 24) return;

    const currentHour = now.getHours();
    if (currentHour >= 16 && currentHour < 21) {
      sendNotification(pickRandom(journalMessages.titles), {
        body: pickRandom(journalMessages.bodies(journalMissed.daysAgo)),
        tag: "missed-journal",
      });
      updateSettings({ lastMissedJournalReminder: now.toISOString() });
    }
  }, [settings, missedActions, sendNotification, updateSettings]);

  // ── Missed meditation (after 6 PM) ──
  const checkMissedMeditationReminder = useCallback(() => {
    if (!settings.enabled || !settings.missedMeditation) return;
    if (missedActions.every(m => m.type !== 'meditation')) return;

    const now = new Date();
    const lastReminder = settings.lastMissedMeditationReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 12) return;

    const currentHour = now.getHours();
    if (currentHour >= 18 && currentHour < 22) {
      sendNotification(pickRandom(meditationMessages.titles), {
        body: pickRandom(meditationMessages.bodies),
        tag: "missed-meditation",
      });
      updateSettings({ lastMissedMeditationReminder: now.toISOString() });
    }
  }, [settings, missedActions, sendNotification, updateSettings]);

  // ── Streak at risk ──
  const checkStreakRiskReminder = useCallback(() => {
    if (!settings.enabled || !settings.streakAtRisk || !streakAtRisk) return;

    const now = new Date();
    const lastReminder = settings.lastStreakRiskReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 4) return;

    const currentHour = now.getHours();
    if (currentHour >= 18 && currentHour < 22) {
      const title = pickRandom(streakRiskMessages.titles).replace("{streak}", String(currentStreak));
      sendNotification(title, {
        body: pickRandom(streakRiskMessages.bodies(currentStreak)),
        tag: "streak-risk",
      });
      updateSettings({ lastStreakRiskReminder: now.toISOString() });
    }
  }, [settings, streakAtRisk, currentStreak, sendNotification, updateSettings]);

  // ── Weekly report (Sundays) ──
  const checkWeeklyReportReminder = useCallback(() => {
    if (!settings.enabled || !settings.weeklyReport) return;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentHour = now.getHours();

    if (dayOfWeek === 0 && currentHour >= 9 && currentHour < 11) {
      const lastReminder = settings.lastWeeklyReportReminder;
      if (lastReminder && differenceInDays(now, new Date(lastReminder)) < 6) return;

      sendNotification(pickRandom(weeklyReportMessages.titles), {
        body: pickRandom(weeklyReportMessages.bodies),
        tag: "weekly-report",
      });
      updateSettings({ lastWeeklyReportReminder: now.toISOString() });
    }
  }, [settings, sendNotification, updateSettings]);

  // ── Craving spike alert ──
  const checkCravingSpikeAlert = useCallback(async () => {
    if (!settings.enabled || !settings.cravingSpike || !user) return;

    const now = new Date();
    const lastReminder = settings.lastCravingSpikeReminder;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 4) return;

    const today = now.toISOString().split("T")[0];
    const { data: recentMood } = await supabase
      .from("mood_entries")
      .select("craving_level, created_at")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentMood && recentMood.craving_level >= 3) {
      const entryTime = new Date(recentMood.created_at);
      const minutesAgo = (now.getTime() - entryTime.getTime()) / 60000;
      if (minutesAgo <= 30) {
        sendNotification(pickRandom(cravingSpikeMessages.titles), {
          body: pickRandom(cravingSpikeMessages.bodies),
          tag: "craving-spike",
        });
        updateSettings({ lastCravingSpikeReminder: now.toISOString() });
      }
    }
  }, [settings, user, sendNotification, updateSettings]);

  // ── NEW: Comeback nudge (3+ days away) ──
  const checkComebackNudge = useCallback(async () => {
    if (!settings.enabled || !settings.comebackNudge || !user) return;

    const now = new Date();
    const lastReminder = settings.lastComebackNudge;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 48) return;

    // Check last activity across all tables
    const { data: lastMood } = await supabase
      .from("mood_entries")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastDate = lastMood?.date;
    if (!lastDate) return;

    const daysAway = differenceInDays(now, parseISO(lastDate));
    if (daysAway >= 3) {
      const sobrietyDays = sobrietyStartDate
        ? differenceInDays(now, parseISO(sobrietyStartDate))
        : undefined;

      const currentHour = now.getHours();
      if (currentHour >= 10 && currentHour < 20) {
        sendNotification(pickRandom(comebackMessages.titles), {
          body: pickRandom(comebackMessages.bodies(daysAway, sobrietyDays)),
          tag: "comeback-nudge",
        });
        updateSettings({ lastComebackNudge: now.toISOString() });
      }
    }
  }, [settings, user, sobrietyStartDate, sendNotification, updateSettings]);

  // ── NEW: Daily morning motivation (8-9 AM) ──
  const checkDailyMotivation = useCallback(() => {
    if (!settings.enabled || !settings.dailyMotivation) return;

    const now = new Date();
    const lastReminder = settings.lastDailyMotivation;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 20) return;

    const currentHour = now.getHours();
    if (currentHour >= 8 && currentHour < 9) {
      const sobrietyDays = sobrietyStartDate
        ? differenceInDays(now, parseISO(sobrietyStartDate))
        : undefined;

      sendNotification(pickRandom(dailyMotivationMessages.titles), {
        body: pickRandom(dailyMotivationMessages.bodies(sobrietyDays, currentStreak)),
        tag: "daily-motivation",
      });
      updateSettings({ lastDailyMotivation: now.toISOString() });
    }
  }, [settings, sobrietyStartDate, currentStreak, sendNotification, updateSettings]);

  // ── NEW: Progress celebrations (sobriety + streak milestones) ──
  const checkProgressCelebration = useCallback(() => {
    if (!settings.enabled || !settings.progressCelebration || !sobrietyStartDate) return;

    const now = new Date();
    const lastReminder = settings.lastProgressCelebration;
    if (lastReminder && differenceInHours(now, new Date(lastReminder)) < 12) return;

    const sobrietyDays = differenceInDays(now, parseISO(sobrietyStartDate));
    const notified = JSON.parse(localStorage.getItem("notified_milestones_v2") || "[]") as number[];

    // Check sobriety milestones
    for (const m of progressCelebrationMessages.milestones) {
      if (sobrietyDays === m.days && !notified.includes(m.days)) {
        sendNotification(m.title, { body: m.body, tag: `milestone-${m.days}` });
        localStorage.setItem("notified_milestones_v2", JSON.stringify([...notified, m.days]));
        updateSettings({ lastProgressCelebration: now.toISOString() });
        return;
      }
    }

    // Check streak milestones
    const notifiedStreaks = JSON.parse(localStorage.getItem("notified_streak_milestones") || "[]") as number[];
    for (const m of progressCelebrationMessages.streakMilestones) {
      if (currentStreak === m.streak && !notifiedStreaks.includes(m.streak)) {
        sendNotification(m.title, { body: m.body, tag: `streak-milestone-${m.streak}` });
        localStorage.setItem("notified_streak_milestones", JSON.stringify([...notifiedStreaks, m.streak]));
        updateSettings({ lastProgressCelebration: now.toISOString() });
        return;
      }
    }
  }, [settings, sobrietyStartDate, currentStreak, sendNotification, updateSettings]);

  // Run all checks
  useEffect(() => {
    if (!settings.enabled) return;

    const checkAllNotifications = () => {
      checkMissedCheckInReminder();
      checkMissedJournalReminder();
      checkMissedMeditationReminder();
      checkStreakRiskReminder();
      checkWeeklyReportReminder();
      checkCravingSpikeAlert();
      checkComebackNudge();
      checkDailyMotivation();
      checkProgressCelebration();
    };

    checkAllNotifications();
    const interval = setInterval(checkAllNotifications, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.enabled, checkMissedCheckInReminder, checkMissedJournalReminder, checkMissedMeditationReminder, checkStreakRiskReminder, checkWeeklyReportReminder, checkCravingSpikeAlert, checkComebackNudge, checkDailyMotivation, checkProgressCelebration]);

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
