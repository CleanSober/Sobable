import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { Users, Circle, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayName, getInitials, getAvatarColor } from "@/lib/anonymousNames";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface OnlineUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

interface OnlineUsersProps {
  roomId?: string;
}

export const OnlineUsers = memo(({ roomId }: OnlineUsersProps) => {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!user || !roomId) return;

    const channelName = `presence-${roomId}`;
    
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        
        Object.entries(state).forEach(([, presences]) => {
          const presence = (presences as any[])[0];
          if (presence) {
            users.push({
              id: presence.user_id,
              displayName: presence.display_name || "Anonymous",
              avatarUrl: presence.avatar_url,
            });
          }
        });
        
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track this user's presence
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", user.id)
            .maybeSingle();

          await channel.track({
            user_id: user.id,
            display_name: profile?.display_name || "Anonymous",
            avatar_url: profile?.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomId]);

  const displayedUsers = onlineUsers.slice(0, 5);
  const remainingCount = onlineUsers.length - 5;

  // Free users see a crown icon instead of online users
  if (!isPremium) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Sober Club</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Join Sober Club to see who's online</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Online indicator */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 animate-pulse" />
        <span className="font-medium">{onlineUsers.length}</span>
        <span className="hidden sm:inline">online</span>
      </div>

      {/* Avatar stack */}
      {displayedUsers.length > 0 && (
        <div className="flex -space-x-2">
          {displayedUsers.map((onlineUser, index) => (
            <Tooltip key={onlineUser.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <Avatar className="w-7 h-7 border-2 border-background ring-1 ring-green-500/30">
                    <AvatarImage src={onlineUser.avatarUrl} alt={onlineUser.displayName} />
                    <AvatarFallback className={`text-xs text-white ${getAvatarColor(onlineUser.id)}`}>
                      {getInitials(onlineUser.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{onlineUser.displayName}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">+{remainingCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{remainingCount} more online</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
});

OnlineUsers.displayName = "OnlineUsers";