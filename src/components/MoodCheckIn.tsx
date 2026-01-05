import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveMoodEntry, getTodaysMoodEntry, type MoodEntry } from "@/lib/storage";
import { toast } from "sonner";

const moodEmojis = ["😔", "😕", "😐", "🙂", "😊", "😄", "🤗", "😁", "🥳", "🌟"];
const cravingLevels = ["None", "Low", "Medium", "High", "Intense"];

export const MoodCheckIn = () => {
  const existingEntry = getTodaysMoodEntry();
  const [completed, setCompleted] = useState(!!existingEntry);
  const [mood, setMood] = useState(existingEntry?.mood || 5);
  const [craving, setCraving] = useState(existingEntry?.cravingLevel || 0);
  const [note, setNote] = useState(existingEntry?.note || "");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    const entry: MoodEntry = {
      date: new Date().toISOString().split("T")[0],
      mood,
      cravingLevel: craving,
      note: note.trim() || undefined,
    };
    saveMoodEntry(entry);
    setCompleted(true);
    setIsExpanded(false);
    toast.success("Check-in saved! Keep going strong 💪");
  };

  if (completed && !isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">Today's Check-In Complete</p>
              <p className="text-sm text-muted-foreground">
                Mood: {moodEmojis[mood - 1]} • Craving: {cravingLevels[craving]}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            Update
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <span className="text-muted-foreground text-sm font-medium">Daily Check-In</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="checkin-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {/* Mood Slider */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              How are you feeling today?
            </label>
            <div className="flex items-center gap-4">
              <span className="text-3xl">{moodEmojis[mood - 1]}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              />
              <span className="text-sm text-muted-foreground w-8">{mood}/10</span>
            </div>
          </div>

          {/* Craving Level */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              Craving level
            </label>
            <div className="flex flex-wrap gap-2">
              {cravingLevels.map((level, index) => (
                <button
                  key={level}
                  onClick={() => setCraving(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    craving === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              Reflection (optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did today go? Any thoughts or feelings to note..."
              className="bg-secondary/50 border-border/50 resize-none"
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            className="w-full gradient-primary text-primary-foreground font-semibold"
            size="lg"
          >
            Save Check-In
          </Button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
