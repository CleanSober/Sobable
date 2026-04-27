import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, ExternalLink, Loader2, MessageSquare } from "lucide-react";
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
import { InAppReview } from "@capacitor-community/in-app-review";

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
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const platform = getDetectedPlatform();

  const handleLeaveReview = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await InAppReview.requestReview();
        onSubmitted();
        return;
      } catch (e) {
        console.warn("In-app review unavailable, falling back to store URL", e);
      }
    }
    const url = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    window.open(url, "_blank");
    onSubmitted();
  };

  const handleSubmitFeedback = async () => {
    if (!user || !message.trim() || message.trim().length < 10) return;

    setSubmitting(true);
    const { error } = await (supabase.from("feedback_submissions" as any) as any).insert({
      user_id: user.id,
      rating: rating > 0 ? rating : null,
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
    toast.success("Thank you for your feedback!");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onDismiss(); }}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-5 h-5 text-primary" />
            Rate Your Experience
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3 py-2"
            >
              <p className="text-sm text-muted-foreground text-center">
                Leave a review on the store, or send feedback directly to our team.
              </p>
              <div className="flex flex-col gap-2 w-full">
                <Button onClick={handleLeaveReview} className="w-full gap-2" size="sm">
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span className="truncate">Leave a Review</span>
                </Button>
                <Button onClick={() => setStep("form")} variant="outline" className="w-full gap-2" size="sm">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">Send Feedback</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={onDismiss} className="text-xs text-muted-foreground">
                  Not now
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
                        className={`w-5 h-5 transition-colors ${
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
                  placeholder="Tell us what you think..."
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
                <Button onClick={() => setStep("choose")} variant="outline" size="sm">Back</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
