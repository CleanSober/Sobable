import { motion } from "framer-motion";
import { DollarSign, PiggyBank, TrendingUp, Sparkles } from "lucide-react";

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
      className="card-enhanced relative"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/25 icon-glow">
            <PiggyBank className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Money Saved</h3>
            <p className="text-xs text-muted-foreground">Your financial progress</p>
          </div>
        </div>

        {/* Main Amount */}
        <div className="text-center mb-6">
          <motion.div
            key={totalSaved}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-1 mb-2"
          >
            <DollarSign className="w-10 h-10 text-accent" />
            <span className="text-6xl md:text-7xl font-bold text-gradient-gold">
              {totalSaved.toLocaleString()}
            </span>
          </motion.div>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            saved in {daysSober} {daysSober === 1 ? "day" : "days"}
          </p>
        </div>

        {/* Projections */}
        <div className="grid grid-cols-3 gap-3 mb-6">
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
              <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <p className="text-xl font-bold text-foreground mt-1">
                ${item.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* What you could buy */}
        {affordableItems.length > 0 && (
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">You could afford</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {affordableItems.map((item, index) => (
                <motion.span
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
                >
                  {item.icon} {item.name}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
