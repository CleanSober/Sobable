import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, ExternalLink, Loader2, X, MessageSquare } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";

const APP_STORE_URL = "https://apps.apple.com/app/sobable/id0000000000";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.lovable.94e498b2e0e1433a9333abea9f12a84c";

const FEEDBACK_CATEGORIES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "ui", label: "Design / UI" },
  { value: "performance", label: "Performance" },
  { value: "other", label: "Other" },
];

function getDetectedPlatform(): string {
  if (Capacitor.isNativePlatform()) return Capacitor.getPlatform();
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "web";
}

interface FeedbackPromptDialogProps {
  open: boolean;
  onDismiss: () => void;
  onSubmitted: () => void;
}

export const FeedbackPromptDialog = ({ open, onDismiss, onSubmitted }: FeedbackPromptDialogProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [step, setStep] = useState<"rate" | "form" | "store">("rate");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const platform = getDetectedPlatform();

  const handleRatingSelect = (star: number) => {
    setRating(star);
    if (star === 5) {
      setStep("store");
    } else {
      setStep("form");
    }
  };

  const handleOpenStore = async () => {
    const url = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    window.open(url, "_blank");

    if (user) {
      await (supabase.from("feedback_submissions" as any) as any).insert({
        user_id: user.id,
        rating: 5,
        platform,
        category: "app_store_review",
        message: "Redirected to app store",
      });
    }
    onSubmitted();
    toast.success("Thank you for your support! 🎉");
  };

  const handleSubmitFeedback = async () => {
    if (!user || !message.trim() || message.trim().length < 10) return;

    setSubmitting(true);
    const { error } = await (supabase.from("feedback_submissions" as any) as any).insert({
      user_id: user.id,
      rating,
      platform,
      category: category || null,
      message: message.trim().slice(0, 2000),
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit feedback. Please try again.");
      return;
    }

    onSubmitted();
    toast.success("Thank you for your feedback! ❤️");
  };

  const storeName = platform === "ios" ? "App Store" : "Google Play Store";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onDismiss(); }}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-5 h-5 text-primary" />
            How's your experience?
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "rate" && (
            <motion.div
              key="rate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-2"
            >
              <p className="text-sm text-muted-foreground text-center">
                You've been making great progress! How would you rate Sober Club?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingSelect(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={onDismiss} className="text-xs text-muted-foreground">
                Not now
              </Button>
            </motion.div>
          )}

          {step === "store" && (
            <motion.div
              key="store"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-2 text-center"
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm font-medium">We're so glad you love Sober Club! 🎉</p>
              <p className="text-xs text-muted-foreground">
                Would you mind leaving a review on the {storeName}? It helps others find us!
              </p>
              <div className="flex gap-2 w-full">
                <Button onClick={handleOpenStore} className="flex-1 gap-2" size="sm">
                  <ExternalLink className="w-4 h-4" />
                  Leave a Review
                </Button>
                <Button onClick={() => { onSubmitted(); toast.success("Thank you! ❤️"); }} variant="outline" size="sm">
                  Maybe Later
                </Button>
              </div>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <button onClick={() => { setRating(0); setStep("rate"); }} className="text-xs text-primary hover:underline">Change</button>
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
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Your Feedback <span className="text-destructive">*</span></Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what we can do better..."
                  maxLength={2000}
                  rows={3}
                  className="text-sm resize-none"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{message.trim().length < 10 && message.length > 0 ? "Min 10 characters" : ""}</span>
                  <span>{message.length}/2000</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submitting || !message.trim() || message.trim().length < 10}
                  className="flex-1 gap-2"
                  size="sm"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit
                </Button>
                <Button onClick={onDismiss} variant="outline" size="sm">Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
