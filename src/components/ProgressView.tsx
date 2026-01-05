import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Calendar, Award, Target } from "lucide-react";
import { getMilestones } from "@/lib/storage";

interface ProgressViewProps {
  daysSober: number;
  totalSaved: number;
  dailySpending: number;
}

export const ProgressView = ({ daysSober, totalSaved, dailySpending }: ProgressViewProps) => {
  const { reached, next } = getMilestones(daysSober);
  const weeks = Math.floor(daysSober / 7);
  const months = Math.floor(daysSober / 30);
  const years = Math.floor(daysSober / 365);

  const yearlyProjection = dailySpending * 365;
  const fiveYearProjection = dailySpending * 365 * 5;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">Your Progress</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Days Sober", value: daysSober, icon: Calendar, color: "text-primary" },
            { label: "Weeks", value: weeks, icon: Calendar, color: "text-primary" },
            { label: "Months", value: months, icon: Calendar, color: "text-accent" },
            { label: "Years", value: years, icon: Award, color: "text-accent" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-secondary/50 border border-border/30 text-center"
            >
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Money Stats */}
      {dailySpending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <span className="text-lg font-semibold text-foreground">Financial Impact</span>
          </div>

          <div className="text-center mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
            <p className="text-4xl font-bold text-accent">${totalSaved.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/30 text-center">
              <p className="text-xl font-semibold text-foreground">
                ${yearlyProjection.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Per Year</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/30 text-center">
              <p className="text-xl font-semibold text-foreground">
                ${fiveYearProjection.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">In 5 Years</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">Milestones</span>
        </div>

        {next && (
          <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">Next: {next.name}</span>
              <span className="text-sm text-muted-foreground">
                {next.days - daysSober} days to go
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(daysSober / next.days) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full gradient-primary rounded-full"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {reached.map((milestone) => (
            <span
              key={milestone}
              className="px-3 py-1.5 text-sm font-medium rounded-full bg-accent/10 text-accent border border-accent/20"
            >
              ✓ {milestone}
            </span>
          ))}
        </div>

        {reached.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Your first milestone is coming up! Keep going! 💪
          </p>
        )}
      </motion.div>
    </div>
  );
};
