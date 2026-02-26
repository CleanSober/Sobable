import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useGamification } from "@/hooks/useGamification";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const { user } = useAuth();
  const { profile } = useUserData();
  const { userXP } = useGamification();
  const navigate = useNavigate();

  const displayName = profile?.display_name || "Friend";
  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "ME";
  const avatarUrl = (profile as any)?.avatar_url || null;
  const currentLevel = userXP?.current_level || 1;

  return (
    <button
      onClick={() => navigate("/profile")}
      className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors border border-border/50"
      aria-label="User profile"
    >
      <div className="relative">
        <Avatar className="w-8 h-8 border-2 border-primary/30">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-background">
          {currentLevel}
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-start">
        <span className="text-sm font-medium text-foreground truncate max-w-[80px]">
          {displayName}
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
          <Zap className="w-2.5 h-2.5" />
          Lvl {currentLevel}
        </span>
      </div>
    </button>
  );
};
