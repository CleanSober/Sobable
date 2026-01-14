import { memo } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials, getAvatarColor } from "@/lib/anonymousNames";
import { EmojiReactions } from "./EmojiReactions";
import { formatTimeAgo } from "@/hooks/useCommunity";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  replyCount: number;
  createdAt: string;
  displayName: string;
  userId: string;
  isOwn: boolean;
  index: number;
}

export const PostCard = memo(({ 
  id, 
  title, 
  content, 
  replyCount, 
  createdAt, 
  displayName, 
  userId, 
  isOwn,
  index 
}: PostCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="gradient-card border-border/50 hover:border-border/70 transition-colors">
        <CardContent className="p-4">
          {/* Author header */}
          <header className="flex items-center gap-3 mb-3">
            <div 
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm ${getAvatarColor(userId)}`}
              aria-hidden="true"
            >
              {getInitials(displayName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {isOwn ? "You" : displayName}
              </p>
              <time className="text-xs text-muted-foreground" dateTime={createdAt}>
                {formatTimeAgo(createdAt)}
              </time>
            </div>
          </header>
          
          {/* Post content */}
          <h3 className="font-semibold text-foreground mb-1.5 leading-snug">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{content}</p>
          
          {/* Footer with reactions and reply count */}
          <footer className="flex items-center justify-between pt-2 border-t border-border/30">
            <EmojiReactions targetId={id} targetType="forum_post" />
            <span 
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
              aria-label={`${replyCount} replies`}
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              {replyCount}
            </span>
          </footer>
        </CardContent>
      </Card>
    </motion.article>
  );
});

PostCard.displayName = "PostCard";
