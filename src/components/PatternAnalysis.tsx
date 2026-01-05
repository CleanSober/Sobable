import { motion } from "framer-motion";
import { Brain, AlertTriangle, Clock, Heart, TrendingUp, Shield } from "lucide-react";
import { analyzePatterns, getTriggerEntries } from "@/lib/storage";

export const PatternAnalysis = () => {
  const analysis = analyzePatterns();
  const hasData = analysis.totalEntries > 0;

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl gradient-card shadow-card border border-border/50 p-6 text-center"
      >
        <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Pattern Analysis
        </h3>
        <p className="text-muted-foreground">
          Start logging triggers to see your patterns. The more you log, the better insights you'll get.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">Your Patterns</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/30 text-center">
            <p className="text-3xl font-bold text-foreground">{analysis.totalEntries}</p>
            <p className="text-xs text-muted-foreground">Triggers Logged</p>
          </div>
          <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
            <p className="text-3xl font-bold text-success">{analysis.successRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Resisted</p>
          </div>
        </div>

        {/* Success message */}
        {analysis.successRate >= 70 && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
            <Shield className="w-5 h-5 text-success flex-shrink-0" />
            <p className="text-sm text-foreground">
              Amazing! You're resisting most of your triggers. Keep it up! 💪
            </p>
          </div>
        )}
      </motion.div>

      {/* Top Triggers */}
      {analysis.topTriggers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <span className="font-semibold text-foreground">Top Triggers</span>
          </div>

          <div className="space-y-3">
            {analysis.topTriggers.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.count}x</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / analysis.topTriggers[0].count) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-destructive rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top Emotions */}
      {analysis.topEmotions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-accent/10">
              <Heart className="w-5 h-5 text-accent" />
            </div>
            <span className="font-semibold text-foreground">Common Emotions</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {analysis.topEmotions.map((item) => (
              <span
                key={item.name}
                className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20"
              >
                {item.name} ({item.count})
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* High Risk Times */}
      {analysis.highRiskTimes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <span className="font-semibold text-foreground">High-Risk Times</span>
          </div>

          <div className="space-y-2">
            {analysis.highRiskTimes.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/30"
              >
                <span className="text-sm text-foreground">{item.name}</span>
                <span className="text-sm font-medium text-warning">{item.count} triggers</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top Situations */}
      {analysis.topSituations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Risk Situations</span>
          </div>

          <div className="space-y-2">
            {analysis.topSituations.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-primary">{item.count}x</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
