import { Bell, BellOff, Check, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";

interface NotificationSettingsProps {
  sobrietyStartDate?: string;
}

const NotificationSettings = ({ sobrietyStartDate }: NotificationSettingsProps) => {
  const { permission, settings, requestPermission, updateSettings, isSupported } = useNotifications(sobrietyStartDate);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications enabled! You'll receive reminders for check-ins and milestones.");
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
            Enable Notifications
          </CardTitle>
          <CardDescription>
            Get daily check-in reminders and celebrate your sobriety milestones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleEnableNotifications} className="w-full gradient-primary">
            <Bell className="w-4 h-4 mr-2" />
            Enable Push Notifications
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
          Manage your reminder preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Daily Check-In</p>
              <p className="text-xs text-muted-foreground">Morning reminder at 9 AM</p>
            </div>
          </div>
          <Switch
            checked={settings.dailyCheckIn}
            onCheckedChange={(checked) => updateSettings({ dailyCheckIn: checked })}
            disabled={!settings.enabled}
          />
        </div>

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
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
