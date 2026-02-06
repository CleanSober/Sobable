import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { DollarSign, PiggyBank, TrendingUp, Sparkles, Wallet, BarChart3, Target, ArrowUpRight, ChevronRight, Landmark, ShoppingBag, Trophy } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface MoneySavedProps {
  totalSaved: number;
  dailySpending: number;
  daysSober: number;
}

// Animated counter hook
const useAnimatedCounter = (target: number, duration = 1200) => {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevTarget.current = target;
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
};

// Generate savings growth data
const generateGrowthData = (daysSober: number, dailySpending: number) => {
  const points: { day: string; saved: number; invested: number }[] = [];
  const annualReturn = 0.08; // 8% annual return
  const dailyReturn = Math.pow(1 + annualReturn, 1 / 365) - 1;

  const totalPoints = Math.min(daysSober, 90);
  const step = Math.max(1, Math.floor(totalPoints / 15));

  let investedTotal = 0;

  for (let i = 0; i <= totalPoints; i += step) {
    const saved = i * dailySpending;
    // Compound interest calculation
    investedTotal = 0;
    for (let d = 0; d < i; d++) {
      investedTotal = (investedTotal + dailySpending) * (1 + dailyReturn);
    }

    points.push({
      day: i === 0 ? "Start" : `Day ${i}`,
      saved: Math.round(saved),
      invested: Math.round(investedTotal),
    });
  }

  // Always include the current day
  if (totalPoints % step !== 0) {
    const saved = totalPoints * dailySpending;
    investedTotal = 0;
    for (let d = 0; d < totalPoints; d++) {
      investedTotal = (investedTotal + dailySpending) * (1 + dailyReturn);
    }
    points.push({
      day: `Day ${totalPoints}`,
      saved: Math.round(saved),
      invested: Math.round(investedTotal),
    });
  }

  return points;
};

// Savings milestones
const getSavingsMilestones = (totalSaved: number) => [
  { label: "First $50", target: 50, icon: "🌱", unlocked: totalSaved >= 50 },
  { label: "$100 Club", target: 100, icon: "💪", unlocked: totalSaved >= 100 },
  { label: "$250 Saved", target: 250, icon: "🔥", unlocked: totalSaved >= 250 },
  { label: "$500 Saved", target: 500, icon: "⭐", unlocked: totalSaved >= 500 },
  { label: "$1,000 Club", target: 1000, icon: "🏆", unlocked: totalSaved >= 1000 },
  { label: "$2,500 Saved", target: 2500, icon: "💎", unlocked: totalSaved >= 2500 },
  { label: "$5,000 Saved", target: 5000, icon: "🚀", unlocked: totalSaved >= 5000 },
  { label: "$10,000 Club", target: 10000, icon: "👑", unlocked: totalSaved >= 10000 },
];

// Spending categories
const getSpendingCategories = (dailySpending: number) => {
  // Typical breakdown of substance-related spending
  return [
    { name: "Substance", amount: dailySpending * 0.60, pct: 60, color: "hsl(0 75% 55%)", icon: "🚫" },
    { name: "Related costs", amount: dailySpending * 0.20, pct: 20, color: "hsl(42 100% 55%)", icon: "🚕" },
    { name: "Impulse buys", amount: dailySpending * 0.12, pct: 12, color: "hsl(168 84% 45%)", icon: "🛒" },
    { name: "Other", amount: dailySpending * 0.08, pct: 8, color: "hsl(215 18% 58%)", icon: "📦" },
  ];
};

const alternatives = [
  { name: "Coffee for a month", cost: 45, icon: "☕" },
  { name: "Gym membership", cost: 50, icon: "🏋️" },
  { name: "Nice dinner out", cost: 75, icon: "🍽️" },
  { name: "Concert tickets", cost: 120, icon: "🎵" },
  { name: "Weekend getaway", cost: 300, icon: "✈️" },
  { name: "New wardrobe", cost: 500, icon: "👔" },
  { name: "New phone", cost: 800, icon: "📱" },
  { name: "Emergency fund", cost: 1000, icon: "🛡️" },
  { name: "Vacation fund", cost: 2000, icon: "🏝️" },
  { name: "Investment portfolio", cost: 5000, icon: "📈" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 border border-border/50 text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MoneySaved = ({ totalSaved, dailySpending, daysSober }: MoneySavedProps) => {
  const animatedTotal = useAnimatedCounter(totalSaved);
  const weeklyRate = dailySpending * 7;
  const monthlyRate = dailySpending * 30;
  const yearlyProjection = dailySpending * 365;

  // Investment projection (8% annual return)
  const annualReturn = 0.08;
  const dailyReturn = Math.pow(1 + annualReturn, 1 / 365) - 1;
  let investedValue = 0;
  for (let d = 0; d < daysSober; d++) {
    investedValue = (investedValue + dailySpending) * (1 + dailyReturn);
  }
  const investmentGain = Math.round(investedValue - totalSaved);

  const growthData = generateGrowthData(daysSober, dailySpending);
  const milestones = getSavingsMilestones(totalSaved);
  const categories = getSpendingCategories(dailySpending);
  const affordableItems = alternatives.filter((item) => totalSaved >= item.cost);

  const nextMilestone = milestones.find((m) => !m.unlocked);
  const unlockedCount = milestones.filter((m) => m.unlocked).length;
  const progressToNext = nextMilestone
    ? Math.min((totalSaved / nextMilestone.target) * 100, 100)
    : 100;

  // Yearly projection with compound interest
  const yearlyInvested = (() => {
    let total = 0;
    for (let d = 0; d < 365; d++) {
      total = (total + dailySpending) * (1 + dailyReturn);
    }
    return Math.round(total);
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="card-enhanced relative overflow-hidden"
    >
      {/* Ambient glow effects */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-primary/8 blur-[60px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/25 icon-glow">
              <PiggyBank className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Money Saved</h3>
              <p className="text-xs text-muted-foreground">Your financial progress</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <ArrowUpRight className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">
              ${dailySpending}/day
            </span>
          </div>
        </div>

        {/* Main Amount - Animated */}
        <div className="text-center mb-4 sm:mb-6">
          <motion.div
            key={totalSaved}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-1 mb-1.5"
          >
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
            <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient-gold tabular-nums">
              {animatedTotal.toLocaleString()}
            </span>
          </motion.div>
          <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-accent" />
            saved in {daysSober} {daysSober === 1 ? "day" : "days"}
          </p>
          {investmentGain > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-primary mt-1 flex items-center justify-center gap-1"
            >
              <Landmark className="w-3 h-3" />
              +${investmentGain.toLocaleString()} if invested at 8% return
            </motion.p>
          )}
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/30">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="growth" className="text-xs">Growth</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">Goals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Projections */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Weekly", value: weeklyRate, icon: "📅" },
                { label: "Monthly", value: monthlyRate, icon: "🗓️" },
                { label: "Yearly", value: yearlyProjection, icon: "🎯" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="stat-box text-center group"
                >
                  <span className="text-base opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    ${item.value.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Spending breakdown */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Daily spending breakdown</span>
              </div>
              <div className="space-y-2.5">
                {categories.map((cat, index) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">{cat.name}</span>
                        <span className="text-xs font-medium text-foreground">${cat.amount.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 * index }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* What you could buy */}
            {affordableItems.length > 0 && (
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">You could afford</span>
                  <span className="ml-auto text-xs text-muted-foreground">{affordableItems.length} items</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {affordableItems.map((item, index) => (
                    <motion.span
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.03 * index }}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {item.icon} {item.name}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Growth Chart Tab */}
          <TabsContent value="growth" className="space-y-4 mt-0">
            {daysSober >= 2 ? (
              <>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Savings Growth</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] text-muted-foreground">Saved</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-[10px] text-muted-foreground">Invested</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(168 84% 45%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(168 84% 45%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(42 100% 55%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(42 100% 55%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 9, fill: "hsl(215 18% 58%)" }}
                          axisLine={false}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 9, fill: "hsl(215 18% 58%)" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="saved"
                          name="Saved"
                          stroke="hsl(168 84% 45%)"
                          strokeWidth={2}
                          fill="url(#savingsGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="invested"
                          name="Invested"
                          stroke="hsl(42 100% 55%)"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          fill="url(#investedGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Investment comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="stat-box text-center">
                    <Wallet className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">${totalSaved.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Cash saved</p>
                  </div>
                  <div className="stat-box text-center">
                    <Landmark className="w-4 h-4 text-accent mx-auto mb-1" />
                    <p className="text-lg font-bold text-accent">${Math.round(investedValue).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">If invested (8%)</p>
                  </div>
                </div>

                {/* 1-year projection */}
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">1-Year Projection</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-accent">${yearlyInvested.toLocaleString()}</span>
                    <span className="text-xs text-primary">
                      +${(yearlyInvested - yearlyProjection).toLocaleString()} interest
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    If you save ${dailySpending}/day and invest at 8% annual return
                  </p>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center">
                <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Growth chart will appear after 2+ days of savings
                </p>
              </div>
            )}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4 mt-0">
            {/* Next milestone progress */}
            {nextMilestone && (
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Next Milestone</span>
                  </div>
                  <span className="text-lg">{nextMilestone.icon}</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-foreground">{nextMilestone.label}</span>
                    <span className="text-xs text-muted-foreground">
                      ${totalSaved.toLocaleString()} / ${nextMilestone.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, hsl(42 100% 55%), hsl(38 95% 50%))" }}
                    >
                      <div
                        className="absolute inset-0 animate-shimmer"
                        style={{
                          background: "linear-gradient(90deg, transparent, hsla(0, 0%, 100%, 0.25), transparent)",
                          backgroundSize: "200% 100%",
                        }}
                      />
                    </motion.div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    ${(nextMilestone.target - totalSaved).toLocaleString()} to go • ~{Math.ceil((nextMilestone.target - totalSaved) / dailySpending)} days
                  </p>
                </div>
              </div>
            )}

            {/* All milestones */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Savings Milestones</span>
                </div>
                <span className="text-xs text-muted-foreground">{unlockedCount}/{milestones.length}</span>
              </div>
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index }}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                      milestone.unlocked
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/20 border border-transparent opacity-60"
                    }`}
                  >
                    <span className="text-lg">{milestone.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        milestone.unlocked ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {milestone.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ${milestone.target.toLocaleString()}
                      </p>
                    </div>
                    {milestone.unlocked ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"
                      >
                        <Sparkles className="w-3 h-3 text-primary" />
                      </motion.div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};
