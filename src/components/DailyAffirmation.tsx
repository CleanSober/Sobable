import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Share2, Heart, Copy, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const affirmations = [
  "I am stronger than my cravings.",
  "Every sober day is a victory worth celebrating.",
  "I deserve the peace that comes with recovery.",
  "My past does not define my future.",
  "I choose health, clarity, and freedom today.",
  "I am worthy of love, including my own.",
  "Progress, not perfection, is my goal.",
  "I have the courage to face today without substances.",
  "My sobriety is a gift I give myself every day.",
  "I am building a life I don't need to escape from.",
  "Each moment of discomfort is temporary; my growth is permanent.",
  "I am surrounded by people who believe in me.",
  "I trust myself to handle whatever comes my way.",
  "I am proud of how far I've come.",
  "Today I choose to be present and grateful.",
  "My healing inspires others, even when I don't see it.",
  "I release what I cannot control and focus on what I can.",
  "I am more than my addiction — I am resilient.",
  "Every challenge I overcome makes me stronger.",
  "I am creating a life filled with purpose and meaning.",
];

const SAVED_KEY = "sobable_saved_affirmations";

const getSavedAffirmations = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
};

export const DailyAffirmation = () => {
  const todayIndex = useMemo(() => {
    const d = new Date();
    return (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) % affirmations.length;
  }, []);

  const [index, setIndex] = useState(todayIndex);
  const [savedList, setSavedList] = useState<string[]>(getSavedAffirmations);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const currentAffirmation = affirmations[index];
  const isSaved = savedList.includes(currentAffirmation);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedList));
  }, [savedList]);

  const toggleSave = () => {
    if (isSaved) {
      setSavedList((prev) => prev.filter((a) => a !== currentAffirmation));
      toast("Removed from saved affirmations");
    } else {
      setSavedList((prev) => [...prev, currentAffirmation]);
      toast.success("💜 Affirmation saved!", {
        description: "You can revisit your saved affirmations anytime.",
      });
    }
  };

  const shuffle = () => {
    let next: number;
    do {
      next = Math.floor(Math.random() * affirmations.length);
    } while (next === index);
    setIndex(next);
    setShowShareMenu(false);
  };

  const shareText = `"${currentAffirmation}" — Sobable 🌱`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setJustCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setJustCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setJustCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setJustCopied(false), 2000);
    }
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
    setShowShareMenu(false);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        setShowShareMenu(false);
      } catch {
        // User cancelled
      }
    } else {
      setShowShareMenu(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-enhanced relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 blur-[50px] rounded-full pointer-events-none" />

      <div className="relative p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
            Daily Affirmation
          </span>
        </div>

        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-foreground italic leading-relaxed mb-3"
        >
          "{currentAffirmation}"
        </motion.p>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={toggleSave}>
            <Heart
              className={`w-3 h-3 mr-1 transition-colors ${
                isSaved ? "fill-pink-400 text-pink-400" : "text-muted-foreground"
              }`}
            />
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={shareNative}>
            <Share2 className="w-3 h-3 mr-1 text-muted-foreground" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] ml-auto" onClick={shuffle}>
            <RefreshCw className="w-3 h-3 mr-1 text-muted-foreground" />
            New
          </Button>
        </div>

        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pt-2 border-t border-border/50 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-muted-foreground">Share via</span>
                <button onClick={() => setShowShareMenu(false)} className="p-0.5 rounded hover:bg-muted">
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 flex-1 text-[10px] gap-1" onClick={copyToClipboard}>
                  {justCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {justCopied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" className="h-8 flex-1 text-[10px] gap-1" onClick={shareToWhatsApp}>
                  💬 WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="h-8 flex-1 text-[10px] gap-1" onClick={shareToTwitter}>
                  𝕏 Post
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
