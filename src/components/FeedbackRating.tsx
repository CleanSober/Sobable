import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Star, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";

const APP_STORE_URL =
  "https://apps.apple.com/app/sober-club/id0000000000?action=write-review";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.sober.club";

const FEEDBACK_CATEGORIES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "ui", label: "Design / UI" },
  { value: "performance", label: "Performance" },
  { value: "other", label: "Other" },
];

const COOLDOWN_KEY = "feedback_last_submitted";
const COOLDOWN_HOURS = 24;

function getDetectedPlatform(): string {
  if (Capacitor.isNativePlatform()) return Capacitor.getPlatform();
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "web";
}

function getStoreUrl(platform: string) {
  return platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
}

function isInCooldown(): boolean {
  const last = localStorage.getItem(COOLDOWN_KEY);
  if (!last) return false;
  const elapsed = Date.now() - parseInt(last, 10);
  return elapsed < COOLDOWN_HOURS * 60 * 60 * 1000;
}

function setCooldown() {
  localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
}

async function insertFeedback(data: {
  user_id: string;
  rating: number | null;
  platform: string;
  category: string | null;
  message: string | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("feedback_submissions" as any) as any).insert(data);
  return { error };
}

export const FeedbackRating = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"idle" | "form" | "done" | "cooldown">("idle");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const platform = getDetectedPlatform();

  useEffect(() => {
    if (isInCooldown()) setMode("cooldown");
  }, []);

  // Always opens the store. No filtering by rating. Apple 5.6.1 compliant.
  const handleLeaveReview = () => {
    window.open(getStoreUrl(platform), "_blank");
  };

  const handleSubmitFeedback = async () => {
    if (!user) {
      toast.error("Please sign in to submit feedback");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      toast.error("Please provide at least 10 characters of feedback");
      return;
    }

    setSubmitting(true);
    const { error } = await insertFeedback({
      user_id: user.id,
      rating: rating > 0 ? rating : null,
      platform,
      category: category || null,
      message: message.trim().slice(0, 2000),
    });
    setSubmitting(false);

    if (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
      return;
    }

    setCooldown();
    setMode("done");
    toast.success("Thank you for your feedback!");
  };

  const handleReset = () => {
    setRating(0);
    setCategory("");
    setMessage("");
    setMode("idle");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-enhanced p-4"
    >
      <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        Rate Your Experience
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Leave a review on the store, or send feedback directly to our team.
      </p>

      <AnimatePresence mode="wait">
        {mode === "cooldown" && (
          <motion.div
            key="cooldown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-2 text-center"
          >
            <div className="text-2xl">✅</div>
            <p className="text-sm font-medium text-foreground">Feedback received!</p>
            <p className="text-xs text-muted-foreground">
              You can submit again in 24 hours
            </p>
            <Button
              onClick={handleLeaveReview}
              variant="outline"
              size="sm"
              className="gap-2 mt-2"
            >
              <ExternalLink className="w-4 h-4" />
              Leave a Review
            </Button>
          </motion.div>
        )}

        {mode === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleLeaveReview}
                className="flex-1 gap-2"
                size="sm"
              >
                <ExternalLink className="w-4 h-4" />
                Leave a Review
              </Button>
              <Button
                onClick={() => setMode("form")}
                variant="outline"
                className="flex-1 gap-2"
                size="sm"
              >
                <MessageSquare className="w-4 h-4" />
                Send Feedback
              </Button>
            </div>
          </motion.div>
        )}

        {mode === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label className="text-xs">Rating (optional)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star === rating ? 0 : star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Category (optional)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                Your Feedback <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                maxLength={2000}
                rows={4}
                className="text-sm resize-none"
              />
              <div className="flex justify-between">
                <p className="text-[10px] text-muted-foreground">
                  {message.trim().length < 10 && message.length > 0
                    ? "Min 10 characters"
                    : ""}
                </p>
                <p className="text-[10px] text-muted-foreground">{message.length}/2000</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitFeedback}
                disabled={submitting || !message.trim() || message.trim().length < 10}
                className="flex-1 gap-2"
                size="sm"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit Feedback
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {mode === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-2 text-center"
          >
            <div className="text-3xl">🙏</div>
            <p className="text-sm font-medium text-foreground">Thank you!</p>
            <p className="text-xs text-muted-foreground">
              Your feedback means the world to us
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
