import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Heart, Quote } from "lucide-react";

const motivationalMessages = [
  { text: "Every day sober is a victory worth celebrating", emoji: "🏆" },
  { text: "You are stronger than your strongest urge", emoji: "💪" },
  { text: "Recovery is not a sprint, it's a marathon", emoji: "🏃" },
  { text: "Your future self will thank you for today", emoji: "🙏" },
  { text: "Progress, not perfection", emoji: "📈" },
  { text: "One day at a time, one moment at a time", emoji: "⏰" },
  { text: "You deserve a life free from addiction", emoji: "🌟" },
  { text: "The only way out is through", emoji: "🚪" },
  { text: "Your recovery inspires others to heal", emoji: "✨" },
  { text: "Today you chose yourself, and that matters", emoji: "❤️" },
];

export const MotivationalBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const hash = today.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    setCurrentIndex(hash % motivationalMessages.length);
  }, []);

  const nextMessage = () => {
    setCurrentIndex((prev) => (prev + 1) % motivationalMessages.length);
    setLiked(false);
  };

  const message = motivationalMessages[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 relative overflow-hidden"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      
      {/* Decorative elements */}
      <div className="absolute top-3 right-3">
        <Sparkles className="w-4 h-4 text-primary/40" />
      </div>
      <div className="absolute bottom-3 left-3">
        <Quote className="w-3 h-3 text-accent/30" />
      </div>

      <div className="flex items-center gap-4 relative">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl border border-primary/20"
        >
          {message.emoji}
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 text-sm font-medium text-foreground leading-relaxed"
          >
            "{message.text}"
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLiked(!liked)}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-300 ${
                liked 
                  ? "fill-destructive text-destructive scale-110" 
                  : "text-muted-foreground"
              }`} 
            />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={nextMessage}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
