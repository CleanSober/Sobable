import { useState, useEffect } from "react";
import { emitFeedbackTrigger } from "@/hooks/useFeedbackPrompt";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, AlertTriangle, Clock, X, Check, Lightbulb, ChevronRight, ChevronLeft,
  ArrowRight, MapPin, Zap, Heart, Shield, Brain, Flame, Activity, Eye,
  ThumbsUp, ThumbsDown, Minus, RotateCcw, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getCopingStrategies } from "@/lib/storage";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TriggerEntry {
  id: string;
  date: string;
  time: string;
  trigger: string;
  situation: string;
  emotion: string;
  intensity: number;
  coping_used?: string;
  outcome?: string;
  notes?: string;
}

// ─── Data ──────────────────────────────────────────────
const triggerOptions = [
  { label: "Stress", emoji: "😫", color: "from-red-500/20 to-red-600/10" },
  { label: "Social pressure", emoji: "👥", color: "from-orange-500/20 to-orange-600/10" },
  { label: "Seeing substance", emoji: "👀", color: "from-rose-500/20 to-rose-600/10" },
  { label: "Location/Place", emoji: "📍", color: "from-purple-500/20 to-purple-600/10" },
  { label: "Certain people", emoji: "🗣️", color: "from-blue-500/20 to-blue-600/10" },
  { label: "Time of day", emoji: "🕐", color: "from-indigo-500/20 to-indigo-600/10" },
  { label: "Celebration", emoji: "🎉", color: "from-amber-500/20 to-amber-600/10" },
  { label: "Conflict", emoji: "⚡", color: "from-red-500/20 to-red-600/10" },
  { label: "Financial worry", emoji: "💸", color: "from-emerald-500/20 to-emerald-600/10" },
  { label: "Boredom", emoji: "🥱", color: "from-gray-500/20 to-gray-600/10" },
  { label: "Loneliness", emoji: "😔", color: "from-blue-500/20 to-blue-600/10" },
  { label: "HALT (Hungry/Angry/Lonely/Tired)", emoji: "🛑", color: "from-red-500/20 to-red-600/10" },
];

const emotionOptions = [
  { label: "Stress", emoji: "😰" },
  { label: "Anxiety", emoji: "😨" },
  { label: "Boredom", emoji: "🥱" },
  { label: "Loneliness", emoji: "😞" },
  { label: "Anger", emoji: "😤" },
  { label: "Sadness", emoji: "😢" },
  { label: "Excitement", emoji: "🤩" },
  { label: "Frustration", emoji: "😠" },
  { label: "Fear", emoji: "😱" },
  { label: "Guilt", emoji: "😣" },
  { label: "Shame", emoji: "😖" },
  { label: "Overwhelm", emoji: "🤯" },
];

const situationOptions = [
  { label: "At home alone", emoji: "🏠" },
  { label: "Social gathering", emoji: "🍻" },
  { label: "Work/Office", emoji: "💼" },
  { label: "Bar/Restaurant", emoji: "🍽️" },
  { label: "With friends", emoji: "👯" },
  { label: "Family event", emoji: "👨‍👩‍👧" },
  { label: "After argument", emoji: "💢" },
  { label: "Weekend", emoji: "📅" },
  { label: "Holiday", emoji: "🎄" },
  { label: "Driving/Commuting", emoji: "🚗" },
  { label: "Before bed", emoji: "🌙" },
  { label: "Other", emoji: "📌" },
];

const bodySensations = [
  { id: "chest_tight", label: "Chest tightness", emoji: "💓", area: "chest" },
  { id: "stomach_knots", label: "Stomach knots", emoji: "🤢", area: "stomach" },
  { id: "shaky_hands", label: "Shaky hands", emoji: "🫨", area: "hands" },
  { id: "racing_heart", label: "Racing heart", emoji: "💗", area: "chest" },
  { id: "headache", label: "Headache", emoji: "🤕", area: "head" },
  { id: "sweating", label: "Sweating", emoji: "💦", area: "body" },
  { id: "jaw_clenched", label: "Jaw clenched", emoji: "😬", area: "head" },
  { id: "restless_legs", label: "Restless legs", emoji: "🦵", area: "legs" },
  { id: "dry_mouth", label: "Dry mouth", emoji: "👄", area: "head" },
  { id: "none", label: "No physical symptoms", emoji: "✅", area: "none" },
];

const copingStrategiesUsed = [
  { label: "Breathing exercise", emoji: "🫁" },
  { label: "Called someone", emoji: "📞" },
  { label: "Walked away", emoji: "🚶" },
  { label: "Journaled", emoji: "📝" },
  { label: "Distracted myself", emoji: "🎮" },
  { label: "Meditation", emoji: "🧘" },
  { label: "Exercise", emoji: "🏃" },
  { label: "Ate/drank something", emoji: "🥤" },
  { label: "Waited it out", emoji: "⏳" },
  { label: "Used craving timer", emoji: "⏱️" },
  { label: "None", emoji: "❌" },
];

const STEPS = ["trigger", "emotion", "situation", "intensity", "body", "coping", "outcome", "notes"] as const;
type Step = (typeof STEPS)[number];

const stepLabels: Record<Step, { title: string; subtitle: string }> = {
  trigger: { title: "What triggered you?", subtitle: "Identify the trigger" },
  emotion: { title: "What are you feeling?", subtitle: "Name the emotion" },
  situation: { title: "Where were you?", subtitle: "The setting matters" },
  intensity: { title: "How intense is it?", subtitle: "Rate the craving" },
  body: { title: "Body check", subtitle: "Where do you feel it?" },
  coping: { title: "What did you try?", subtitle: "Coping strategies used" },
  outcome: { title: "How did you handle it?", subtitle: "Be honest — no judgment" },
  notes: { title: "Anything else?", subtitle: "Reflect & learn" },
};

// ─── Component ─────────────────────────────────────────
export const TriggerLogger = () => {
  const { user } = useAuth();
  const { addXP } = useGamification();
  const [isLogging, setIsLogging] = useState(false);
  const [entries, setEntries] = useState<TriggerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showBreathingOverlay, setShowBreathingOverlay] = useState(false);

  // Form state
  const [trigger, setTrigger] = useState("");
  const [emotion, setEmotion] = useState("");
  const [situation, setSituation] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [selectedSensations, setSelectedSensations] = useState<string[]>([]);
  const [selectedCoping, setSelectedCoping] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<"stayed_sober" | "struggled" | "relapsed" | "">("");
  const [notes, setNotes] = useState("");

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (!user) return;
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("trigger_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setEntries(data.map((e) => ({
        id: e.id,
        date: e.date,
        time: e.time,
        trigger: e.trigger,
        situation: e.situation,
        emotion: e.emotion,
        intensity: e.intensity,
        coping_used: e.coping_used || undefined,
        outcome: e.outcome || undefined,
        notes: e.notes || undefined,
      })));
    }
  };

  const resetForm = () => {
    setTrigger("");
    setEmotion("");
    setSituation("");
    setIntensity(5);
    setSelectedSensations([]);
    setSelectedCoping([]);
    setOutcome("");
    setNotes("");
    setIsLogging(false);
    setCurrentStep(0);
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
    if (!trigger || !situation || !emotion) {
      toast.error("Please complete trigger, emotion, and situation steps");
      return;
    }

    setLoading(true);
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Build enhanced notes
    const fullNotes = [
      notes.trim(),
      selectedSensations.length > 0 && !selectedSensations.includes("none")
        ? `Body: ${selectedSensations.join(", ")}`
        : "",
      selectedCoping.length > 0 && !selectedCoping.includes("None")
        ? `Coping: ${selectedCoping.join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const { error } = await supabase.from("trigger_entries").insert({
      user_id: user.id,
      date: today,
      time: now.toTimeString().slice(0, 5),
      trigger,
      situation,
      emotion,
      intensity,
      coping_used: selectedCoping.filter((c) => c !== "None").join(", ") || null,
      outcome: outcome || null,
      notes: fullNotes || null,
    });

    if (error) {
      toast.error("Failed to save trigger");
      setLoading(false);
      return;
    }

    await supabase.from("daily_goals").upsert(
      { user_id: user.id, date: today, trigger_logged: true },
      { onConflict: "user_id,date" }
    );

    await addXP(XP_REWARDS.trigger_log, "trigger_log", "Logged a trigger for self-awareness");

    await fetchEntries();
    resetForm();
    setLoading(false);
    toast.success("Trigger logged. You're building self-awareness! 💪");
    emitFeedbackTrigger();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("trigger_entries").delete().eq("id", id);
    if (!error) {
      setEntries(entries.filter((e) => e.id !== id));
      toast.success("Entry removed");
    }
  };

  const toggleSensation = (id: string) => {
    if (id === "none") {
      setSelectedSensations(["none"]);
      return;
    }
    setSelectedSensations((prev) => {
      const without = prev.filter((s) => s !== "none");
      return without.includes(id) ? without.filter((s) => s !== id) : [...without, id];
    });
  };

  const toggleCoping = (label: string) => {
    if (label === "None") {
      setSelectedCoping(["None"]);
      return;
    }
    setSelectedCoping((prev) => {
      const without = prev.filter((s) => s !== "None");
      return without.includes(label) ? without.filter((s) => s !== label) : [...without, label];
    });
  };

  const strategies = emotion ? getCopingStrategies(emotion, trigger) : [];

  const getIntensityEmoji = (val: number) => {
    if (val <= 2) return "😌";
    if (val <= 4) return "😐";
    if (val <= 6) return "😬";
    if (val <= 8) return "😰";
    return "🔥";
  };

  const getIntensityLabel = (val: number) => {
    if (val <= 2) return "Mild";
    if (val <= 4) return "Moderate";
    if (val <= 6) return "Strong";
    if (val <= 8) return "Very strong";
    return "Overwhelming";
  };

  const getIntensityColor = (val: number) => {
    if (val <= 2) return "text-success";
    if (val <= 4) return "text-primary";
    if (val <= 6) return "text-warning";
    if (val <= 8) return "text-orange-500";
    return "text-destructive";
  };

  // Animation variants
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  // ─── Step renderers ──────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case "trigger":
        return (
          <div className="grid grid-cols-2 gap-1.5">
            {triggerOptions.map((opt) => (
              <motion.button
                key={opt.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTrigger(opt.label)}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl transition-all duration-200 border text-left",
                  trigger === opt.label
                    ? "bg-destructive/10 border-destructive/30 shadow-sm"
                    : "bg-secondary/30 border-border/30 active:bg-secondary/50"
                )}
              >
                <span className="text-base">{opt.emoji}</span>
                <span className={cn("text-[10px] font-medium leading-tight", trigger === opt.label ? "text-destructive" : "text-foreground")}>
                  {opt.label}
                </span>
              </motion.button>
            ))}
          </div>
        );

      case "emotion":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-1.5">
              {emotionOptions.map((opt) => (
                <motion.button
                  key={opt.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEmotion(opt.label)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200 border",
                    emotion === opt.label
                      ? "bg-accent/15 border-accent/30 shadow-sm"
                      : "bg-secondary/30 border-border/30 active:bg-secondary/50"
                  )}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span className={cn("text-[9px] font-medium leading-tight", emotion === opt.label ? "text-accent" : "text-muted-foreground")}>
                    {opt.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Suggested coping strategies */}
            {emotion && strategies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">Suggested strategies</span>
                </div>
                <ul className="space-y-1">
                  {strategies.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-primary">•</span>{s}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        );

      case "situation":
        return (
          <div className="grid grid-cols-2 gap-1.5">
            {situationOptions.map((opt) => (
              <motion.button
                key={opt.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSituation(opt.label)}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl transition-all duration-200 border text-left",
                  situation === opt.label
                    ? "bg-primary/10 border-primary/30 shadow-sm"
                    : "bg-secondary/30 border-border/30 active:bg-secondary/50"
                )}
              >
                <span className="text-base">{opt.emoji}</span>
                <span className={cn("text-[10px] font-medium", situation === opt.label ? "text-primary" : "text-foreground")}>
                  {opt.label}
                </span>
              </motion.button>
            ))}
          </div>
        );

      case "intensity":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <motion.span
                key={intensity}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl inline-block mb-2"
              >
                {getIntensityEmoji(intensity)}
              </motion.span>
              <p className={cn("text-sm font-semibold", getIntensityColor(intensity))}>
                {getIntensityLabel(intensity)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {intensity <= 4
                  ? "Manageable — great awareness logging this"
                  : intensity <= 7
                  ? "This is tough, but you're still here"
                  : "Consider using the craving timer right now"}
              </p>
            </div>
            <div className="px-1">
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-destructive"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-0.5">
                <span>Mild</span>
                <span className="font-semibold text-foreground text-xs">{intensity}/10</span>
                <span>Overwhelming</span>
              </div>
            </div>

            {/* Urgency tools for high intensity */}
            {intensity >= 7 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs font-medium text-destructive">Quick tools for right now</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBreathingOverlay(true)}
                    className="text-[10px] px-2.5 py-1.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20 active:bg-destructive/25 transition-colors"
                  >
                    🫁 Breathe 4-7-8
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      // Scroll to craving timer (it's above TriggerLogger in the page)
                      document.querySelector('[data-craving-timer]')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] px-2.5 py-1.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20 active:bg-destructive/25 transition-colors"
                  >
                    ⏱️ Start timer
                  </button>
                  <button
                    onClick={() => {
                      const phone = localStorage.getItem('cleanSober_userData');
                      try {
                        const data = phone ? JSON.parse(phone) : null;
                        const emergencyNum = data?.emergencyContact || data?.sponsorPhone;
                        if (emergencyNum) {
                          window.open(`tel:${emergencyNum}`, '_self');
                        } else {
                          toast.info("Add an emergency contact in your profile first");
                        }
                      } catch {
                        toast.info("Add an emergency contact in your profile first");
                      }
                    }}
                    className="text-[10px] px-2.5 py-1.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20 active:bg-destructive/25 transition-colors"
                  >
                    📞 Call someone
                  </button>
                </div>
              </motion.div>
            )}

            {/* Quick breathing overlay */}
            <AnimatePresence>
              {showBreathingOverlay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
                >
                  <div className="w-full max-w-sm space-y-6 text-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1.3, 1],
                      }}
                      transition={{
                        duration: 19,
                        repeat: Infinity,
                        times: [0, 0.21, 0.58, 1],
                      }}
                      className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-primary/40"
                    >
                      <span className="text-4xl">🫁</span>
                    </motion.div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">4-7-8 Breathing</p>
                      <p className="text-sm text-muted-foreground mt-1">Inhale 4s → Hold 7s → Exhale 8s</p>
                    </div>
                    <Button variant="outline" onClick={() => setShowBreathingOverlay(false)} className="text-sm">
                      <X className="w-4 h-4 mr-1.5" /> Close
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "body":
        return (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground text-center">Where do you feel it in your body?</p>
            <div className="grid grid-cols-2 gap-1.5">
              {bodySensations.map((s) => {
                const isSelected = selectedSensations.includes(s.id);
                return (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSensation(s.id)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl transition-all duration-200 border text-left",
                      isSelected
                        ? s.id === "none"
                          ? "bg-success/10 border-success/30"
                          : "bg-warning/10 border-warning/30"
                        : "bg-secondary/30 border-border/30 active:bg-secondary/50"
                    )}
                  >
                    <span className="text-base">{s.emoji}</span>
                    <span className={cn(
                      "text-[10px] font-medium",
                      isSelected
                        ? s.id === "none" ? "text-success" : "text-warning"
                        : "text-foreground"
                    )}>
                      {s.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case "coping":
        return (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground text-center">Select all that apply</p>
            <div className="grid grid-cols-2 gap-1.5">
              {copingStrategiesUsed.map((c) => {
                const isSelected = selectedCoping.includes(c.label);
                return (
                  <motion.button
                    key={c.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleCoping(c.label)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl transition-all duration-200 border text-left",
                      isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/30 border-border/30 active:bg-secondary/50"
                    )}
                  >
                    <span className="text-base">{c.emoji}</span>
                    <span className={cn("text-[10px] font-medium", isSelected ? "text-primary" : "text-foreground")}>
                      {c.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case "outcome":
        return (
          <div className="space-y-2">
            {[
              { value: "stayed_sober" as const, label: "Stayed Sober", emoji: "💪", desc: "I resisted the urge", colorClass: "bg-success/10 border-success/30 text-success" },
              { value: "struggled" as const, label: "Struggled", emoji: "😓", desc: "It was really hard but I got through", colorClass: "bg-warning/10 border-warning/30 text-warning" },
              { value: "relapsed" as const, label: "Slipped", emoji: "🔄", desc: "I can learn from this and try again", colorClass: "bg-destructive/10 border-destructive/30 text-destructive" },
            ].map((opt) => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOutcome(opt.value)}
                className={cn(
                  "w-full flex items-center gap-2.5 p-3 rounded-xl transition-all duration-200 border",
                  outcome === opt.value ? opt.colorClass : "bg-secondary/30 border-border/30 active:bg-secondary/50"
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div className="flex-1 text-left">
                  <p className={cn("text-xs font-semibold", outcome === opt.value ? "" : "text-foreground")}>{opt.label}</p>
                  <p className="text-[9px] text-muted-foreground">{opt.desc}</p>
                </div>
                {outcome === opt.value && <Check className="w-4 h-4" />}
              </motion.button>
            ))}

            {outcome === "relapsed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center"
              >
                <Heart className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-foreground font-medium">A slip doesn't erase your progress</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Every moment you log helps you learn and grow stronger</p>
              </motion.div>
            )}
          </div>
        );

      case "notes":
        return (
          <div className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What helped? What made it harder? What would you do differently?"
              className="bg-secondary/30 border-border/50 resize-none focus:border-primary/50 transition-colors min-h-[80px] text-sm"
              rows={3}
            />

            {/* Summary preview */}
            <div className="glass-card rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">Entry summary</p>
              <div className="flex flex-wrap gap-1.5">
                {trigger && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    {triggerOptions.find((t) => t.label === trigger)?.emoji} {trigger}
                  </span>
                )}
                {emotion && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {emotionOptions.find((e) => e.label === emotion)?.emoji} {emotion}
                  </span>
                )}
                {situation && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {situationOptions.find((s) => s.label === situation)?.emoji} {situation}
                  </span>
                )}
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full", getIntensityColor(intensity), "bg-secondary/50")}>
                  {getIntensityEmoji(intensity)} {intensity}/10
                </span>
                {outcome && (
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    outcome === "stayed_sober" ? "bg-success/10 text-success" : outcome === "struggled" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                  )}>
                    {outcome === "stayed_sober" ? "💪 Resisted" : outcome === "struggled" ? "😓 Struggled" : "🔄 Slipped"}
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

  // ─── Render ──────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Log New Button */}
      {!isLogging && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            onClick={() => setIsLogging(true)}
            className="w-full gradient-primary text-primary-foreground font-semibold py-5 text-sm"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Log a Trigger
          </Button>
        </motion.div>
      )}

      {/* Multi-step form */}
      <AnimatePresence>
        {isLogging && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="card-enhanced relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/3 w-40 h-40 bg-destructive/8 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative p-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-destructive/15 border border-destructive/25">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Log Trigger</h3>
                    <p className="text-[9px] text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
                  </div>
                </div>
                <button onClick={resetForm} className="p-1.5 active:bg-secondary rounded-lg">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="relative h-1 bg-muted/50 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: "linear-gradient(135deg, hsl(0 75% 55%), hsl(42 100% 55%))" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Step label */}
              <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
                <p className="text-xs font-medium text-foreground">{stepLabels[step].title}</p>
                <p className="text-[9px] text-muted-foreground">{stepLabels[step].subtitle}</p>
              </motion.div>

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
              <div className="flex items-center justify-between mt-4 gap-3">
                <Button variant="ghost" size="sm" onClick={goPrev} disabled={currentStep === 0} className="gap-1 text-muted-foreground h-9 text-xs">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button size="sm" onClick={goNext} className="gap-1 gradient-primary text-primary-foreground font-medium px-4 h-9 text-xs">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={loading || !trigger || !emotion || !situation}
                    className="gap-1 gradient-primary text-primary-foreground font-medium px-4 h-9 text-xs btn-glow"
                  >
                    {loading ? "Saving..." : "Save Entry"} {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </Button>
                )}
              </div>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-1 mt-3">
                {STEPS.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i); }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-200",
                      i === currentStep ? "w-3.5 bg-destructive" : i < currentStep ? "bg-destructive/40" : "bg-muted-foreground/20"
                    )}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-enhanced overflow-hidden"
        >
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-xl bg-destructive/10 border border-destructive/20">
                <Activity className="w-3.5 h-3.5 text-destructive" />
              </div>
              <span className="text-xs font-semibold text-foreground">Recent Triggers</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{entries.length} logged</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {entries.map((entry) => {
                const isExpanded = expandedEntry === entry.id;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "rounded-xl border transition-all duration-200 overflow-hidden",
                      entry.outcome === "stayed_sober"
                        ? "bg-success/5 border-success/20"
                        : entry.outcome === "relapsed"
                        ? "bg-destructive/5 border-destructive/20"
                        : "bg-secondary/30 border-border/30"
                    )}
                  >
                    {/* Compact row */}
                    <button
                      onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      className="w-full flex items-center gap-3 p-3 text-left"
                    >
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {triggerOptions.find((t) => t.label === entry.trigger)?.emoji || "⚠️"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{entry.trigger}</p>
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
                            getIntensityColor(entry.intensity),
                            "bg-secondary/50"
                          )}>
                            {entry.intensity}/10
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {entry.time} • {entry.emotion}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {entry.outcome && (
                          <span className="text-sm">
                            {entry.outcome === "stayed_sober" ? "💪" : entry.outcome === "struggled" ? "😓" : "🔄"}
                          </span>
                        )}
                        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </button>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border/20"
                        >
                          <div className="p-3 space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                📍 {entry.situation}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                                {emotionOptions.find((e) => e.label === entry.emotion)?.emoji} {entry.emotion}
                              </span>
                              {entry.outcome && (
                                <span className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full",
                                  entry.outcome === "stayed_sober"
                                    ? "bg-success/10 text-success border border-success/20"
                                    : entry.outcome === "struggled"
                                    ? "bg-warning/10 text-warning border border-warning/20"
                                    : "bg-destructive/10 text-destructive border border-destructive/20"
                                )}>
                                  {entry.outcome === "stayed_sober" ? "💪 Resisted" : entry.outcome === "struggled" ? "😓 Struggled" : "🔄 Slipped"}
                                </span>
                              )}
                            </div>
                            {entry.coping_used && (
                              <p className="text-[10px] text-muted-foreground">
                                <span className="font-medium text-foreground">Coping:</span> {entry.coping_used}
                              </p>
                            )}
                            {entry.notes && (
                              <p className="text-[10px] text-muted-foreground">{entry.notes}</p>
                            )}
                            {deleteConfirm === entry.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-destructive">Delete this entry?</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); setDeleteConfirm(null); }}
                                  className="text-[10px] font-semibold text-destructive px-2 py-0.5 rounded bg-destructive/10"
                                >
                                  Yes, delete
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                                  className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-secondary/50"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(entry.id); }}
                                className="text-[10px] text-destructive/60 hover:text-destructive transition-colors"
                              >
                                Delete entry
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
