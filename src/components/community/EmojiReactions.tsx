import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SmilePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const EMOJI_OPTIONS = ["❤️", "👍", "🎉", "💪", "🙏", "🤗"];

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface EmojiReactionsProps {
  targetId: string;
  targetType: "forum_post" | "chat_message";
  compact?: boolean;
}

export const EmojiReactions = ({ targetId, targetType, compact = false }: EmojiReactionsProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [targetId]);

  const fetchReactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("reactions")
      .select("emoji, user_id")
      .eq("target_type", targetType)
      .eq("target_id", targetId);

    if (error) {
      console.error("Error fetching reactions:", error);
      return;
    }

    // Group reactions by emoji
    const emojiMap = new Map<string, { count: number; hasReacted: boolean }>();
    
    data?.forEach((reaction) => {
      const existing = emojiMap.get(reaction.emoji) || { count: 0, hasReacted: false };
      emojiMap.set(reaction.emoji, {
        count: existing.count + 1,
        hasReacted: existing.hasReacted || reaction.user_id === user.id,
      });
    });

    const reactionsList: Reaction[] = [];
    emojiMap.forEach((value, emoji) => {
      reactionsList.push({ emoji, ...value });
    });

    // Sort by count descending
    reactionsList.sort((a, b) => b.count - a.count);
    setReactions(reactionsList);
  };

  const toggleReaction = async (emoji: string) => {
    if (!user || loading) return;

    setLoading(true);
    const existingReaction = reactions.find((r) => r.emoji === emoji && r.hasReacted);

    if (existingReaction) {
      // Remove reaction
      await supabase
        .from("reactions")
        .delete()
        .eq("user_id", user.id)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .eq("emoji", emoji);
    } else {
      // Add reaction
      await supabase.from("reactions").insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        emoji,
      });
    }

    await fetchReactions();
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Existing reactions */}
      <AnimatePresence mode="popLayout">
        {reactions.map((reaction) => (
          <motion.button
            key={reaction.emoji}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleReaction(reaction.emoji)}
            disabled={loading}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
              reaction.hasReacted
                ? "bg-primary/20 border border-primary/30"
                : "bg-secondary/50 border border-border/50 hover:bg-secondary"
            }`}
          >
            <span>{reaction.emoji}</span>
            <span className={reaction.hasReacted ? "text-primary font-medium" : "text-muted-foreground"}>
              {reaction.count}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`inline-flex items-center justify-center rounded-full transition-colors hover:bg-secondary ${
              compact ? "w-6 h-6" : "w-7 h-7"
            }`}
          >
            <SmilePlus className={`text-muted-foreground hover:text-primary ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
          </motion.button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => {
              const existing = reactions.find((r) => r.emoji === emoji);
              return (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleReaction(emoji)}
                  disabled={loading}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors ${
                    existing?.hasReacted
                      ? "bg-primary/20"
                      : "hover:bg-secondary"
                  }`}
                >
                  {emoji}
                </motion.button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
