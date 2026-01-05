import { motion } from "framer-motion";
import { DollarSign, PiggyBank, TrendingUp } from "lucide-react";

interface MoneySavedProps {
  totalSaved: number;
  dailySpending: number;
  daysSober: number;
}

export const MoneySaved = ({ totalSaved, dailySpending, daysSober }: MoneySavedProps) => {
  const weeklyRate = dailySpending * 7;
  const monthlyRate = dailySpending * 30;
  const yearlyProjection = dailySpending * 365;

  const alternatives = [
    { name: "Gym membership", cost: 50, icon: "🏋️" },
    { name: "Nice dinner out", cost: 75, icon: "🍽️" },
    { name: "Weekend getaway", cost: 300, icon: "✈️" },
    { name: "New phone", cost: 800, icon: "📱" },
    { name: "Vacation fund", cost: 2000, icon: "🏝️" },
  ];

  const affordableItems = alternatives.filter((item) => totalSaved >= item.cost);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-accent/10">
          <PiggyBank className="w-5 h-5 text-accent" />
        </div>
        <span className="text-muted-foreground text-sm font-medium">Money Saved</span>
      </div>

      {/* Main Amount */}
      <div className="text-center mb-6">
        <motion.div
          key={totalSaved}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-1"
        >
          <DollarSign className="w-8 h-8 text-accent" />
          <span className="text-5xl md:text-6xl font-bold text-foreground">
            {totalSaved.toLocaleString()}
          </span>
        </motion.div>
        <p className="text-muted-foreground mt-2">
          in {daysSober} {daysSober === 1 ? "day" : "days"}
        </p>
      </div>

      {/* Projections */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Weekly", value: weeklyRate },
          { label: "Monthly", value: monthlyRate },
          { label: "Yearly", value: yearlyProjection },
        ].map((item) => (
          <div
            key={item.label}
            className="text-center p-3 rounded-xl bg-secondary/50 border border-border/30"
          >
            <p className="text-lg font-semibold text-foreground">
              ${item.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {/* What you could buy */}
      {affordableItems.length > 0 && (
        <div className="pt-4 border-t border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">You could afford</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {affordableItems.map((item) => (
              <span
                key={item.name}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {item.icon} {item.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
