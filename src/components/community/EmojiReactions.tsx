import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SmilePlus } from "lucide-react";
import { useReactions } from "@/hooks/useCommunity";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const EMOJI_OPTIONS = ["❤️", "👍", "🎉", "💪", "🙏", "🤗"] as const;

interface EmojiReactionsProps {
  targetId: string;
  targetType: "forum_post" | "chat_message" | "forum_reply";
  compact?: boolean;
}

export const EmojiReactions = memo(({ targetId, targetType, compact = false }: EmojiReactionsProps) => {
  const { reactions, loading, toggleReaction } = useReactions(targetId, targetType);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = async (emoji: string) => {
    await toggleReaction(emoji);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Reactions">
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
            onClick={() => handleToggle(reaction.emoji)}
            disabled={loading}
            aria-label={`${reaction.emoji} ${reaction.count} reactions${reaction.hasReacted ? ", you reacted" : ""}`}
            aria-pressed={reaction.hasReacted}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-200 ${
              reaction.hasReacted
                ? "bg-primary/20 border border-primary/40 shadow-sm shadow-primary/20"
                : "bg-secondary/60 border border-border/50 hover:bg-secondary hover:border-border"
            }`}
          >
            <span aria-hidden="true">{reaction.emoji}</span>
            <span className={`font-medium ${reaction.hasReacted ? "text-primary" : "text-muted-foreground"}`}>
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
            aria-label="Add reaction"
            className={`inline-flex items-center justify-center rounded-full transition-all duration-200 hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-background ${
              compact ? "w-6 h-6" : "w-7 h-7"
            }`}
          >
            <SmilePlus 
              className={`text-muted-foreground transition-colors hover:text-primary ${
                compact ? "w-3.5 h-3.5" : "w-4 h-4"
              }`} 
            />
          </motion.button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2 bg-card/95 backdrop-blur-sm border-border/60" 
          align="start"
          sideOffset={4}
        >
          <div className="flex gap-1" role="group" aria-label="Emoji options">
            {EMOJI_OPTIONS.map((emoji) => {
              const existing = reactions.find((r) => r.emoji === emoji);
              return (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToggle(emoji)}
                  disabled={loading}
                  aria-label={`React with ${emoji}`}
                  aria-pressed={existing?.hasReacted}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    existing?.hasReacted
                      ? "bg-primary/20 ring-1 ring-primary/40"
                      : "hover:bg-secondary/80"
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
});

EmojiReactions.displayName = "EmojiReactions";
