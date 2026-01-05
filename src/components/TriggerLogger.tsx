import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertTriangle, Clock, X, Check, ChevronDown, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  saveTriggerEntry,
  getTriggerEntries,
  deleteTriggerEntry,
  getCopingStrategies,
  type TriggerEntry,
} from "@/lib/storage";
import { toast } from "sonner";

const triggerOptions = [
  "Stress", "Social pressure", "Seeing substance", "Location/Place",
  "Certain people", "Time of day", "Celebration", "Conflict", "Financial worry", "Other"
];

const emotionOptions = [
  "Stress", "Anxiety", "Boredom", "Loneliness", "Anger",
  "Sadness", "Excitement", "Frustration", "Fear", "Celebration"
];

const situationOptions = [
  "At home alone", "Social gathering", "Work/Office", "Bar/Restaurant",
  "With friends", "Family event", "After argument", "Weekend", "Holiday", "Other"
];

export const TriggerLogger = () => {
  const [isLogging, setIsLogging] = useState(false);
  const [entries, setEntries] = useState<TriggerEntry[]>(getTriggerEntries());
  const [showStrategies, setShowStrategies] = useState<string | null>(null);
  
  // Form state
  const [trigger, setTrigger] = useState("");
  const [situation, setSituation] = useState("");
  const [emotion, setEmotion] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [copingUsed, setCopingUsed] = useState("");
  const [outcome, setOutcome] = useState<"resisted" | "struggled" | "relapsed" | "">("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setTrigger("");
    setSituation("");
    setEmotion("");
    setIntensity(5);
    setCopingUsed("");
    setOutcome("");
    setNotes("");
    setIsLogging(false);
  };

  const handleSubmit = () => {
    if (!trigger || !situation || !emotion) {
      toast.error("Please fill in trigger, situation, and emotion");
      return;
    }

    const now = new Date();
    const entry: TriggerEntry = {
      id: Date.now().toString(),
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      trigger,
      situation,
      emotion,
      intensity,
      copingUsed: copingUsed || undefined,
      outcome: outcome || undefined,
      notes: notes || undefined,
    };

    saveTriggerEntry(entry);
    setEntries(getTriggerEntries());
    resetForm();
    toast.success("Trigger logged. You're building self-awareness! 💪");
  };

  const handleDelete = (id: string) => {
    deleteTriggerEntry(id);
    setEntries(getTriggerEntries());
    toast.success("Entry removed");
  };

  const strategies = emotion ? getCopingStrategies(emotion, trigger) : [];

  return (
    <div className="space-y-6">
      {/* Log New Button */}
      {!isLogging && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={() => setIsLogging(true)}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log a Trigger
          </Button>
        </motion.div>
      )}

      {/* Logging Form */}
      <AnimatePresence>
        {isLogging && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl gradient-card shadow-card border border-border/50 p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Log Trigger</h3>
              <button onClick={resetForm} className="p-2 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Trigger */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                What triggered you?
              </label>
              <div className="flex flex-wrap gap-2">
                {triggerOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setTrigger(opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      trigger === opt
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Situation */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Where/When did this happen?
              </label>
              <div className="flex flex-wrap gap-2">
                {situationOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSituation(opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      situation === opt
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Emotion */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                What were you feeling?
              </label>
              <div className="flex flex-wrap gap-2">
                {emotionOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setEmotion(opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      emotion === opt
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Coping Strategies Suggestion */}
            {emotion && strategies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Suggested Coping Strategies</span>
                </div>
                <ul className="space-y-1">
                  {strategies.slice(0, 3).map((strategy, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {strategy}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Intensity */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Craving intensity: {intensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-destructive"
              />
            </div>

            {/* Outcome */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                How did you handle it?
              </label>
              <div className="flex gap-2">
                {[
                  { value: "resisted", label: "Resisted 💪", color: "bg-success text-success-foreground" },
                  { value: "struggled", label: "Struggled 😓", color: "bg-warning text-warning-foreground" },
                  { value: "relapsed", label: "Slipped 🔄", color: "bg-destructive text-destructive-foreground" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setOutcome(opt.value as typeof outcome)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      outcome === opt.value ? opt.color : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What helped? What made it harder?"
                className="bg-secondary/50 border-border/50 resize-none"
                rows={2}
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              className="w-full gradient-primary text-primary-foreground font-semibold"
              size="lg"
            >
              Save Entry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-lg font-semibold text-foreground">Recent Triggers</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {entries.slice(0, 10).map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-secondary/50 border border-border/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.date).toLocaleDateString()} at {entry.time}
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.outcome && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.outcome === "resisted"
                            ? "bg-success/20 text-success"
                            : entry.outcome === "struggled"
                            ? "bg-warning/20 text-warning"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {entry.outcome}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">
                    {entry.trigger}
                  </span>
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent text-xs">
                    {entry.situation}
                  </span>
                  <span className="px-2 py-1 rounded bg-destructive/10 text-destructive text-xs">
                    {entry.emotion}
                  </span>
                </div>

                {entry.notes && (
                  <p className="text-sm text-muted-foreground">{entry.notes}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
