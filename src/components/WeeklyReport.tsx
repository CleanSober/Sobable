import { useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Brain, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMoodEntries, getTriggerEntries, calculateDaysSober, calculateMoneySaved, type UserData } from "@/lib/storage";

interface WeeklyReportProps {
  userData: UserData;
}

export const WeeklyReport = ({ userData }: WeeklyReportProps) => {
  const report = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const moodEntries = getMoodEntries();
    const triggerEntries = getTriggerEntries();

    // This week's data
    const thisWeekMoods = moodEntries.filter((e) => new Date(e.date) >= weekAgo);
    const thisWeekTriggers = triggerEntries.filter((e) => new Date(e.date) >= weekAgo);

    // Last week's data
    const lastWeekMoods = moodEntries.filter(
      (e) => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < weekAgo
    );
    const lastWeekTriggers = triggerEntries.filter(
      (e) => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < weekAgo
    );

    // Calculate averages
    const avgMoodThisWeek = thisWeekMoods.length
      ? thisWeekMoods.reduce((sum, e) => sum + e.mood, 0) / thisWeekMoods.length
      : 0;
    const avgMoodLastWeek = lastWeekMoods.length
      ? lastWeekMoods.reduce((sum, e) => sum + e.mood, 0) / lastWeekMoods.length
      : 0;

    const avgCravingThisWeek = thisWeekMoods.length
      ? thisWeekMoods.reduce((sum, e) => sum + e.cravingLevel, 0) / thisWeekMoods.length
      : 0;
    const avgCravingLastWeek = lastWeekMoods.length
      ? lastWeekMoods.reduce((sum, e) => sum + e.cravingLevel, 0) / lastWeekMoods.length
      : 0;

    // Success rate
    const resistedThisWeek = thisWeekTriggers.filter((e) => e.outcome === "resisted").length;
    const successRateThisWeek = thisWeekTriggers.length
      ? (resistedThisWeek / thisWeekTriggers.length) * 100
      : 100;

    const resistedLastWeek = lastWeekTriggers.filter((e) => e.outcome === "resisted").length;
    const successRateLastWeek = lastWeekTriggers.length
      ? (resistedLastWeek / lastWeekTriggers.length) * 100
      : 100;

    // Check-in streak
    const checkInDays = thisWeekMoods.length;

    // Money saved this week
    const moneySavedThisWeek = userData.dailySpending * 7;

    return {
      avgMoodThisWeek,
      avgMoodLastWeek,
      moodTrend: avgMoodThisWeek - avgMoodLastWeek,
      avgCravingThisWeek,
      avgCravingLastWeek,
      cravingTrend: avgCravingThisWeek - avgCravingLastWeek,
      successRateThisWeek,
      successRateLastWeek,
      successTrend: successRateThisWeek - successRateLastWeek,
      checkInDays,
      moneySavedThisWeek,
      triggersThisWeek: thisWeekTriggers.length,
      totalDaysSober: calculateDaysSober(userData.sobrietyStartDate),
    };
  }, [userData]);

  const getTrendIcon = (trend: number, inverse = false) => {
    const isPositive = inverse ? trend < 0 : trend > 0;
    const isNegative = inverse ? trend > 0 : trend < 0;

    if (isPositive) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (isNegative) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = (trend: number, inverse = false) => {
    const isPositive = inverse ? trend < 0 : trend > 0;
    const isNegative = inverse ? trend > 0 : trend < 0;

    if (isPositive) return "text-green-500";
    if (isNegative) return "text-red-500";
    return "text-muted-foreground";
  };

  const stats = [
    {
      icon: Heart,
      label: "Avg Mood",
      value: report.avgMoodThisWeek.toFixed(1),
      trend: report.moodTrend,
      suffix: "/10",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: Brain,
      label: "Avg Craving",
      value: report.avgCravingThisWeek.toFixed(1),
      trend: report.cravingTrend,
      suffix: "/10",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      inverseTrend: true,
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: report.successRateThisWeek.toFixed(0),
      trend: report.successTrend,
      suffix: "%",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Calendar,
      label: "Check-ins",
      value: report.checkInDays,
      suffix: "/7 days",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Weekly Report
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your progress from the last 7 days
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl ${stat.bgColor}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.suffix}</span>
              </div>
              {stat.trend !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(stat.trend, stat.inverseTrend)}
                  <span className={`text-xs ${getTrendColor(stat.trend, stat.inverseTrend)}`}>
                    {Math.abs(stat.trend).toFixed(1)} vs last week
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Money Saved Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saved This Week</p>
                <p className="text-2xl font-bold text-green-500">
                  ${report.moneySavedThisWeek.toFixed(0)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Days Sober</p>
              <p className="text-2xl font-bold">{report.totalDaysSober}</p>
            </div>
          </div>
        </motion.div>

        {/* Check-in Progress */}
        <div className="p-4 rounded-xl bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Weekly Check-in Goal</span>
            <span className="text-sm text-muted-foreground">{report.checkInDays}/7 days</span>
          </div>
          <Progress value={(report.checkInDays / 7) * 100} className="h-2" />
          {report.checkInDays >= 7 && (
            <p className="text-xs text-green-500 mt-2">🎉 Perfect week! Keep it up!</p>
          )}
        </div>

        {/* Triggers Summary */}
        {report.triggersThisWeek > 0 && (
          <div className="p-3 rounded-xl bg-orange-500/10 text-sm">
            <span className="text-orange-500 font-medium">{report.triggersThisWeek} triggers</span>
            <span className="text-muted-foreground"> logged this week • </span>
            <span className="text-green-500 font-medium">
              {report.successRateThisWeek.toFixed(0)}% resisted
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
