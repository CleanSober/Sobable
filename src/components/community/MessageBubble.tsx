import { memo } from "react";
import { motion } from "framer-motion";
import { getInitials, getAvatarColor } from "@/lib/anonymousNames";
import { EmojiReactions } from "./EmojiReactions";
import { MentionText } from "./MentionInput";
import { UserActionsMenu } from "./UserActionsMenu";
import { formatTime } from "@/hooks/useCommunity";

interface MessageBubbleProps {
  id: string;
  message: string;
  createdAt: string;
  displayName: string;
  userId: string;
  isOwn: boolean;
}

export const MessageBubble = memo(({ 
  id, 
  message, 
  createdAt, 
  displayName, 
  userId, 
  isOwn 
}: MessageBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex gap-2 max-w-[85%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
        <div 
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm ${getAvatarColor(userId)}`}
          aria-hidden="true"
        >
          {getInitials(displayName)}
        </div>
        
        <div className="flex flex-col">
          <div className={`flex items-center gap-1 mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <p className="text-xs font-medium text-muted-foreground">
              {isOwn ? "You" : displayName}
            </p>
            {!isOwn && (
              <UserActionsMenu
                userId={userId}
                targetType="chat_message"
                targetId={id}
                compact
              />
            )}
          </div>
          
          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary/80 text-secondary-foreground rounded-bl-md border border-border/30"
            }`}
          >
            <MentionText text={message} className="text-sm leading-relaxed break-words" />
            <p className={`text-[10px] mt-1.5 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
              {formatTime(createdAt)}
            </p>
          </div>
          
          <div className={`mt-1.5 ${isOwn ? "flex justify-end" : ""}`}>
            <EmojiReactions targetId={id} targetType="chat_message" compact />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = "MessageBubble";
