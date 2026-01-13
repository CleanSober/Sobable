import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Heart } from "lucide-react";

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
    // Pick a random message on mount based on the day
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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 border border-primary/20 p-4"
    >
      {/* Sparkle decorations */}
      <div className="absolute top-2 right-2">
        <Sparkles className="w-4 h-4 text-primary/40" />
      </div>
      <div className="absolute bottom-2 left-2">
        <Sparkles className="w-3 h-3 text-accent/40" />
      </div>

      <div className="flex items-center gap-3">
        <motion.span
          key={currentIndex}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-2xl"
        >
          {message.emoji}
        </motion.span>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 text-sm font-medium text-foreground"
          >
            {message.text}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLiked(!liked)}
            className="p-1.5 rounded-lg hover:bg-background/50 transition-colors"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${liked ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} 
            />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={nextMessage}
            className="p-1.5 rounded-lg hover:bg-background/50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
