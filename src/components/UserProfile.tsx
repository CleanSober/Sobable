import { Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useGamification } from "@/hooks/useGamification";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const { user, isGuest } = useAuth();
  const { profile } = useUserData();
  const { userXP } = useGamification();
  const navigate = useNavigate();

  // Guest mode: read from localStorage
  const guestProfile = isGuest && !user ? (() => {
    try {
      return JSON.parse(localStorage.getItem("sober_club_guest_profile") || "null");
    } catch { return null; }
  })() : null;

  const effectiveProfile = user ? profile : guestProfile;
  const displayName = effectiveProfile?.display_name || "Guest";
  const initials = effectiveProfile?.display_name
    ? effectiveProfile.display_name.slice(0, 2).toUpperCase()
    : isGuest ? "GU" : user?.email?.slice(0, 2).toUpperCase() || "ME";
  const avatarUrl = effectiveProfile?.avatar_url || null;
  const currentLevel = userXP?.current_level || 1;

  return (
    <button
      onClick={() => {
        if (isGuest && !user) {
          navigate("/auth");
        } else {
          navigate("/profile");
        }
      }}
      className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors border border-border/50"
      aria-label={isGuest && !user ? "Sign up for an account" : "User profile"}
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
          {isGuest && !user ? "Tap to sign up" : <><Zap className="w-2.5 h-2.5" /> Lvl {currentLevel}</>}
        </span>
      </div>
    </button>
  );
};