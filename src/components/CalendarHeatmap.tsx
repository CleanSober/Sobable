import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Smile, Frown, BarChart3, X } from "lucide-react";
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

const MOOD_LEVELS = [
  { min: 8, label: "Great", emoji: "😊", bg: "bg-emerald-500", bgLight: "bg-emerald-500/20", text: "text-emerald-500" },
  { min: 6, label: "Good", emoji: "🙂", bg: "bg-teal-400", bgLight: "bg-teal-400/20", text: "text-teal-400" },
  { min: 4, label: "Okay", emoji: "😐", bg: "bg-amber-400", bgLight: "bg-amber-400/20", text: "text-amber-400" },
  { min: 2, label: "Low", emoji: "😔", bg: "bg-orange-400", bgLight: "bg-orange-400/20", text: "text-orange-400" },
  { min: 0, label: "Tough", emoji: "😢", bg: "bg-red-400", bgLight: "bg-red-400/20", text: "text-red-400" },
];

const getMoodLevel = (mood: number | undefined) => {
  if (mood === undefined) return null;
  return MOOD_LEVELS.find((l) => mood >= l.min) || MOOD_LEVELS[MOOD_LEVELS.length - 1];
};

export const CalendarHeatmap = ({ startDate }: CalendarHeatmapProps) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ date: Date; entry?: MoodEntry } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchMoodEntries();
  }, [user, currentMonth]);

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date | null; mood?: MoodEntry }[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split("T")[0];
      const entry = moodEntries.find((e) => e.date === dateStr);
      days.push({ date: d, mood: entry });
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const sobrietyStartDate = new Date(startDate);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
      setSelectedDay(null);
    }
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const stats = useMemo(() => {
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
    const avgCraving = monthEntries.reduce((sum, e) => sum + e.craving_level, 0) / monthEntries.length;
    const streak = (() => {
      let count = 0;
      const sorted = [...monthEntries].sort((a, b) => b.date.localeCompare(a.date));
      for (const e of sorted) {
        if (e.mood >= 6) count++;
        else break;
      }
      return count;
    })();

    return { avgMood, goodDays, toughDays, totalDays: monthEntries.length, avgCraving, streak };
  }, [moodEntries, currentMonth]);

  const isCurrentMonth =
    currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear();

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="p-4 flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Loading calendar...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50 overflow-hidden">
      <CardHeader className="pb-1 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            Mood Calendar
          </CardTitle>
          {stats && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              <BarChart3 className="w-3 h-3" />
              {stats.totalDays} logged
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <motion.span
            key={currentMonth.toISOString()}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-xs"
          >
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </motion.span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={nextMonth}
            disabled={isCurrentMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-1.5">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`text-center text-[10px] font-semibold ${
                i === 0 || i === 6 ? "text-muted-foreground/60" : "text-muted-foreground"
              }`}
            >
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
            const moodLevel = getMoodLevel(day.mood?.mood);
            const isSelected = selectedDay?.date.toDateString() === day.date.toDateString();

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.003 }}
                onClick={() => {
                  if (!isFuture && !isBeforeSobriety) {
                    setSelectedDay(isSelected ? null : { date: day.date!, entry: day.mood });
                  }
                }}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                  isFuture || isBeforeSobriety
                    ? "text-muted-foreground/30 cursor-default"
                    : moodLevel
                    ? `${moodLevel.bg} cursor-pointer hover:brightness-110 active:scale-90`
                    : "bg-muted/20 cursor-pointer hover:bg-muted/40 active:scale-90"
                } ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""} ${
                  isSelected ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-110 z-10" : ""
                }`}
              >
                <span
                  className={`font-medium leading-none ${
                    moodLevel ? "text-white text-[10px]" : "text-[10px]"
                  } ${isToday && !moodLevel ? "text-primary font-bold" : ""}`}
                >
                  {day.date.getDate()}
                </span>
                {moodLevel && (
                  <span className="text-[7px] leading-none mt-0.5">{moodLevel.emoji}</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Day Detail */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-2.5 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold">
                    {selectedDay.date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="p-0.5 rounded hover:bg-muted"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
                {selectedDay.entry ? (
                  <div className="flex items-center gap-3">
                    {(() => {
                      const level = getMoodLevel(selectedDay.entry.mood)!;
                      return (
                        <>
                          <div className={`w-10 h-10 rounded-lg ${level.bgLight} flex items-center justify-center`}>
                            <span className="text-lg">{level.emoji}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-bold ${level.text}`}>
                                {level.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                ({selectedDay.entry.mood}/10)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">
                                Craving: {selectedDay.entry.craving_level}/10
                              </span>
                              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-orange-400 transition-all"
                                  style={{ width: `${selectedDay.entry.craving_level * 10}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    No mood logged this day
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {MOOD_LEVELS.slice().reverse().map((level, i) => (
            <div key={i} className="flex items-center gap-0.5">
              {i === 0 && <span className="text-[8px] text-muted-foreground mr-0.5">Tough</span>}
              <div className={`w-3.5 h-3.5 rounded ${level.bg}`} />
              {i === MOOD_LEVELS.length - 1 && (
                <span className="text-[8px] text-muted-foreground ml-0.5">Great</span>
              )}
            </div>
          ))}
        </div>

        {/* Monthly Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 grid grid-cols-4 gap-1.5"
          >
            <div className="p-2 rounded-xl bg-muted/30 text-center">
              <p className="text-sm font-bold">{stats.avgMood.toFixed(1)}</p>
              <p className="text-[8px] text-muted-foreground font-medium">Avg Mood</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-center">
              <p className="text-sm font-bold text-emerald-500">{stats.goodDays}</p>
              <p className="text-[8px] text-muted-foreground font-medium">
                <Smile className="w-2.5 h-2.5 inline mr-0.5" />
                Good
              </p>
            </div>
            <div className="p-2 rounded-xl bg-orange-500/10 text-center">
              <p className="text-sm font-bold text-orange-500">{stats.toughDays}</p>
              <p className="text-[8px] text-muted-foreground font-medium">
                <Frown className="w-2.5 h-2.5 inline mr-0.5" />
                Tough
              </p>
            </div>
            <div className="p-2 rounded-xl bg-primary/10 text-center">
              <p className="text-sm font-bold text-primary">{stats.streak}</p>
              <p className="text-[8px] text-muted-foreground font-medium">
                <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                Streak
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
