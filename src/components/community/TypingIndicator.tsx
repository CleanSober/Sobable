import { memo } from "react";
import { motion } from "framer-motion";
import { TypingUser } from "@/hooks/useCommunity";

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export const TypingIndicator = memo(({ typingUsers }: TypingIndicatorProps) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].displayName} is typing`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing`;
    }
    return `${typingUsers[0].displayName} and ${typingUsers.length - 1} others are typing`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground"
    >
      <div className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/60"
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span>{getTypingText()}</span>
    </motion.div>
  );
});

TypingIndicator.displayName = "TypingIndicator";
