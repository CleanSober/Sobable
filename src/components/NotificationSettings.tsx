import { useState, useEffect } from "react";
import { Bell, BellOff, Check, Sparkles, Calendar, Flame, AlertTriangle, FileText, Brain, BookOpen, Moon, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
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
    permission: smartPermission,
    settings: smartSettings,
    requestPermission: requestSmartPermission,
    updateSettings: updateSmartSettings,
    missedActions,
    streakAtRisk,
  } = useSmartNotifications(sobrietyStartDate);

  const [digestEnabled, setDigestEnabled] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("app_settings")
      .select("weekly_digest_enabled")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setDigestEnabled(data.weekly_digest_enabled);
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
    // Enable both notification systems
    const granted = await requestSmartPermission();
    if (granted) {
      updateSettings({ enabled: true });
      toast.success("Notifications enabled! You'll receive smart reminders based on your activity.");
    } else {
      toast.error("Notification permission denied. Please enable in browser settings.");
    }
  };

  const effectivePermission = permission === "granted" || smartPermission === "granted" ? "granted" : permission;

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
            Get reminders when you miss check-ins, not at random times.
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
      key: "missedCheckIn",
      icon: Calendar,
      color: "bg-blue-500/10",
      iconColor: "text-blue-500",
      label: "Missed Check-In",
      desc: "Remind if not logged by 2 PM",
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
      desc: "Remind after 2+ days without writing",
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
      desc: "Evening reminder if not completed",
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
      desc: "Alert before losing your streak",
      checked: smartSettings.streakAtRisk,
      onChange: (checked: boolean) => updateSmartSettings({ streakAtRisk: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "cravingSpike",
      icon: AlertTriangle,
      color: "bg-red-500/10",
      iconColor: "text-red-500",
      label: "Craving Spike Alert",
      desc: "Alert when cravings are High or Intense",
      checked: smartSettings.cravingSpike,
      onChange: (checked: boolean) => updateSmartSettings({ cravingSpike: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "weeklyReport",
      icon: FileText,
      color: "bg-purple-500/10",
      iconColor: "text-purple-500",
      label: "Weekly Report",
      desc: "Sunday morning summary",
      checked: smartSettings.weeklyReport,
      onChange: (checked: boolean) => updateSmartSettings({ weeklyReport: checked }),
      disabled: !smartSettings.enabled,
    },
    {
      key: "milestones",
      icon: Sparkles,
      color: "bg-amber-500/10",
      iconColor: "text-amber-500",
      label: "Milestone Celebrations",
      desc: "1, 7, 30, 90, 365+ days",
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
          Smart reminders based on your activity
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
