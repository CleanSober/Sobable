import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Share2, Heart, Copy, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserData } from "@/hooks/useUserData";
import { getPersonalizedAffirmations } from "@/lib/substanceConfig";
import { copyText } from "@/lib/clipboard";

const SAVED_KEY = "sober_club_saved_affirmations";

const getSavedAffirmations = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
};

export const DailyAffirmation = () => {
  const { profile } = useUserData();

  const affirmations = useMemo(
    () => getPersonalizedAffirmations(profile?.substances),
    [profile?.substances]
  );

  const todayIndex = useMemo(() => {
    const d = new Date();
    return (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) % affirmations.length;
  }, [affirmations.length]);

  const [index, setIndex] = useState(todayIndex);
  const [savedList, setSavedList] = useState<string[]>(getSavedAffirmations);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [editedCaption, setEditedCaption] = useState<string | null>(null);

  // Reset to today's pick when the personalized pool changes (e.g. after onboarding).
  useEffect(() => {
    setIndex(todayIndex);
  }, [todayIndex]);

  const currentAffirmation = affirmations[index] ?? affirmations[0];
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

  const defaultShareText = `"${currentAffirmation}" — Sobable 🌱`;
  const shareText = editedCaption ?? defaultShareText;

  const copyToClipboard = async (silent = false) => {
    const result = await copyText(shareText);
    if (result.ok) {
      if (!silent) {
        setJustCopied(true);
        toast.success(result.message);
        setTimeout(() => setJustCopied(false), 2000);
      }
      return true;
    }
    if (!silent) {
      toast.error(result.message, { duration: 6000 });
    }
    return false;
  };

  const openExternal = async (url: string, platform: string) => {
    await copyToClipboard(true);
    toast.success(`${platform} opened — caption copied!`);
    window.open(url, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };

  const shareToWhatsApp = () =>
    openExternal(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "WhatsApp");

  const shareToTwitter = () =>
    openExternal(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "X");

  const shareToFacebook = () =>
    openExternal(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        typeof window !== "undefined" ? window.location.origin : "https://sobable.lovable.app"
      )}&quote=${encodeURIComponent(shareText)}`,
      "Facebook"
    );

  const shareNative = async () => {
    // Try native share if available; on failure or unavailable, fall back to menu.
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share({ text: shareText });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // fallthrough to menu
      }
    }
    setShowShareMenu(true);
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
              <textarea
                value={shareText}
                onChange={(e) => setEditedCaption(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full text-[11px] p-2 mb-1 rounded-md border border-border/60 bg-background/60 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Edit your caption..."
              />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-muted-foreground">{shareText.length}/500</span>
                {editedCaption !== null && editedCaption !== defaultShareText && (
                  <button
                    onClick={() => setEditedCaption(null)}
                    className="text-[9px] text-accent hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 flex-1 text-[10px] gap-1" onClick={() => copyToClipboard()}>
                  {justCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {justCopied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" className="h-8 flex-1 text-[10px] gap-1" onClick={shareToWhatsApp}>
                  💬 WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="h-8 flex-1 text-[10px] gap-1" onClick={shareToTwitter}>
                  𝕏 Post
                </Button>
                <Button variant="outline" size="sm" className="h-8 flex-1 text-[10px] gap-1" onClick={shareToFacebook}>
                  📘 FB
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
