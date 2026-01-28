import { motion } from "framer-motion";
import { Award, Calendar, TrendingUp, Sparkles } from "lucide-react";
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
      className="card-enhanced relative"
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/15 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 blur-[60px] rounded-full" />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20 icon-glow">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-muted-foreground text-sm font-medium">
              Clean Since
            </span>
            <p className="text-foreground font-semibold">
              {new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Main Counter */}
        <div className="text-center mb-8">
          <motion.div
            key={daysSober}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative inline-block mb-3"
          >
            <span className="text-8xl md:text-9xl font-bold text-gradient tracking-tight">
              {daysSober}
            </span>
            <Sparkles className="absolute -top-2 -right-4 w-6 h-6 text-accent animate-pulse" />
          </motion.div>
          <p className="text-xl text-foreground/80 font-medium tracking-wide">
            {daysSober === 1 ? "Day" : "Days"} Clean & Sober
          </p>
        </div>

        {/* Time breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Weeks", value: weeks, icon: "📅" },
            { label: "Months", value: months, icon: "🌙" },
            { label: "Years", value: years, icon: "🏆" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="stat-box text-center group"
            >
              <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Next Milestone Progress */}
        {next && (
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">Next Milestone</span>
              </div>
              <span className="text-primary font-semibold">{next.name}</span>
            </div>
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 gradient-primary rounded-full"
              />
              <div className="absolute inset-0 animate-shimmer rounded-full" />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{progressToNext}% complete</span>
              <span className="text-accent font-medium">{next.days - daysSober} days to go</span>
            </div>
          </div>
        )}

        {/* Recent Milestones */}
        {reached.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Milestones Achieved</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {reached.slice(-4).map((milestone, index) => (
                <motion.span
                  key={milestone}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors"
                >
                  {milestone}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
