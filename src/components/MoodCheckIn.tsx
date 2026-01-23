import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, MessageCircle, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";

const moodEmojis = ["😔", "😕", "😐", "🙂", "😊", "😄", "🤗", "😁", "🥳", "🌟"];
const cravingLevels = ["None", "Low", "Medium", "High", "Intense"];

export const MoodCheckIn = () => {
  const { user } = useAuth();
  const { addXP } = useGamification();
  const [completed, setCompleted] = useState(false);
  const [wasAlreadyCompleted, setWasAlreadyCompleted] = useState(false);
  const [mood, setMood] = useState(5);
  const [craving, setCraving] = useState(0);
  const [note, setNote] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkExistingEntry();
  }, [user]);

  const checkExistingEntry = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    
    const { data } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (data) {
      setMood(data.mood);
      setCraving(data.craving_level);
      setNote(data.note || "");
      setCompleted(true);
      setWasAlreadyCompleted(true);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    
    const { error } = await supabase
      .from("mood_entries")
      .upsert({
        user_id: user.id,
        date: today,
        mood,
        craving_level: craving,
        note: note.trim() || null,
      }, {
        onConflict: "user_id,date"
      });

    if (error) {
      toast.error("Failed to save check-in");
      setLoading(false);
      return;
    }

    // Update daily goals
    await supabase
      .from("daily_goals")
      .upsert({
        user_id: user.id,
        date: today,
        mood_logged: true,
      }, {
        onConflict: "user_id,date"
      });

    // Award XP for first check-in of the day
    if (!wasAlreadyCompleted) {
      await addXP(XP_REWARDS.mood_log, "mood_log", "Daily mood check-in");
    }

    setCompleted(true);
    setWasAlreadyCompleted(true);
    setIsExpanded(false);
    setLoading(false);
    toast.success(
      wasAlreadyCompleted 
        ? "Check-in updated!" 
        : `Check-in saved! +${XP_REWARDS.mood_log} XP 💪`
    );
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
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">Today's Check-In Complete</p>
                <span className="text-xs text-amber-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />+{XP_REWARDS.mood_log} XP
                </span>
              </div>
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
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Check-In"}
          </Button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
