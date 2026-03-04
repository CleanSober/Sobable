import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Share2, Heart } from "lucide-react";
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

export const DailyAffirmation = () => {
  // Seed by today's date so it's consistent per day
  const todayIndex = useMemo(() => {
    const d = new Date();
    return (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) % affirmations.length;
  }, []);

  const [index, setIndex] = useState(todayIndex);
  const [liked, setLiked] = useState(false);

  const shuffle = () => {
    let next: number;
    do { next = Math.floor(Math.random() * affirmations.length); } while (next === index);
    setIndex(next);
    setLiked(false);
  };

  const share = async () => {
    const text = affirmations[index];
    if (navigator.share) {
      await navigator.share({ text: `"${text}" — Sobable` });
    } else {
      await navigator.clipboard.writeText(`"${text}" — Sobable`);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-enhanced relative overflow-hidden"
    >
      {/* Subtle glow */}
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
          "{affirmations[index]}"
        </motion.p>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[10px]"
            onClick={() => setLiked(!liked)}
          >
            <Heart
              className={`w-3 h-3 mr-1 transition-colors ${
                liked ? "fill-pink-400 text-pink-400" : "text-muted-foreground"
              }`}
            />
            {liked ? "Saved" : "Save"}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={share}>
            <Share2 className="w-3 h-3 mr-1 text-muted-foreground" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] ml-auto" onClick={shuffle}>
            <RefreshCw className="w-3 h-3 mr-1 text-muted-foreground" />
            New
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
