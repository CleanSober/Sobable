import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Zap, MessageCircle, Check, Sparkles, ChevronRight, ChevronLeft,
  Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging,
  Sun, Cloud, CloudRain, Smile, Frown, Meh, AlertCircle, Shield,
  Coffee, Dumbbell, Users, Brain, Star, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

// ─── Data ──────────────────────────────────────────────
const moodEmojis = ["😔", "😕", "😐", "🙂", "😊", "😄", "🤗", "😁", "🥳", "🌟"];
const cravingLevels = ["None", "Low", "Medium", "High", "Intense"];

const emotionTags = [
  { label: "Grateful", emoji: "🙏" },
  { label: "Hopeful", emoji: "🌈" },
  { label: "Calm", emoji: "😌" },
  { label: "Proud", emoji: "💪" },
  { label: "Happy", emoji: "😊" },
  { label: "Motivated", emoji: "🔥" },
  { label: "Anxious", emoji: "😰" },
  { label: "Lonely", emoji: "😔" },
  { label: "Frustrated", emoji: "😤" },
  { label: "Bored", emoji: "🥱" },
  { label: "Sad", emoji: "😢" },
  { label: "Stressed", emoji: "😣" },
  { label: "Restless", emoji: "🦋" },
  { label: "Confused", emoji: "🤔" },
  { label: "Tired", emoji: "😴" },
  { label: "Overwhelmed", emoji: "🤯" },
];

const energyLevels = [
  { value: 1, label: "Depleted", emoji: "🪫", color: "text-destructive" },
  { value: 2, label: "Low", emoji: "🔋", color: "text-orange-500" },
  { value: 3, label: "Moderate", emoji: "⚡", color: "text-warning" },
  { value: 4, label: "Good", emoji: "💪", color: "text-primary" },
  { value: 5, label: "Energized", emoji: "🚀", color: "text-success" },
];

const physicalSymptoms = [
  { id: "headache", label: "Headache", emoji: "🤕" },
  { id: "nausea", label: "Nausea", emoji: "🤢" },
  { id: "insomnia", label: "Insomnia", emoji: "😵‍💫" },
  { id: "fatigue", label: "Fatigue", emoji: "😩" },
  { id: "appetite_change", label: "Appetite change", emoji: "🍽️" },
  { id: "tremors", label: "Shaky/Tremors", emoji: "🫨" },
  { id: "sweating", label: "Sweating", emoji: "💦" },
  { id: "none", label: "None — feeling good!", emoji: "✅" },
];

const socialConnections = [
  { value: 1, label: "Isolated", icon: Frown, desc: "No connection today" },
  { value: 2, label: "Minimal", icon: Meh, desc: "Brief interactions" },
  { value: 3, label: "Some", icon: Smile, desc: "A few good chats" },
  { value: 4, label: "Connected", icon: Users, desc: "Meaningful time with others" },
  { value: 5, label: "Supported", icon: Heart, desc: "Strong support system active" },
];

// Step definitions
const STEPS = ["mood", "emotions", "craving", "energy", "physical", "social", "gratitude", "reflection"] as const;
type Step = (typeof STEPS)[number];

const stepLabels: Record<Step, string> = {
  mood: "How are you feeling?",
  emotions: "What emotions are present?",
  craving: "Craving check",
  energy: "Energy level",
  physical: "Physical wellness",
  social: "Social connection",
  gratitude: "Gratitude moment",
  reflection: "Daily reflection",
};

// ─── Component ─────────────────────────────────────────
export const MoodCheckIn = () => {
  const { user } = useAuth();
  const { addXP } = useGamification();

  // Form state
  const [mood, setMood] = useState(5);
  const [craving, setCraving] = useState(0);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [energy, setEnergy] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [social, setSocial] = useState(3);
  const [gratitude, setGratitude] = useState("");
  const [note, setNote] = useState("");

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [wasAlreadyCompleted, setWasAlreadyCompleted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

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

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    // Build the note with extra context
    const fullNote = [
      note.trim(),
      selectedEmotions.length > 0 ? `Emotions: ${selectedEmotions.join(", ")}` : "",
      `Energy: ${energyLevels.find((e) => e.value === energy)?.label}`,
      selectedSymptoms.length > 0 && !selectedSymptoms.includes("none")
        ? `Symptoms: ${selectedSymptoms.join(", ")}`
        : "",
      `Social: ${socialConnections.find((s) => s.value === social)?.label}`,
      gratitude.trim() ? `Grateful for: ${gratitude.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const { error } = await supabase.from("mood_entries").upsert(
      {
        user_id: user.id,
        date: today,
        mood,
        craving_level: craving,
        note: fullNote || null,
      },
      { onConflict: "user_id,date" }
    );

    if (error) {
      toast.error("Failed to save check-in");
      setLoading(false);
      return;
    }

    await supabase.from("daily_goals").upsert(
      { user_id: user.id, date: today, mood_logged: true },
      { onConflict: "user_id,date" }
    );

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

  const toggleEmotion = (label: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(label) ? prev.filter((e) => e !== label) : [...prev, label]
    );
  };

  const toggleSymptom = (id: string) => {
    if (id === "none") {
      setSelectedSymptoms(["none"]);
      return;
    }
    setSelectedSymptoms((prev) => {
      const without = prev.filter((s) => s !== "none");
      return without.includes(id) ? without.filter((s) => s !== id) : [...without, id];
    });
  };

  // Summary data for the completed view
  const summaryData = useMemo(
    () => ({
      moodLabel: moodEmojis[mood - 1],
      cravingLabel: cravingLevels[craving],
      energyLabel: energyLevels.find((e) => e.value === energy)?.label || "",
      socialLabel: socialConnections.find((s) => s.value === social)?.label || "",
    }),
    [mood, craving, energy, social]
  );

  // ─── Completed state ──────────────────────────────────
  if (completed && !isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-enhanced relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-success/8 blur-[60px] rounded-full pointer-events-none" />
        <div className="relative p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/15 border border-success/25 icon-glow">
                <Check className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">Today's Check-In Complete</p>
                  <span className="text-[10px] text-accent flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10">
                    <Sparkles className="w-3 h-3" />+{XP_REWARDS.mood_log} XP
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(true);
                setCurrentStep(0);
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-xs"
            >
              Update
            </Button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Mood", value: summaryData.moodLabel, sub: `${mood}/10` },
              { label: "Craving", value: cravingLevels[craving] === "None" ? "✅" : "⚠️", sub: summaryData.cravingLabel },
              { label: "Energy", value: energyLevels.find((e) => e.value === energy)?.emoji || "⚡", sub: summaryData.energyLabel },
              { label: "Social", value: social >= 4 ? "💚" : social >= 3 ? "💛" : "🔴", sub: summaryData.socialLabel },
            ].map((item) => (
              <div key={item.label} className="text-center p-2 rounded-lg bg-secondary/30">
                <span className="text-lg">{item.value}</span>
                <p className="text-[9px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Emotion tags */}
          {selectedEmotions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedEmotions.map((e) => {
                const tag = emotionTags.find((t) => t.label === e);
                return (
                  <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {tag?.emoji} {e}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── Step renderers ──────────────────────────────────
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const renderStep = () => {
    switch (step) {
      case "mood":
        return (
          <div className="space-y-5">
            <div className="text-center">
              <motion.span
                key={mood}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl inline-block mb-3"
              >
                {moodEmojis[mood - 1]}
              </motion.span>
              <p className="text-sm text-muted-foreground">
                {mood <= 3 ? "Hang in there, it gets better" : mood <= 6 ? "You're doing okay" : "That's wonderful!"}
              </p>
            </div>
            <div className="px-2">
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 px-0.5">
                <span>Struggling</span>
                <span className="font-semibold text-foreground text-xs">{mood}/10</span>
                <span>Thriving</span>
              </div>
            </div>
          </div>
        );

      case "emotions":
        return (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">Select all that apply</p>
            <div className="grid grid-cols-4 gap-2">
              {emotionTags.map((tag) => {
                const isSelected = selectedEmotions.includes(tag.label);
                return (
                  <motion.button
                    key={tag.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleEmotion(tag.label)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2.5 rounded-xl text-center transition-all duration-200 border",
                      isSelected
                        ? "bg-primary/15 border-primary/30 shadow-sm"
                        : "bg-secondary/30 border-border/30 hover:bg-secondary/50"
                    )}
                  >
                    <span className="text-xl">{tag.emoji}</span>
                    <span className={cn("text-[10px] font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>
                      {tag.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case "craving":
        return (
          <div className="space-y-5">
            <div className="text-center">
              <motion.div
                key={craving}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-3 inline-block"
              >
                {craving === 0 ? "😌" : craving === 1 ? "😐" : craving === 2 ? "😬" : craving === 3 ? "😰" : "🔥"}
              </motion.div>
              <p className="text-sm font-medium text-foreground">{cravingLevels[craving]}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {craving === 0
                  ? "No cravings — amazing!"
                  : craving <= 2
                  ? "Manageable — you've got this"
                  : "It's okay to use your coping tools"}
              </p>
            </div>
            <div className="flex gap-2">
              {cravingLevels.map((level, index) => (
                <motion.button
                  key={level}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCraving(index)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-medium transition-all duration-200 border",
                    craving === index
                      ? index >= 3
                        ? "bg-destructive/15 border-destructive/30 text-destructive"
                        : "bg-primary/15 border-primary/30 text-primary"
                      : "bg-secondary/30 border-border/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  {level}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case "energy":
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <motion.span key={energy} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-5xl inline-block mb-2">
                {energyLevels.find((e) => e.value === energy)?.emoji}
              </motion.span>
            </div>
            <div className="space-y-2">
              {energyLevels.map((level) => (
                <motion.button
                  key={level.value}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEnergy(level.value)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 border",
                    energy === level.value
                      ? "bg-primary/10 border-primary/30"
                      : "bg-secondary/30 border-border/30 hover:bg-secondary/50"
                  )}
                >
                  <span className="text-xl">{level.emoji}</span>
                  <div className="flex-1 text-left">
                    <span className={cn("text-sm font-medium", energy === level.value ? "text-primary" : "text-foreground")}>
                      {level.label}
                    </span>
                  </div>
                  {energy === level.value && <Check className="w-4 h-4 text-primary" />}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case "physical":
        return (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">Any symptoms you're experiencing?</p>
            <div className="grid grid-cols-2 gap-2">
              {physicalSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom.id);
                return (
                  <motion.button
                    key={symptom.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl transition-all duration-200 border text-left",
                      isSelected
                        ? symptom.id === "none"
                          ? "bg-success/10 border-success/30"
                          : "bg-destructive/10 border-destructive/30"
                        : "bg-secondary/30 border-border/30 hover:bg-secondary/50"
                    )}
                  >
                    <span className="text-lg">{symptom.emoji}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      isSelected
                        ? symptom.id === "none" ? "text-success" : "text-destructive"
                        : "text-foreground"
                    )}>
                      {symptom.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {socialConnections.map((level) => {
                const Icon = level.icon;
                return (
                  <motion.button
                    key={level.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSocial(level.value)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 border",
                      social === level.value
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/30 border-border/30 hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      social === level.value ? "bg-primary/20" : "bg-muted/50"
                    )}>
                      <Icon className={cn("w-4 h-4", social === level.value ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={cn("text-sm font-medium", social === level.value ? "text-primary" : "text-foreground")}>
                        {level.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{level.desc}</p>
                    </div>
                    {social === level.value && <Check className="w-4 h-4 text-primary" />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case "gratitude":
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <span className="text-5xl inline-block mb-2">🙏</span>
              <p className="text-xs text-muted-foreground">
                Gratitude rewires your brain for positivity
              </p>
            </div>
            <Textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Today I'm grateful for..."
              className="bg-secondary/30 border-border/50 resize-none focus:border-primary/50 transition-colors min-h-[100px]"
              rows={4}
            />
          </div>
        );

      case "reflection":
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <span className="text-5xl inline-block mb-2">📝</span>
              <p className="text-xs text-muted-foreground">
                Anything else on your mind?
              </p>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did today go? Any thoughts, wins, or challenges..."
              className="bg-secondary/30 border-border/50 resize-none focus:border-primary/50 transition-colors min-h-[100px]"
              rows={4}
            />

            {/* Quick summary preview */}
            <div className="glass-card rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">Check-in summary</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-foreground">
                  {moodEmojis[mood - 1]} Mood {mood}/10
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-foreground">
                  Craving: {cravingLevels[craving]}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-foreground">
                  {energyLevels.find((e) => e.value === energy)?.emoji} {energyLevels.find((e) => e.value === energy)?.label}
                </span>
                {selectedEmotions.slice(0, 3).map((e) => (
                  <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {emotionTags.find((t) => t.label === e)?.emoji} {e}
                  </span>
                ))}
                {selectedEmotions.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                    +{selectedEmotions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Main render ─────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="card-enhanced relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/3 w-40 h-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25 icon-glow">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Daily Check-In</h3>
            <p className="text-[10px] text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden mb-5">
          <motion.div
            className="absolute inset-y-0 left-0 gradient-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step label */}
        <motion.p
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-foreground mb-4"
        >
          {stepLabels[step]}
        </motion.p>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="gap-1 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              size="sm"
              onClick={goNext}
              className="gap-1.5 gradient-primary text-primary-foreground font-medium px-5"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={loading}
              className="gap-1.5 gradient-primary text-primary-foreground font-medium px-5 btn-glow"
            >
              {loading ? "Saving..." : "Save Check-In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => {
                setDirection(i > currentStep ? 1 : -1);
                setCurrentStep(i);
              }}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-200",
                i === currentStep
                  ? "w-4 bg-primary"
                  : i < currentStep
                  ? "bg-primary/40"
                  : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
