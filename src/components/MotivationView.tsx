import { motion } from "framer-motion";
import { Sparkles, Quote, RefreshCw } from "lucide-react";
import { useState } from "react";

const allQuotes = [
  { quote: "Recovery is not for people who need it, it's for people who want it.", author: "Unknown" },
  { quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { quote: "Every day is a new opportunity to change your life.", author: "Unknown" },
  { quote: "You are stronger than you think. You have gotten through every bad day so far.", author: "Unknown" },
  { quote: "One day at a time. One step at a time. One breath at a time.", author: "Unknown" },
  { quote: "Progress, not perfection.", author: "Unknown" },
  { quote: "The comeback is always stronger than the setback.", author: "Unknown" },
  { quote: "Your addiction does not define you. Your recovery does.", author: "Unknown" },
  { quote: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { quote: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { quote: "Rock bottom became the solid foundation on which I rebuilt my life.", author: "J.K. Rowling" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "Recovery is about progression, not perfection.", author: "Unknown" },
];

const affirmations = [
  "I am worthy of a healthy, happy life.",
  "Every day I am getting stronger.",
  "I choose recovery. I choose life.",
  "I am more than my past mistakes.",
  "I deserve peace and happiness.",
  "My sobriety is my superpower.",
  "I am proud of how far I've come.",
  "Today, I choose myself.",
  "I am building a life I love.",
  "I am resilient and capable.",
];

export const MotivationView = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % allQuotes.length);
  };

  const nextAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % affirmations.length);
  };

  return (
    <div className="space-y-6">
      {/* Daily Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl gradient-card shadow-card border border-border/50 p-6"
      >
        <div className="absolute top-4 right-4 opacity-10">
          <Quote className="w-20 h-20 text-primary" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">Inspiration</span>
            </div>
            <button
              onClick={nextQuote}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <motion.blockquote
            key={quoteIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4"
          >
            <p className="text-xl font-medium text-foreground leading-relaxed">
              "{allQuotes[quoteIndex].quote}"
            </p>
          </motion.blockquote>

          <p className="text-sm text-muted-foreground">— {allQuotes[quoteIndex].author}</p>
        </div>
      </motion.div>

      {/* Affirmation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <span className="text-lg">💪</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Today's Affirmation</span>
          </div>
          <button
            onClick={nextAffirmation}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <motion.p
          key={affirmationIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl font-semibold text-gradient text-center py-6"
        >
          {affirmations[affirmationIndex]}
        </motion.p>
      </motion.div>

      {/* Recovery Facts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-success/10">
            <span className="text-lg">🧠</span>
          </div>
          <span className="text-lg font-semibold text-foreground">Did You Know?</span>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/30">
            <p className="text-sm text-foreground">
              <strong className="text-primary">After 48 hours:</strong> Your body has eliminated all alcohol toxins and your blood sugar levels normalize.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/30">
            <p className="text-sm text-foreground">
              <strong className="text-primary">After 1 week:</strong> Sleep quality improves significantly and you'll wake up feeling more refreshed.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/30">
            <p className="text-sm text-foreground">
              <strong className="text-primary">After 1 month:</strong> Liver fat reduces by up to 15%, and your skin starts looking healthier.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
