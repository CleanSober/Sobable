import { useEffect, useCallback, useState } from "react";
import { differenceInDays, differenceInHours } from "date-fns";

interface NotificationSettings {
  enabled: boolean;
  dailyCheckIn: boolean;
  milestones: boolean;
  lastCheckInReminder: string | null;
}

const MILESTONES = [1, 7, 14, 30, 60, 90, 180, 365, 730, 1095];

const getDefaultSettings = (): NotificationSettings => ({
  enabled: false,
  dailyCheckIn: true,
  milestones: true,
  lastCheckInReminder: null,
});

export const useNotifications = (sobrietyStartDate?: string) => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<NotificationSettings>(getDefaultSettings);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    const saved = localStorage.getItem("notification_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === "granted") {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      localStorage.setItem("notification_settings", JSON.stringify(newSettings));
      return true;
    }
    return false;
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem("notification_settings", JSON.stringify(newSettings));
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

  const checkDailyReminder = useCallback(() => {
    if (!settings.enabled || !settings.dailyCheckIn) return;

    const now = new Date();
    const lastReminder = settings.lastCheckInReminder;
    
    if (lastReminder) {
      const hoursSinceReminder = differenceInHours(now, new Date(lastReminder));
      if (hoursSinceReminder < 20) return; // Don't remind more than once per day
    }

    const currentHour = now.getHours();
    // Send reminder between 9 AM and 10 AM
    if (currentHour >= 9 && currentHour < 10) {
      sendNotification("Daily Check-In Reminder 🌱", {
        body: "Take a moment to log your mood and track your progress today.",
        tag: "daily-checkin",
      });
      updateSettings({ lastCheckInReminder: now.toISOString() });
    }
  }, [settings, sendNotification, updateSettings]);

  const checkMilestones = useCallback(() => {
    if (!settings.enabled || !settings.milestones || !sobrietyStartDate) return;

    const days = differenceInDays(new Date(), new Date(sobrietyStartDate));
    const notifiedMilestones = JSON.parse(localStorage.getItem("notified_milestones") || "[]");

    for (const milestone of MILESTONES) {
      if (days === milestone && !notifiedMilestones.includes(milestone)) {
        let message = "";
        if (milestone === 1) message = "You've completed your first day! Keep going! 💪";
        else if (milestone === 7) message = "One week strong! You're building something amazing! 🌟";
        else if (milestone === 30) message = "One month! You're proving you can do this! 🎉";
        else if (milestone === 90) message = "90 days! This is a huge achievement! 🏆";
        else if (milestone === 365) message = "ONE YEAR! You're an inspiration! 🎊";
        else message = `${milestone} days sober! Incredible progress! 🌈`;

        sendNotification(`🎯 Milestone Reached: ${milestone} Days!`, {
          body: message,
          tag: `milestone-${milestone}`,
        });

        localStorage.setItem("notified_milestones", JSON.stringify([...notifiedMilestones, milestone]));
        break;
      }
    }
  }, [settings, sobrietyStartDate, sendNotification]);

  // Check for notifications periodically
  useEffect(() => {
    if (!settings.enabled) return;

    const checkNotifications = () => {
      checkDailyReminder();
      checkMilestones();
    };

    // Check immediately and then every hour
    checkNotifications();
    const interval = setInterval(checkNotifications, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.enabled, checkDailyReminder, checkMilestones]);

  return {
    permission,
    settings,
    requestPermission,
    updateSettings,
    sendNotification,
    isSupported: "Notification" in window,
  };
};
