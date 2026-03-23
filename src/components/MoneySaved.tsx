import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { DollarSign, PiggyBank, TrendingUp, Sparkles, Wallet, BarChart3, Target, ArrowUpRight, ChevronRight, Landmark, ShoppingBag, Trophy, Crown, Lock, Calculator, LineChart, Percent, Clock, CalendarDays, Gem, Plus, X, Check, Settings, Sliders, CreditCard, Banknote, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface MoneySavedProps {
  totalSaved: number;
  dailySpending: number;
  daysSober: number;
  onReset?: () => void;
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
const generateGrowthData = (daysSober: number, dailySpending: number, annualReturnRate: number = 0.08) => {
  const points: { day: string; saved: number; invested: number }[] = [];
  const dailyReturn = Math.pow(1 + annualReturnRate, 1 / 365) - 1;

  const totalPoints = Math.min(daysSober, 90);
  const step = Math.max(1, Math.floor(totalPoints / 15));

  let investedTotal = 0;

  for (let i = 0; i <= totalPoints; i += step) {
    const saved = i * dailySpending;
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
  return [
    { name: "Substance costs", desc: "Alcohol, drugs, or tobacco purchases", amount: dailySpending * 0.60, pct: 60, color: "hsl(0 75% 55%)", icon: "🚫" },
    { name: "Related expenses", desc: "Rides, delivery fees, cover charges", amount: dailySpending * 0.20, pct: 20, color: "hsl(42 100% 55%)", icon: "🚕" },
    { name: "Impulse spending", desc: "Late-night orders, unplanned purchases", amount: dailySpending * 0.12, pct: 12, color: "hsl(168 84% 45%)", icon: "🛒" },
    { name: "Hidden costs", desc: "Health products, missed work, repairs", amount: dailySpending * 0.08, pct: 8, color: "hsl(215 18% 58%)", icon: "📦" },
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

// (Multi-year projection is computed inline below using the user's custom rate)

// Monthly breakdown for premium
const generateMonthlyBreakdown = (daysSober: number, dailySpending: number) => {
  const months: { month: string; saved: number; cumulative: number }[] = [];
  const totalMonths = Math.min(Math.ceil(daysSober / 30), 12);

  let cumulative = 0;
  for (let m = 0; m < Math.max(totalMonths, 1); m++) {
    const daysInMonth = m < totalMonths - 1 ? 30 : Math.min(daysSober - m * 30, 30);
    const saved = daysInMonth * dailySpending;
    cumulative += saved;
    months.push({
      month: m === 0 ? "Month 1" : `Month ${m + 1}`,
      saved: Math.round(saved),
      cumulative: Math.round(cumulative),
    });
  }
  return months;
};

// Financial freedom goals
const getFinancialGoals = (totalSaved: number, dailySpending: number) => [
  { name: "Emergency Fund (3 mo)", target: 3000, icon: "🛡️", daysNeeded: Math.ceil(3000 / dailySpending) },
  { name: "Vacation Fund", target: 5000, icon: "🏝️", daysNeeded: Math.ceil(5000 / dailySpending) },
  { name: "Down Payment Seed", target: 10000, icon: "🏠", daysNeeded: Math.ceil(10000 / dailySpending) },
  { name: "Debt Freedom", target: 15000, icon: "⛓️‍💥", daysNeeded: Math.ceil(15000 / dailySpending) },
  { name: "Retirement Boost", target: 25000, icon: "🌅", daysNeeded: Math.ceil(25000 / dailySpending) },
  { name: "Financial Freedom", target: 50000, icon: "🦅", daysNeeded: Math.ceil(50000 / dailySpending) },
];

export const MoneySaved = ({ totalSaved, dailySpending, daysSober, onReset }: MoneySavedProps) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { isPremium } = usePremiumStatus();
  const animatedTotal = useAnimatedCounter(totalSaved);
  const weeklyRate = dailySpending * 7;
  const monthlyRate = dailySpending * 30;
  const yearlyProjection = dailySpending * 365;

  // Custom milestones
  const [customMilestones, setCustomMilestones] = useState<{ label: string; target: number; icon: string }[]>(() => {
    try {
      const stored = localStorage.getItem("sobable_custom_milestones");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneLabel, setNewMilestoneLabel] = useState("");
  const [newMilestoneAmount, setNewMilestoneAmount] = useState("");

  useEffect(() => {
    localStorage.setItem("sobable_custom_milestones", JSON.stringify(customMilestones));
  }, [customMilestones]);

  const addCustomMilestone = () => {
    const amount = parseFloat(newMilestoneAmount);
    const label = newMilestoneLabel.trim().slice(0, 50);
    if (!label || isNaN(amount) || amount <= 0 || amount > 1000000) return;
    setCustomMilestones(prev => [...prev, { label, target: amount, icon: "🎯" }]);
    setNewMilestoneLabel("");
    setNewMilestoneAmount("");
    setShowAddMilestone(false);
  };

  const removeCustomMilestone = (index: number) => {
    setCustomMilestones(prev => prev.filter((_, i) => i !== index));
  };

  // Pro customization settings
  const [proSettings, setProSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("sobable_pro_finance_settings");
      return stored ? JSON.parse(stored) : {
        returnRate: 8,
        currency: "USD",
        customCategories: null, // null = use defaults
        debtAmount: 0,
        debtInterest: 18,
        savingsGoalName: "",
        savingsGoalAmount: 0,
      };
    } catch { return { returnRate: 8, currency: "USD", customCategories: null, debtAmount: 0, debtInterest: 18, savingsGoalName: "", savingsGoalAmount: 0 }; }
  });
  const [showProSettings, setShowProSettings] = useState(false);

  useEffect(() => {
    if (isPremium) {
      localStorage.setItem("sobable_pro_finance_settings", JSON.stringify(proSettings));
    }
  }, [proSettings, isPremium]);

  const updateProSetting = useCallback((key: string, value: any) => {
    setProSettings((prev: any) => ({ ...prev, [key]: value }));
  }, []);

  // Use Pro return rate if premium, else default 8%
  const effectiveReturnRate = isPremium ? proSettings.returnRate / 100 : 0.08;
  const annualReturn = effectiveReturnRate;
  const dailyReturn = Math.pow(1 + annualReturn, 1 / 365) - 1;
  let investedValue = 0;
  for (let d = 0; d < daysSober; d++) {
    investedValue = (investedValue + dailySpending) * (1 + dailyReturn);
  }
  const investmentGain = Math.round(investedValue - totalSaved);

  // Custom spending categories for Pro
  const defaultCategories = getSpendingCategories(dailySpending);
  const proCustomCategories = isPremium && proSettings.customCategories
    ? (proSettings.customCategories as { name: string; desc: string; pct: number; icon: string }[]).map(c => ({
        ...c,
        amount: dailySpending * (c.pct / 100),
        color: c.pct >= 50 ? "hsl(0 75% 55%)" : c.pct >= 20 ? "hsl(42 100% 55%)" : c.pct >= 10 ? "hsl(168 84% 45%)" : "hsl(215 18% 58%)",
      }))
    : null;

  const growthData = generateGrowthData(daysSober, dailySpending, effectiveReturnRate);
  const milestones = getSavingsMilestones(totalSaved);
  const allMilestones = [
    ...milestones,
    ...customMilestones.map(m => ({ ...m, unlocked: totalSaved >= m.target })),
  ].sort((a, b) => a.target - b.target);
  const categories = proCustomCategories || defaultCategories;
  const affordableItems = alternatives.filter((item) => totalSaved >= item.cost);

  const nextMilestone = allMilestones.find((m) => !m.unlocked);
  const unlockedCount = allMilestones.filter((m) => m.unlocked).length;
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

  // Premium data — use user's custom return rate
  const customRate = proSettings.returnRate / 100;
  const multiYearData = useMemo(() => {
    const monthlyContribution = dailySpending * 30;
    const currentSaved = dailySpending * daysSober;
    const projections = [{ year: "Now", cash: currentSaved, conservative: currentSaved, moderate: currentSaved, aggressive: currentSaved }];
    const rates = { conservative: Math.max(customRate - 0.03, 0.02), moderate: customRate, aggressive: customRate + 0.04 };
    for (let y = 1; y <= 10; y++) {
      const cash = currentSaved + monthlyContribution * 12 * y;
      const calc = (rate: number) => {
        let total = currentSaved;
        for (let m = 0; m < y * 12; m++) total = (total + monthlyContribution) * (1 + rate / 12);
        return Math.round(total);
      };
      projections.push({ year: `${y}Y`, cash: Math.round(cash), conservative: calc(rates.conservative), moderate: calc(rates.moderate), aggressive: calc(rates.aggressive) });
    }
    return projections;
  }, [dailySpending, daysSober, customRate]);
  const monthlyData = useMemo(() => generateMonthlyBreakdown(daysSober, dailySpending), [daysSober, dailySpending]);
  const financialGoals = useMemo(() => getFinancialGoals(totalSaved, dailySpending), [totalSaved, dailySpending]);

  // Debt payoff calculation for Pro
  const debtPayoffMonths = useMemo(() => {
    if (!proSettings.debtAmount || proSettings.debtAmount <= 0) return null;
    const monthlyPayment = dailySpending * 30;
    const monthlyInterestRate = (proSettings.debtInterest / 100) / 12;
    if (monthlyPayment <= proSettings.debtAmount * monthlyInterestRate) return Infinity;
    let balance = proSettings.debtAmount;
    let months = 0;
    while (balance > 0 && months < 600) {
      balance = balance * (1 + monthlyInterestRate) - monthlyPayment;
      months++;
    }
    return months;
  }, [proSettings.debtAmount, proSettings.debtInterest, dailySpending]);

  // Premium stats
  const fiveYearModerate = multiYearData.find(d => d.year === "5Y")?.moderate || 0;
  const tenYearModerate = multiYearData.find(d => d.year === "10Y")?.moderate || 0;
  const tenYearCash = multiYearData.find(d => d.year === "10Y")?.cash || 0;
  const compoundGain10Y = tenYearModerate - tenYearCash;
  const monthlyInvestmentIncome = Math.round((tenYearModerate * 0.04) / 12);

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

      <div className="relative p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent/15 border border-accent/25 icon-glow">
              <PiggyBank className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Money Saved</h3>
              <p className="text-[10px] text-muted-foreground">Your financial progress</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <ArrowUpRight className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-medium text-primary">
                ${dailySpending}/day
              </span>
            </div>
            {onReset && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors group"
                title="Reset savings counter"
              >
                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Main Amount - Animated */}
        <div className="text-center mb-3">
          <motion.div
            key={totalSaved}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-1 mb-1"
          >
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="text-4xl font-bold text-gradient-gold tabular-nums">
              {animatedTotal.toLocaleString()}
            </span>
          </motion.div>
          <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            saved in {daysSober} {daysSober === 1 ? "day" : "days"}
          </p>
          {investmentGain > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] text-primary mt-0.5 flex items-center justify-center gap-1"
            >
              <Landmark className="w-3 h-3" />
              +${investmentGain.toLocaleString()} if invested at {Math.round(effectiveReturnRate * 100)}% return
            </motion.p>
          )}
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`grid w-full mb-3 bg-muted/30 h-8 ${isPremium ? "grid-cols-4" : "grid-cols-3"}`}>
            <TabsTrigger value="overview" className="text-[10px]">Overview</TabsTrigger>
            <TabsTrigger value="growth" className="text-[10px]">Growth</TabsTrigger>
            <TabsTrigger value="goals" className="text-[10px]">Goals</TabsTrigger>
            {isPremium && (
              <TabsTrigger value="advanced" className="text-[10px] flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" />
                Pro
              </TabsTrigger>
            )}
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
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Daily spending breakdown</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">
                Estimated based on your ${dailySpending}/day addiction-related costs
              </p>
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
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs text-foreground font-medium">{cat.name}</span>
                        <span className="text-xs font-medium text-foreground">${cat.amount.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-1">{cat.desc}</p>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{unlockedCount}/{allMilestones.length}</span>
                  <button
                    onClick={() => setShowAddMilestone(!showAddMilestone)}
                    className="p-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" />
                  </button>
                </div>
              </div>

              {/* Add custom milestone form */}
              <AnimatePresence>
                {showAddMilestone && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-3"
                  >
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                      <p className="text-xs font-medium text-foreground">Add a personal savings goal</p>
                      <Input
                        placeholder="e.g. New laptop, Vacation fund"
                        value={newMilestoneLabel}
                        onChange={(e) => setNewMilestoneLabel(e.target.value.slice(0, 50))}
                        className="h-9 text-xs bg-secondary/50 border-border/50"
                        maxLength={50}
                      />
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={newMilestoneAmount}
                            onChange={(e) => setNewMilestoneAmount(e.target.value)}
                            className="h-9 pl-7 text-xs bg-secondary/50 border-border/50"
                            min={1}
                            max={1000000}
                          />
                        </div>
                        <button
                          onClick={addCustomMilestone}
                          disabled={!newMilestoneLabel.trim() || !newMilestoneAmount || parseFloat(newMilestoneAmount) <= 0}
                          className="px-3 h-9 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {allMilestones.map((milestone, index) => {
                  const isCustom = customMilestones.some(m => m.label === milestone.label && m.target === milestone.target);
                  const customIndex = customMilestones.findIndex(m => m.label === milestone.label && m.target === milestone.target);
                  return (
                  <motion.div
                    key={`${milestone.label}-${milestone.target}`}
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
                        {isCustom && " • Custom goal"}
                      </p>
                    </div>
                    {isCustom && (
                      <button
                        onClick={() => removeCustomMilestone(customIndex)}
                        className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}
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
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ========== PREMIUM ADVANCED TAB ========== */}
          {isPremium && (
            <TabsContent value="advanced" className="space-y-4 mt-0">
              {/* Premium header with settings toggle */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-accent/15 via-primary/10 to-accent/15 border border-accent/25">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent" />
                  <span className="text-xs font-semibold text-accent">Advanced Financial Intelligence</span>
                </div>
                <button
                  onClick={() => setShowProSettings(!showProSettings)}
                  className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
                >
                  <Settings className={`w-3.5 h-3.5 text-accent transition-transform ${showProSettings ? "rotate-90" : ""}`} />
                </button>
              </div>

              {/* ===== CUSTOMIZATION PANEL ===== */}
              <AnimatePresence>
                {showProSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-card rounded-xl p-4 space-y-4 border border-accent/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Sliders className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-foreground">Your Financial Settings</span>
                      </div>

                      {/* Expected return rate */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Expected annual return</span>
                          <span className="text-xs font-bold text-accent">{proSettings.returnRate}%</span>
                        </div>
                        <Slider
                          value={[proSettings.returnRate]}
                          onValueChange={([v]) => updateProSetting("returnRate", v)}
                          min={2}
                          max={15}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="flex justify-between mt-1">
                          <span className="text-[9px] text-muted-foreground">Savings (2%)</span>
                          <span className="text-[9px] text-muted-foreground">S&P 500 avg (~10%)</span>
                          <span className="text-[9px] text-muted-foreground">Aggressive (15%)</span>
                        </div>
                      </div>

                      {/* Debt payoff calculator */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">Debt Payoff Calculator</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">Total debt ($)</label>
                            <Input
                              type="number"
                              value={proSettings.debtAmount || ""}
                              onChange={(e) => updateProSetting("debtAmount", Math.min(parseFloat(e.target.value) || 0, 1000000))}
                              placeholder="0"
                              className="h-8 text-xs bg-secondary/50 border-border/50"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">Interest rate (%)</label>
                            <Input
                              type="number"
                              value={proSettings.debtInterest || ""}
                              onChange={(e) => updateProSetting("debtInterest", Math.min(parseFloat(e.target.value) || 0, 50))}
                              placeholder="18"
                              className="h-8 text-xs bg-secondary/50 border-border/50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Custom spending categories */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">Spending Categories</span>
                          </div>
                          {proSettings.customCategories && (
                            <button
                              onClick={() => updateProSetting("customCategories", null)}
                              className="text-[10px] text-primary hover:underline"
                            >
                              Reset to defaults
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {(proSettings.customCategories || [
                            { name: "Substance costs", desc: "Alcohol, drugs, or tobacco", pct: 60, icon: "🚫" },
                            { name: "Related expenses", desc: "Rides, delivery, cover charges", pct: 20, icon: "🚕" },
                            { name: "Impulse spending", desc: "Late-night orders, unplanned buys", pct: 12, icon: "🛒" },
                            { name: "Hidden costs", desc: "Health, missed work, repairs", pct: 8, icon: "📦" },
                          ]).map((cat: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm w-6">{cat.icon}</span>
                              <Input
                                value={cat.name}
                                onChange={(e) => {
                                  const cats = proSettings.customCategories || [
                                    { name: "Substance costs", desc: "Alcohol, drugs, or tobacco", pct: 60, icon: "🚫" },
                                    { name: "Related expenses", desc: "Rides, delivery, cover charges", pct: 20, icon: "🚕" },
                                    { name: "Impulse spending", desc: "Late-night orders, unplanned buys", pct: 12, icon: "🛒" },
                                    { name: "Hidden costs", desc: "Health, missed work, repairs", pct: 8, icon: "📦" },
                                  ];
                                  const updated = [...cats];
                                  updated[idx] = { ...updated[idx], name: e.target.value.slice(0, 30) };
                                  updateProSetting("customCategories", updated);
                                }}
                                className="h-7 text-[11px] bg-secondary/50 border-border/50 flex-1"
                                maxLength={30}
                              />
                              <div className="flex items-center gap-1 min-w-[50px]">
                                <Input
                                  type="number"
                                  value={cat.pct}
                                  onChange={(e) => {
                                    const cats = proSettings.customCategories || [
                                      { name: "Substance costs", desc: "Alcohol, drugs, or tobacco", pct: 60, icon: "🚫" },
                                      { name: "Related expenses", desc: "Rides, delivery, cover charges", pct: 20, icon: "🚕" },
                                      { name: "Impulse spending", desc: "Late-night orders, unplanned buys", pct: 12, icon: "🛒" },
                                      { name: "Hidden costs", desc: "Health, missed work, repairs", pct: 8, icon: "📦" },
                                    ];
                                    const updated = [...cats];
                                    updated[idx] = { ...updated[idx], pct: Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100) };
                                    updateProSetting("customCategories", updated);
                                  }}
                                  className="h-7 text-[11px] bg-secondary/50 border-border/50 w-12 text-center"
                                />
                                <span className="text-[10px] text-muted-foreground">%</span>
                              </div>
                            </div>
                          ))}
                          {(() => {
                            const cats = proSettings.customCategories || [{ pct: 60 }, { pct: 20 }, { pct: 12 }, { pct: 8 }];
                            const totalPct = cats.reduce((s: number, c: any) => s + (c.pct || 0), 0);
                            return totalPct !== 100 ? (
                              <p className="text-[10px] text-destructive">Total: {totalPct}% — should equal 100%</p>
                            ) : (
                              <p className="text-[10px] text-primary">Total: 100% ✓</p>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Key premium stats */}
              <div className="grid grid-cols-2 gap-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="stat-box text-center"
                >
                  <Calculator className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold text-accent">${fiveYearModerate.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">5-Year at {proSettings.returnRate}%</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="stat-box text-center"
                >
                  <Gem className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-primary">${tenYearModerate.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">10-Year at {proSettings.returnRate}%</p>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="stat-box text-center">
                  <Percent className="w-3.5 h-3.5 text-accent mx-auto mb-1" />
                  <p className="text-base font-bold text-foreground">${compoundGain10Y.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Interest earned (10Y)</p>
                </div>
                <div className="stat-box text-center">
                  <DollarSign className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
                  <p className="text-base font-bold text-foreground">${monthlyInvestmentIncome}/mo</p>
                  <p className="text-[10px] text-muted-foreground">Passive income (4%)</p>
                </div>
              </div>

              {/* Debt payoff insight */}
              {proSettings.debtAmount > 0 && debtPayoffMonths !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-xl p-4 border border-primary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Debt Freedom Countdown</span>
                  </div>
                  {debtPayoffMonths === Infinity ? (
                    <p className="text-xs text-muted-foreground">
                      Your daily savings (${dailySpending}/day = ${(dailySpending * 30).toLocaleString()}/mo) won't cover the interest on ${proSettings.debtAmount.toLocaleString()} at {proSettings.debtInterest}%. Consider increasing your savings or reducing the interest rate.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold text-primary">
                          {debtPayoffMonths < 12 ? `${debtPayoffMonths} months` : `${(debtPayoffMonths / 12).toFixed(1)} years`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Redirecting ${(dailySpending * 30).toLocaleString()}/mo from addiction costs could eliminate ${proSettings.debtAmount.toLocaleString()} of debt at {proSettings.debtInterest}% interest
                      </p>
                      <div className="mt-2 h-2 rounded-full bg-muted/40 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((daysSober / (debtPayoffMonths * 30)) * 100, 100)}%` }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {Math.min(Math.round((daysSober / (debtPayoffMonths * 30)) * 100), 100)}% of the way there
                      </p>
                    </>
                  )}
                </motion.div>
              )}

              {/* Cost per use insight */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Banknote className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">True Cost of Addiction</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { period: "Per week", amount: dailySpending * 7, sub: "7 days" },
                    { period: "Per month", amount: dailySpending * 30, sub: "30 days" },
                    { period: "Per year", amount: dailySpending * 365, sub: "365 days" },
                  ].map((item) => (
                    <div key={item.period} className="text-center p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                      <p className="text-xs font-bold text-destructive">${item.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{item.period}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Lifetime cost avoided:</span> If you stay sober for 20 years, you'll save{" "}
                    <span className="font-bold text-primary">${(dailySpending * 365 * 20).toLocaleString()}</span> in direct costs alone — not counting health, relationships, and opportunities.
                  </p>
                </div>
              </div>

              {/* Multi-year projection chart */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">10-Year Projection</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { color: "hsl(215 18% 60%)", label: "Cash" },
                      { color: "hsl(168 84% 45%)", label: `${Math.max(proSettings.returnRate - 3, 2)}%` },
                      { color: "hsl(42 100% 55%)", label: `${proSettings.returnRate}%` },
                      { color: "hsl(280 65% 60%)", label: `${proSettings.returnRate + 4}%` },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="text-[9px] text-muted-foreground">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={multiYearData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aggressiveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(280 65% 60%)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(280 65% 60%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="moderateGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(42 100% 55%)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="hsl(42 100% 55%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" tick={{ fontSize: 9, fill: "hsl(215 18% 58%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(215 18% 58%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="cash" name="Cash" stroke="hsl(215 18% 60%)" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                      <Area type="monotone" dataKey="conservative" name={`Conservative (${Math.max(proSettings.returnRate - 3, 2)}%)`} stroke="hsl(168 84% 45%)" strokeWidth={1.5} fill="none" />
                      <Area type="monotone" dataKey="moderate" name={`Your Rate (${proSettings.returnRate}%)`} stroke="hsl(42 100% 55%)" strokeWidth={2} fill="url(#moderateGrad)" />
                      <Area type="monotone" dataKey="aggressive" name={`Aggressive (${proSettings.returnRate + 4}%)`} stroke="hsl(280 65% 60%)" strokeWidth={1.5} fill="url(#aggressiveGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Based on historical S&P 500 avg ~10% • Adjust via ⚙️ settings above
                </p>
              </div>

              {/* Monthly savings breakdown */}
              {monthlyData.length > 1 && (
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Monthly Savings</span>
                  </div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 8, fill: "hsl(215 18% 58%)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 8, fill: "hsl(215 18% 58%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="saved" name="Saved" radius={[4, 4, 0, 0]}>
                          {monthlyData.map((_, index) => (
                            <Cell key={index} fill={`hsl(168 ${70 + index * 3}% ${50 - index * 2}%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Financial Freedom Goals */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Financial Freedom Tracker</span>
                </div>
                <div className="space-y-3">
                  {financialGoals.map((goal, index) => {
                    const progress = Math.min((totalSaved / goal.target) * 100, 100);
                    const daysLeft = Math.max(0, Math.ceil((goal.target - totalSaved) / dailySpending));
                    const reached = totalSaved >= goal.target;
                    return (
                      <motion.div key={goal.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * index }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{goal.icon}</span>
                            <span className={`text-xs font-medium ${reached ? "text-accent" : "text-foreground"}`}>{goal.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{reached ? "✅ Achieved!" : `~${daysLeft} days`}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, delay: 0.1 * index }} className="h-full rounded-full" style={{ background: reached ? "linear-gradient(135deg, hsl(168 84% 45%), hsl(42 100% 55%))" : "hsl(168 84% 45%)" }} />
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-[9px] text-muted-foreground">${Math.min(totalSaved, goal.target).toLocaleString()}</span>
                          <span className="text-[9px] text-muted-foreground">${goal.target.toLocaleString()}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Compound interest insight */}
              <div className="glass-card rounded-xl p-4 border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/15">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1">The Power of Compound Interest</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      At ${dailySpending}/day invested at {proSettings.returnRate}%, your money earns{" "}
                      <span className="text-accent font-semibold">${compoundGain10Y.toLocaleString()}</span>{" "}
                      in interest alone over 10 years. That's{" "}
                      <span className="text-accent font-semibold">
                        {tenYearCash > 0 ? Math.round((compoundGain10Y / tenYearCash) * 100) : 0}%
                      </span>{" "}
                      more than just saving cash. Every sober day is an investment in your future.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Premium upsell if not premium */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 p-3 rounded-xl border border-accent/20 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-foreground">Unlock Advanced Financials</span>
              <Crown className="w-3 h-3 text-accent ml-auto" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Custom return rates, debt payoff calculator, editable spending categories, 10-year projections & passive income tracker
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
