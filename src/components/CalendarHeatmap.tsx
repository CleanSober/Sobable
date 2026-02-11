import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CalendarHeatmapProps {
  startDate: string;
}

interface MoodEntry {
  date: string;
  mood: number;
  craving_level: number;
}

export const CalendarHeatmap = ({ startDate }: CalendarHeatmapProps) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMoodEntries();
  }, [user]);

  const fetchMoodEntries = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("mood_entries")
      .select("date, mood, craving_level")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    setMoodEntries(data || []);
    setLoading(false);
  };

  const getMoodColor = (mood: number | undefined) => {
    if (mood === undefined) return "bg-muted/30";
    if (mood >= 8) return "bg-green-500";
    if (mood >= 6) return "bg-emerald-400";
    if (mood >= 4) return "bg-yellow-400";
    if (mood >= 2) return "bg-orange-400";
    return "bg-red-400";
  };

  const getMoodEmoji = (mood: number | undefined) => {
    if (mood === undefined) return "";
    if (mood >= 8) return "😊";
    if (mood >= 6) return "🙂";
    if (mood >= 4) return "😐";
    if (mood >= 2) return "😔";
    return "😢";
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date | null; mood?: MoodEntry }[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const entry = moodEntries.find((e) => e.date === dateStr);
      days.push({ date, mood: entry });
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const sobrietyStartDate = new Date(startDate);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getStats = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthEntries = moodEntries.filter((e) => {
      const date = new Date(e.date);
      return date >= monthStart && date <= monthEnd;
    });

    if (monthEntries.length === 0) return null;

    const avgMood = monthEntries.reduce((sum, e) => sum + e.mood, 0) / monthEntries.length;
    const goodDays = monthEntries.filter((e) => e.mood >= 6).length;
    const toughDays = monthEntries.filter((e) => e.mood < 4).length;

    return { avgMood, goodDays, toughDays, totalDays: monthEntries.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary animate-pulse" />
            Loading calendar...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          Mood Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold text-xs">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={nextMonth}
            disabled={
              currentMonth.getMonth() === new Date().getMonth() &&
              currentMonth.getFullYear() === new Date().getFullYear()
            }
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[9px] text-muted-foreground font-medium">
              {day.charAt(0)}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, index) => {
            if (!day.date) {
              return <div key={index} className="aspect-square" />;
            }

            const isToday = day.date.toDateString() === new Date().toDateString();
            const isBeforeSobriety = day.date < sobrietyStartDate;
            const isFuture = day.date > new Date();

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.005 }}
                className={`aspect-square rounded-md flex flex-col items-center justify-center text-[10px] relative ${
                  isFuture || isBeforeSobriety
                    ? "bg-muted/20 text-muted-foreground"
                    : getMoodColor(day.mood?.mood)
                } ${isToday ? "ring-1.5 ring-primary ring-offset-1 ring-offset-background" : ""}`}
              >
                <span className={day.mood ? "text-white font-medium text-[9px]" : "text-[9px]"}>
                  {day.date.getDate()}
                </span>
                {day.mood && (
                  <span className="text-[8px] leading-none">{getMoodEmoji(day.mood.mood)}</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[9px]">
          <span className="text-muted-foreground">Tough</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded bg-red-400" />
            <div className="w-3 h-3 rounded bg-orange-400" />
            <div className="w-3 h-3 rounded bg-yellow-400" />
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <div className="w-3 h-3 rounded bg-green-500" />
          </div>
          <span className="text-muted-foreground">Great</span>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-2 p-2 rounded-xl bg-muted/30 grid grid-cols-3 gap-1.5 text-center">
            <div>
              <p className="text-sm font-bold text-green-500">{stats.goodDays}</p>
              <p className="text-[9px] text-muted-foreground">Good</p>
            </div>
            <div>
              <p className="text-sm font-bold">{stats.avgMood.toFixed(1)}</p>
              <p className="text-[9px] text-muted-foreground">Avg</p>
            </div>
            <div>
              <p className="text-sm font-bold text-orange-500">{stats.toughDays}</p>
              <p className="text-[9px] text-muted-foreground">Tough</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
