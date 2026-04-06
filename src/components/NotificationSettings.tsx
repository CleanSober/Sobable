import { useState, useEffect } from "react";
import { Bell, BellOff, Check, Sparkles, Calendar, Flame, AlertTriangle, FileText, Brain, BookOpen, Moon, Mail, Heart, Sunrise, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
import { useNativePushNotifications } from "@/hooks/useNativePushNotifications";
import { useSmartNotifications } from "@/hooks/useSmartNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationSettingsProps {
  sobrietyStartDate?: string;
}

const formatHour = (h: number) => {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
};

const NotificationSettings = ({ sobrietyStartDate }: NotificationSettingsProps) => {
  const { user } = useAuth();
  const { permission, settings, updateSettings, isSupported } = useNotifications(sobrietyStartDate);
  const {
    platform,
    isAndroidNative,
    isIosNative,
    permission: nativePermission,
    isRegistering: nativePushPending,
    apnsToken,
    fcmToken,
    enablePush,
    disablePush,
  } = useNativePushNotifications();
  const {
    permission: smartPermission,
    settings: smartSettings,
    requestPermission: requestSmartPermission,
    updateSettings: updateSmartSettings,
    missedActions,
    streakAtRisk,
  } = useSmartNotifications(sobrietyStartDate);

  const [digestEnabled, setDigestEnabled] = useState(true);
  const [nativeNotificationsEnabled, setNativeNotificationsEnabled] = useState(false);
  const [nativeSettingPending, setNativeSettingPending] = useState(false);
  const [storedApnsToken, setStoredApnsToken] = useState<string | null>(null);
  const [storedIosFcmToken, setStoredIosFcmToken] = useState<string | null>(null);
  const [storedAndroidFcmToken, setStoredAndroidFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("app_settings")
      .select("weekly_digest_enabled, notifications_enabled, ios_apns_token, ios_fcm_token, android_fcm_token")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDigestEnabled(data.weekly_digest_enabled);
          setNativeNotificationsEnabled(data.notifications_enabled);
          if (data.ios_apns_token) setStoredApnsToken(data.ios_apns_token);
          if (data.ios_fcm_token) setStoredIosFcmToken(data.ios_fcm_token);
          if (data.android_fcm_token) setStoredAndroidFcmToken(data.android_fcm_token);
        }
      });
  }, [user]);

  const toggleDigest = async (enabled: boolean) => {
    if (!user) return;
    setDigestEnabled(enabled);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ user_id: user.id, weekly_digest_enabled: enabled }, { onConflict: "user_id" });
    if (error) {
      console.error("Failed to update digest setting:", error);
      setDigestEnabled(!enabled);
      toast.error("Failed to update setting");
    } else {
      toast.success(enabled ? "Weekly digest enabled" : "Weekly digest disabled");
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestSmartPermission();
    if (granted) {
      updateSettings({ enabled: true });
      toast.success("Notifications enabled! You'll receive smart reminders based on your activity.");
    } else {
      toast.error("Notification permission denied. Please enable in browser settings.");
    }
  };

  const effectivePermission = permission === "granted" || smartPermission === "granted" ? "granted" : permission;

  const persistNativeNotificationPreference = async (
    enabled: boolean,
    tokens?: {
      apnsToken?: string | null;
      iosFcmToken?: string | null;
      androidFcmToken?: string | null;
    },
  ) => {
    if (!user) return false;

    const { error } = await supabase
      .from("app_settings")
      .upsert(
        {
          user_id: user.id,
          notifications_enabled: enabled,
          ios_apns_token: tokens?.apnsToken ?? null,
          ios_fcm_token: tokens?.iosFcmToken ?? null,
          android_fcm_token: tokens?.androidFcmToken ?? null,
        },
        { onConflict: "user_id" },
      );

    if (error) {
      console.error("Failed to update native notification preference:", error);
      toast.error("Failed to update notification setting");
      return false;
    }

    if (tokens?.apnsToken) setStoredApnsToken(tokens.apnsToken);
    if (tokens?.iosFcmToken) setStoredIosFcmToken(tokens.iosFcmToken);
    if (tokens?.androidFcmToken) setStoredAndroidFcmToken(tokens.androidFcmToken);
    if (!enabled) {
      setStoredApnsToken(null);
      setStoredIosFcmToken(null);
      setStoredAndroidFcmToken(null);
    }

    return true;
  };

  useEffect(() => {
    if (!user || (!isIosNative && !isAndroidNative) || (!apnsToken && !fcmToken)) return;

    const saveTokens = async () => {
      const { error } = await supabase
        .from("app_settings")
        .upsert(
          {
            user_id: user.id,
            notifications_enabled: true,
            ios_apns_token: isIosNative ? (apnsToken ?? storedApnsToken) : null,
            ios_fcm_token: isIosNative ? (fcmToken ?? storedIosFcmToken) : null,
            android_fcm_token: isAndroidNative ? (fcmToken ?? storedAndroidFcmToken) : null,
          },
          { onConflict: "user_id" },
        );

      if (error) {
        console.error("Failed to persist native push tokens:", error);
        return;
      }

      if (apnsToken) setStoredApnsToken(apnsToken);
      if (fcmToken && isIosNative) setStoredIosFcmToken(fcmToken);
      if (fcmToken && isAndroidNative) setStoredAndroidFcmToken(fcmToken);
    };

    void saveTokens();
  }, [
    apnsToken,
    fcmToken,
    isAndroidNative,
    isIosNative,
    storedAndroidFcmToken,
    storedApnsToken,
    storedIosFcmToken,
    user,
  ]);

  const handleNativeToggle = async (enabled: boolean) => {
    if (!user) return;

    setNativeSettingPending(true);

    try {
      if (enabled) {
        const result = await enablePush();

        if (!result.granted) {
          toast.error(result.error?.message ?? "Push notifications are not available.");
          return;
        }

        const persisted = await persistNativeNotificationPreference(true, {
          apnsToken: isIosNative ? (apnsToken ?? storedApnsToken) : null,
          iosFcmToken: isIosNative ? (fcmToken ?? storedIosFcmToken) : null,
          androidFcmToken: isAndroidNative ? (fcmToken ?? storedAndroidFcmToken) : null,
        });
        if (persisted) {
          setNativeNotificationsEnabled(true);
          toast.success("Native push notifications enabled.");
        }
        return;
      }

      await disablePush();
      setStoredApnsToken(null);
      setStoredIosFcmToken(null);
      setStoredAndroidFcmToken(null);
      const persisted = await persistNativeNotificationPreference(false, {
        apnsToken: null,
        iosFcmToken: null,
        androidFcmToken: null,
      });
      if (persisted) {
        setNativeNotificationsEnabled(false);
        toast.success("Native push notifications disabled.");
      }
    } finally {
      setNativeSettingPending(false);
    }
  };

  if (isIosNative || isAndroidNative) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Control device notifications for reminders and recovery updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Enable Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {nativePermission === "granted"
                    ? "Reminders and updates are enabled"
                    : nativePermission === "denied"
                      ? "Permission is disabled in system settings"
                      : "Allow notifications to receive reminders and updates"}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {platform} native push
                </p>
              </div>
            </div>
            <Switch
              checked={nativeNotificationsEnabled && nativePermission === "granted"}
              onCheckedChange={handleNativeToggle}
              disabled={nativeSettingPending || nativePushPending}
            />
          </div>

          {nativePermission === "denied" && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 p-3 rounded-lg">
              <AlertTriangle className="w-3 h-3" />
              <span>Permission is denied at the OS level. Re-enable notifications from system settings.</span>
            </div>
          )}

          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Weekly Email Digest</p>
                  <p className="text-[10px] text-muted-foreground">Progress summary every Sunday</p>
                </div>
              </div>
              <Switch checked={digestEnabled} onCheckedChange={toggleDigest} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BellOff className="w-5 h-5 text-muted-foreground" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (effectivePermission !== "granted") {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Smart Notifications
          </CardTitle>
          <CardDescription>
            Get personal reminders that keep you on track — not random noise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleEnableNotifications} className="w-full gradient-primary">
            <Bell className="w-4 h-4 mr-2" />
            Enable Smart Notifications
          </Button>
        </CardContent>
      </Card>
    );
  }

  const toggleRows = [
    {
      key: "master",
      icon: Check,
      color: "bg-primary/10",
      iconColor: "text-primary",
      label: "All Notifications",
      desc: "Master toggle",
      checked: smartSettings.enabled,
      onChange: (checked: boolean) => {
        updateSettings({ enabled: checked });
        updateSmartSettings({ enabled: checked });
      },
      disabled: false,
    },
    {
      key: "dailyMotivation",
      icon: Sunrise,
      color: "bg-amber-500/10",
      iconColor: "text-amber-500",
      label: "Morning Motivation",
      desc: "Daily encouraging message at 8 AM",
      checked: smartSettings.dailyMotivation,
      onChange: (checked: boolean) => updateSmartSettings({ dailyMotivation: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "missedCheckIn",
      icon: Calendar,
      color: "bg-blue-500/10",
      iconColor: "text-blue-500",
      label: "Missed Check-In",
      desc: "Gentle nudge if not logged by 2 PM",
      checked: smartSettings.missedCheckIn,
      onChange: (checked: boolean) => updateSmartSettings({ missedCheckIn: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "missedJournal",
      icon: BookOpen,
      color: "bg-teal-500/10",
      iconColor: "text-teal-500",
      label: "Missed Journal",
      desc: "Reminder after 2+ days without writing",
      checked: smartSettings.missedJournal,
      onChange: (checked: boolean) => updateSmartSettings({ missedJournal: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "missedMeditation",
      icon: Brain,
      color: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
      label: "Missed Meditation",
      desc: "Evening calm reminder",
      checked: smartSettings.missedMeditation,
      onChange: (checked: boolean) => updateSmartSettings({ missedMeditation: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "streakAtRisk",
      icon: Flame,
      color: "bg-orange-500/10",
      iconColor: "text-orange-500",
      label: "Streak at Risk",
      desc: "Save your streak before midnight",
      checked: smartSettings.streakAtRisk,
      onChange: (checked: boolean) => updateSmartSettings({ streakAtRisk: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "cravingSpike",
      icon: AlertTriangle,
      color: "bg-red-500/10",
      iconColor: "text-red-500",
      label: "Craving Support",
      desc: "Immediate help when cravings hit hard",
      checked: smartSettings.cravingSpike,
      onChange: (checked: boolean) => updateSmartSettings({ cravingSpike: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "progressCelebration",
      icon: Trophy,
      color: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
      label: "Milestone Celebrations",
      desc: "Sobriety & streak achievements",
      checked: smartSettings.progressCelebration,
      onChange: (checked: boolean) => updateSmartSettings({ progressCelebration: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "comebackNudge",
      icon: Heart,
      color: "bg-pink-500/10",
      iconColor: "text-pink-500",
      label: "Comeback Nudge",
      desc: "Gentle check-in if you've been away 3+ days",
      checked: smartSettings.comebackNudge,
      onChange: (checked: boolean) => updateSmartSettings({ comebackNudge: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "weeklyReport",
      icon: FileText,
      color: "bg-purple-500/10",
      iconColor: "text-purple-500",
      label: "Weekly Report",
      desc: "Sunday morning progress summary",
      checked: smartSettings.weeklyReport,
      onChange: (checked: boolean) => updateSmartSettings({ weeklyReport: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "milestones",
      icon: Sparkles,
      color: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      label: "Legacy Milestones",
      desc: "Classic milestone alerts",
      checked: settings.milestones,
      onChange: (checked: boolean) => updateSettings({ milestones: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "quietHours",
      icon: Moon,
      color: "bg-violet-500/10",
      iconColor: "text-violet-500",
      label: "Quiet Hours",
      desc: `${formatHour(smartSettings.quietHoursStart)} – ${formatHour(smartSettings.quietHoursEnd)}`,
      checked: smartSettings.quietHoursEnabled,
      onChange: (checked: boolean) => updateSmartSettings({ quietHoursEnabled: checked }),
      disabled: !smartSettings.enabled,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Smart, personal reminders that keep you coming back
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {toggleRows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${row.color}`}>
                  <Icon className={`w-4 h-4 ${row.iconColor}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.desc}</p>
                </div>
              </div>
              <Switch
                checked={row.checked}
                onCheckedChange={row.onChange}
                disabled={row.disabled}
              />
            </div>
          );
        })}

        {/* Quiet Hours Time Selectors */}
        {smartSettings.enabled && smartSettings.quietHoursEnabled && (
          <div className="flex items-center gap-2 pt-2 pl-12">
            <Select
              value={String(smartSettings.quietHoursStart)}
              onValueChange={(v) => updateSmartSettings({ quietHoursStart: Number(v) })}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>{formatHour(i)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">to</span>
            <Select
              value={String(smartSettings.quietHoursEnd)}
              onValueChange={(v) => updateSmartSettings({ quietHoursEnd: Number(v) })}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>{formatHour(i)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Indicators */}
        {smartSettings.enabled && (
          <div className="pt-3 border-t border-border space-y-2">
            {missedActions.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                <AlertTriangle className="w-3 h-3" />
                <span>{missedActions.length} action(s) pending today</span>
              </div>
            )}
            {streakAtRisk && (
              <div className="flex items-center gap-2 text-xs text-orange-500 bg-orange-500/10 p-2 rounded-lg">
                <Flame className="w-3 h-3" />
                <span>Streak at risk — check in soon!</span>
              </div>
            )}
            {missedActions.length === 0 && !streakAtRisk && (
              <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">
                <Check className="w-3 h-3" />
                <span>All caught up — great work today! 🎉</span>
              </div>
            )}
            </div>
          )}

          {/* Test notification */}
          {smartSettings.enabled && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("🔔 Test Notification", {
                      body: "Notifications are working perfectly! You'll receive smart reminders based on your activity.",
                      icon: "/icons/icon-192x192.png",
                    });
                    toast.success("Test notification sent!");
                  } else {
                    toast.error("Notifications not enabled in your browser");
                  }
                }}
              >
                <Bell className="w-3 h-3 mr-1.5" />
                Send Test Notification
              </Button>
            </div>
          )}

        {/* Weekly Email Digest */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Weekly Email Digest</p>
                <p className="text-[10px] text-muted-foreground">Progress summary every Sunday</p>
              </div>
            </div>
            <Switch checked={digestEnabled} onCheckedChange={toggleDigest} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
