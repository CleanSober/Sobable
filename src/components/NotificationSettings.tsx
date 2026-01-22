import { Bell, BellOff, Check, Sparkles, Calendar, Flame, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
import { useSmartNotifications } from "@/hooks/useSmartNotifications";
import { toast } from "sonner";

interface NotificationSettingsProps {
  sobrietyStartDate?: string;
}

const NotificationSettings = ({ sobrietyStartDate }: NotificationSettingsProps) => {
  const { permission, settings, requestPermission, updateSettings, isSupported } = useNotifications(sobrietyStartDate);
  const { 
    settings: smartSettings, 
    updateSettings: updateSmartSettings,
    missedActions,
    streakAtRisk 
  } = useSmartNotifications(sobrietyStartDate);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications enabled! You'll receive smart reminders based on your activity.");
    } else {
      toast.error("Notification permission denied. Please enable in browser settings.");
    }
  };

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

  if (permission !== "granted") {
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
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">All Notifications</p>
              <p className="text-xs text-muted-foreground">Master toggle</p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => {
              updateSettings({ enabled: checked });
              updateSmartSettings({ enabled: checked });
            }}
          />
        </div>

        {/* Missed Check-In Reminders */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Missed Check-In</p>
              <p className="text-xs text-muted-foreground">Remind if not logged by 2 PM</p>
            </div>
          </div>
          <Switch
            checked={smartSettings.missedCheckIn}
            onCheckedChange={(checked) => updateSmartSettings({ missedCheckIn: checked })}
            disabled={!settings.enabled}
          />
        </div>

        {/* Streak at Risk */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Streak at Risk</p>
              <p className="text-xs text-muted-foreground">Alert before losing your streak</p>
            </div>
          </div>
          <Switch
            checked={smartSettings.streakAtRisk}
            onCheckedChange={(checked) => updateSmartSettings({ streakAtRisk: checked })}
            disabled={!settings.enabled}
          />
        </div>

        {/* Weekly Report */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <FileText className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Weekly Report</p>
              <p className="text-xs text-muted-foreground">Sunday morning summary</p>
            </div>
          </div>
          <Switch
            checked={smartSettings.weeklyReport}
            onCheckedChange={(checked) => updateSmartSettings({ weeklyReport: checked })}
            disabled={!settings.enabled}
          />
        </div>

        {/* Milestone Celebrations */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Milestone Celebrations</p>
              <p className="text-xs text-muted-foreground">1, 7, 30, 90, 365+ days</p>
            </div>
          </div>
          <Switch
            checked={settings.milestones}
            onCheckedChange={(checked) => updateSettings({ milestones: checked })}
            disabled={!settings.enabled}
          />
        </div>

        {/* Status Indicators */}
        {settings.enabled && (
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
                <span>Streak at risk - check in soon!</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
