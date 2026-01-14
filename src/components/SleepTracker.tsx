import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Bed, TrendingUp, Save, RefreshCw, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSleepEntries, useRealtimeSync } from "@/hooks/useUserData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SleepEntry {
  date: string;
  bedtime: string;
  wake_time: string;
  quality: number;
  hours_slept: number;
}

export const SleepTracker = () => {
  const { user } = useAuth();
  const { getSleepEntries, saveSleepEntry } = useSleepEntries();
  const today = new Date().toISOString().split("T")[0];
  const [bedtime, setBedtime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");
  const [quality, setQuality] = useState([7]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<SleepEntry[]>([]);

  const loadEntries = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getSleepEntries();
      setEntries(data as SleepEntry[]);
      
      const todayEntry = data.find((e: SleepEntry) => e.date === today);
      if (todayEntry) {
        setBedtime(todayEntry.bedtime);
        setWakeTime(todayEntry.wake_time);
        setQuality([todayEntry.quality]);
      }
    } catch (error) {
      console.error("Error loading sleep entries:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getSleepEntries, today]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Real-time sync for cross-device updates
  useRealtimeSync<SleepEntry>(
    "sleep_entries",
    user?.id,
    useCallback((data) => {
      if (data) {
        setEntries(prev => {
          const index = prev.findIndex(e => e.date === data.date);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = data;
            return updated;
          }
          return [data, ...prev];
        });
        
        if (data.date === today) {
          setBedtime(data.bedtime);
          setWakeTime(data.wake_time);
          setQuality([data.quality]);
        }
        
        toast.success("Sleep data synced from another device", {
          icon: <Cloud className="w-4 h-4" />,
        });
      }
    }, [today])
  );

  const calculateHoursSlept = () => {
    const [bedH, bedM] = bedtime.split(":").map(Number);
    const [wakeH, wakeM] = wakeTime.split(":").map(Number);
    
    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;
    
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    return (wakeMinutes - bedMinutes) / 60;
  };

  const hoursSlept = calculateHoursSlept();

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to track your sleep");
      return;
    }

    setSaving(true);
    
    const { error } = await saveSleepEntry({
      date: today,
      bedtime,
      wake_time: wakeTime,
      quality: quality[0],
      hours_slept: hoursSlept,
    });

    if (error) {
      toast.error("Failed to save. Please try again.");
    } else {
      toast.success("Sleep logged successfully!");
      loadEntries();
    }
    
    setSaving(false);
  };

  const getQualityLabel = (q: number) => {
    if (q >= 8) return "Excellent 😊";
    if (q >= 6) return "Good 🙂";
    if (q >= 4) return "Fair 😐";
    if (q >= 2) return "Poor 😔";
    return "Very Poor 😢";
  };

  const getQualityColor = (q: number) => {
    if (q >= 8) return "text-green-500";
    if (q >= 6) return "text-emerald-500";
    if (q >= 4) return "text-yellow-500";
    if (q >= 2) return "text-orange-500";
    return "text-red-500";
  };

  // Calculate weekly average
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const weekEntries = entries.filter((e) => e.date >= weekAgo);
  const avgHours = weekEntries.length
    ? weekEntries.reduce((sum, e) => sum + e.hours_slept, 0) / weekEntries.length
    : 0;
  const avgQuality = weekEntries.length
    ? weekEntries.reduce((sum, e) => sum + e.quality, 0) / weekEntries.length
    : 0;

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="py-8 flex justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Moon className="w-5 h-5 text-primary" />
          Sleep Tracker
          {saving && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
          {!saving && user && <Cloud className="w-4 h-4 text-green-500 ml-auto" aria-label="Synced across devices" />}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quality sleep supports your recovery
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Moon className="w-4 h-4 text-indigo-400" />
              Bedtime
            </label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full p-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Sun className="w-4 h-4 text-amber-400" />
              Wake Time
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full p-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Hours Slept Display */}
        <motion.div
          className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Bed className="w-5 h-5 text-indigo-400" />
            <span className="text-sm text-muted-foreground">Hours Slept</span>
          </div>
          <p className="text-3xl font-bold">{hoursSlept.toFixed(1)} hrs</p>
          <p className="text-xs text-muted-foreground mt-1">
            {hoursSlept >= 7 && hoursSlept <= 9
              ? "✅ Optimal range (7-9 hours)"
              : hoursSlept < 7
              ? "⚠️ Consider getting more sleep"
              : "💤 You might be oversleeping"}
          </p>
        </motion.div>

        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Sleep Quality</label>
            <span className={`text-sm font-medium ${getQualityColor(quality[0])}`}>
              {getQualityLabel(quality[0])}
            </span>
          </div>
          <Slider
            value={quality}
            onValueChange={setQuality}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full gradient-primary"
          disabled={saving || !user}
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Log Sleep
            </>
          )}
        </Button>

        {!user && (
          <p className="text-xs text-center text-muted-foreground">
            Sign in to sync your sleep data across devices
          </p>
        )}

        {/* Weekly Stats */}
        {weekEntries.length > 0 && (
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{avgHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">Avg Hours</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{avgQuality.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Avg Quality</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
