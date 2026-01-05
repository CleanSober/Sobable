import { motion } from "framer-motion";
import { Award, Calendar, TrendingUp } from "lucide-react";
import { getMilestones } from "@/lib/storage";

interface SobrietyCounterProps {
  daysSober: number;
  startDate: string;
}

export const SobrietyCounter = ({ daysSober, startDate }: SobrietyCounterProps) => {
  const { reached, next } = getMilestones(daysSober);
  const weeks = Math.floor(daysSober / 7);
  const months = Math.floor(daysSober / 30);
  const years = Math.floor(daysSober / 365);

  const progressToNext = next
    ? ((daysSober / next.days) * 100).toFixed(0)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl gradient-card shadow-card border border-border/50 p-6"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            Since {new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        {/* Main Counter */}
        <div className="text-center mb-8">
          <motion.div
            key={daysSober}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-2"
          >
            <span className="text-7xl md:text-8xl font-bold text-gradient">
              {daysSober}
            </span>
          </motion.div>
          <p className="text-xl text-muted-foreground font-medium">
            {daysSober === 1 ? "Day" : "Days"} Clean & Sober
          </p>
        </div>

        {/* Time breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Weeks", value: weeks },
            { label: "Months", value: months },
            { label: "Years", value: years },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-3 rounded-xl bg-secondary/50 border border-border/30"
            >
              <p className="text-2xl font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Next Milestone Progress */}
        {next && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Next: {next.name}</span>
              </div>
              <span className="text-primary font-medium">{next.days - daysSober} days to go</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full gradient-primary rounded-full"
              />
            </div>
          </div>
        )}

        {/* Recent Milestones */}
        {reached.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Milestones Achieved</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {reached.slice(-4).map((milestone) => (
                <span
                  key={milestone}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20"
                >
                  {milestone}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
