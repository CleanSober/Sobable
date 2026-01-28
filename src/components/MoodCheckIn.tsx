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

    await supabase
      .from("daily_goals")
      .upsert({
        user_id: user.id,
        date: today,
        mood_logged: true,
      }, {
        onConflict: "user_id,date"
      });

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
        className="card-enhanced p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/15 border border-success/25 icon-glow">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">Today's Check-In Complete</p>
                <span className="text-xs text-accent flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10">
                  <Sparkles className="w-3 h-3" />+{XP_REWARDS.mood_log} XP
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Mood: {moodEmojis[mood - 1]} • Craving: {cravingLevels[craving]}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
      className="card-enhanced p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25 icon-glow">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Daily Check-In</h3>
          <p className="text-xs text-muted-foreground">How are you feeling today?</p>
        </div>
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
          <div className="glass-card rounded-xl p-4">
            <label className="text-sm font-medium text-foreground mb-4 block">
              How are you feeling today?
            </label>
            <div className="flex items-center gap-4">
              <motion.span 
                key={mood}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-4xl"
              >
                {moodEmojis[mood - 1]}
              </motion.span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-muted-foreground px-1">
                  <span>Bad</span>
                  <span>Great</span>
                </div>
              </div>
              <span className="text-lg font-bold text-primary min-w-[40px] text-center">{mood}/10</span>
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
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCraving(index)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    craving === index
                      ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-secondary/50 text-foreground hover:bg-secondary border border-border/30"
                  }`}
                >
                  {level}
                </motion.button>
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
              className="bg-secondary/30 border-border/50 resize-none focus:border-primary/50 transition-colors"
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            className="w-full gradient-primary text-primary-foreground font-semibold h-12 btn-glow"
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
