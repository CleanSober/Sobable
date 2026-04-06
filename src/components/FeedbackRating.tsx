import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, MessageSquare, ExternalLink, Loader2 } from "lucide-react";
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

const APP_STORE_URL = "https://apps.apple.com/app/sober-club/id0000000000"; // Replace with real App Store ID
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

function getStoreName(platform: string) {
  return platform === "ios" ? "App Store" : "Google Play Store";
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
  rating: number;
  platform: string;
  category: string | null;
  message: string | null;
}) {
  // Use the Supabase client with type assertion for the new table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("feedback_submissions" as any) as any).insert(data);
  return { error };
}

export const FeedbackRating = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [step, setStep] = useState<"rate" | "form" | "store" | "done" | "cooldown">("rate");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const platform = getDetectedPlatform();

  // Check cooldown on mount
  useEffect(() => {
    if (isInCooldown()) {
      setStep("cooldown");
    }
  }, []);

  const handleRatingSelect = (star: number) => {
    setRating(star);
    if (star === 5) {
      setStep("store");
    } else {
      setStep("form");
    }
  };

  const handleOpenStore = async () => {
    window.open(getStoreUrl(platform), "_blank");

    if (user) {
      await insertFeedback({
        user_id: user.id,
        rating: 5,
        platform,
        category: "app_store_review",
        message: "Redirected to app store",
      });
    }
    setCooldown();
    setStep("done");
    toast.success("Thank you for your support! 🎉");
  };

  const handleSubmitFeedback = async () => {
    if (!user) {
      toast.error("Please sign in to submit feedback");
      return;
    }
    if (!message.trim()) {
      toast.error("Please write some feedback");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Please provide at least 10 characters of feedback");
      return;
    }

    setSubmitting(true);
    const { error } = await insertFeedback({
      user_id: user.id,
      rating,
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
    setStep("done");
    toast.success("Thank you for your feedback! We'll use it to improve.");
  };

  const handleReset = () => {
    setRating(0);
    setStep("rate");
    setCategory("");
    setMessage("");
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
        Your feedback helps us improve Sober Club
      </p>

      <AnimatePresence mode="wait">
        {/* Cooldown state */}
        {step === "cooldown" && (
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
          </motion.div>
        )}

        {/* Step 1: Star Rating */}
        {step === "rate" && (
          <motion.div
            key="rate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-xs text-muted-foreground">How would you rate Sober Club?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingSelect(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredStar || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">Tap a star to rate</p>
          </motion.div>
        )}

        {/* Step 2a: 5 Stars → App Store redirect */}
        {step === "store" && (
          <motion.div
            key="store"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm font-medium text-foreground">
              We're so glad you love Sober Club! 🎉
            </p>
            <p className="text-xs text-muted-foreground">
              Would you mind leaving a review on the {getStoreName(platform)}?
              It really helps others find us!
            </p>
            <div className="flex gap-2 w-full">
              <Button onClick={handleOpenStore} className="flex-1 gap-2" size="sm">
                <ExternalLink className="w-4 h-4" />
                Leave a Review
              </Button>
              <Button
                onClick={() => {
                  setCooldown();
                  setStep("done");
                  toast.success("Thank you! ❤️");
                }}
                variant="outline"
                size="sm"
              >
                Maybe Later
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2b: Below 5 Stars → Feedback form */}
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  setRating(0);
                  setStep("rate");
                }}
                className="text-xs text-primary hover:underline"
              >
                Change
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              We'd love to hear how we can improve. Your feedback goes directly to our team.
            </p>

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
                placeholder="Tell us what we can do better..."
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
              <Button
                onClick={() => {
                  setRating(0);
                  setStep("rate");
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
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
            <Button onClick={handleReset} variant="ghost" size="sm" className="text-xs">
              Rate again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
