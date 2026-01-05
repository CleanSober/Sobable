import { motion } from "framer-motion";
import { Sparkles, Quote } from "lucide-react";
import { getMotivationalQuote } from "@/lib/storage";

export const DailyMotivation = () => {
  const { quote, author } = getMotivationalQuote();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl gradient-card shadow-card border border-border/50 p-6"
    >
      {/* Background decoration */}
      <div className="absolute top-4 right-4 opacity-10">
        <Quote className="w-24 h-24 text-accent" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-accent/10">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">Daily Motivation</span>
        </div>

        {/* Quote */}
        <blockquote className="mb-4">
          <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
            "{quote}"
          </p>
        </blockquote>

        {/* Author */}
        <p className="text-sm text-muted-foreground">— {author}</p>
      </div>
    </motion.div>
  );
};
