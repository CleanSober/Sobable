import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMoodEntries, type MoodEntry } from "@/lib/storage";
import { useState } from "react";

interface CalendarHeatmapProps {
  startDate: string;
}

export const CalendarHeatmap = ({ startDate }: CalendarHeatmapProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const moodEntries = useMemo(() => getMoodEntries(), []);

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

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-primary" />
          Mood Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            disabled={
              currentMonth.getMonth() === new Date().getMonth() &&
              currentMonth.getFullYear() === new Date().getFullYear()
            }
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
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
                transition={{ delay: index * 0.01 }}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative ${
                  isFuture || isBeforeSobriety
                    ? "bg-muted/20 text-muted-foreground"
                    : getMoodColor(day.mood?.mood)
                } ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                <span className={day.mood ? "text-white font-medium" : ""}>
                  {day.date.getDate()}
                </span>
                {day.mood && (
                  <span className="text-[10px]">{getMoodEmoji(day.mood.mood)}</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-muted-foreground">Tough</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-red-400" />
            <div className="w-4 h-4 rounded bg-orange-400" />
            <div className="w-4 h-4 rounded bg-yellow-400" />
            <div className="w-4 h-4 rounded bg-emerald-400" />
            <div className="w-4 h-4 rounded bg-green-500" />
          </div>
          <span className="text-muted-foreground">Great</span>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-4 p-3 rounded-xl bg-muted/30 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-green-500">{stats.goodDays}</p>
              <p className="text-xs text-muted-foreground">Good Days</p>
            </div>
            <div>
              <p className="text-lg font-bold">{stats.avgMood.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Avg Mood</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-500">{stats.toughDays}</p>
              <p className="text-xs text-muted-foreground">Tough Days</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
