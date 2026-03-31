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
  const [liked, setLiked] = useState(() => {
    const saved = localStorage.getItem('sober_club_liked_quotes');
    return saved ? JSON.parse(saved) : {};
  });

  const isLiked = liked[currentIndex] === true;

  useEffect(() => {
    const today = new Date().toDateString();
    const hash = today.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    setCurrentIndex(hash % motivationalMessages.length);
  }, []);

  const nextMessage = () => {
    setCurrentIndex((prev) => (prev + 1) % motivationalMessages.length);
  };

  const toggleLike = () => {
    const updated = { ...liked, [currentIndex]: !liked[currentIndex] };
    setLiked(updated);
    localStorage.setItem('sober_club_liked_quotes', JSON.stringify(updated));
  };

  const message = motivationalMessages[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-2.5 relative overflow-hidden"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />

      <div className="flex items-center gap-2.5 relative">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg border border-primary/20"
        >
          {message.emoji}
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_e, info) => {
              if (info.offset.x < -50) nextMessage();
              else if (info.offset.x > 50) setCurrentIndex((prev) => (prev - 1 + motivationalMessages.length) % motivationalMessages.length);
            }}
            className="flex-1 text-sm font-medium text-foreground leading-relaxed cursor-grab active:cursor-grabbing select-none"
          >
            "{message.text}"
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleLike}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-300 ${
                isLiked 
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
