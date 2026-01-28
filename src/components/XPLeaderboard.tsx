import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Eye, EyeOff, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getLevelTitle } from "@/hooks/useGamification";
import { toast } from "sonner";

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  current_level: number;
  display_name: string | null;
  show_on_leaderboard: boolean;
}

export const XPLeaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
    if (user) fetchUserPreference();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const { data: xpData, error: xpError } = await supabase
        .from("user_xp")
        .select("user_id, total_xp, current_level, show_on_leaderboard")
        .eq("show_on_leaderboard", true)
        .order("total_xp", { ascending: false })
        .limit(50);

      if (xpError) throw xpError;

      const userIds = xpData?.map(e => e.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      const enrichedEntries = xpData?.map(entry => ({
        ...entry,
        display_name: profileMap.get(entry.user_id) || null,
      })) || [];

      setEntries(enrichedEntries);

      if (user) {
        const { data: allXP } = await supabase
          .from("user_xp")
          .select("user_id, total_xp")
          .order("total_xp", { ascending: false });

        const rank = allXP?.findIndex(e => e.user_id === user.id);
        if (rank !== undefined && rank !== -1) {
          setUserRank(rank + 1);
        }
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreference = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_xp")
      .select("show_on_leaderboard")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setShowOnLeaderboard(data.show_on_leaderboard);
    }
  };

  const toggleLeaderboardVisibility = async () => {
    if (!user) return;
    const newValue = !showOnLeaderboard;

    const { error } = await supabase
      .from("user_xp")
      .update({ show_on_leaderboard: newValue })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update preference");
      return;
    }

    setShowOnLeaderboard(newValue);
    toast.success(newValue ? "You're now visible on the leaderboard!" : "You're now hidden from the leaderboard");
    fetchLeaderboard();
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
        <Crown className="h-4 w-4 text-white" />
      </div>
    );
    if (rank === 2) return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
        <Medal className="h-4 w-4 text-white" />
      </div>
    );
    if (rank === 3) return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg">
        <Medal className="h-4 w-4 text-white" />
      </div>
    );
    return (
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
        <span className="text-sm font-bold text-muted-foreground">{rank}</span>
      </div>
    );
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0";
    if (level >= 7) return "bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0";
    if (level >= 4) return "bg-gradient-to-r from-primary to-emerald-500 text-white border-0";
    return "bg-secondary/50 text-foreground";
  };

  const getAnonymousName = (index: number) => {
    const adjectives = ["Brave", "Strong", "Wise", "Kind", "Noble", "Swift", "Calm", "Bold"];
    const nouns = ["Warrior", "Phoenix", "Guardian", "Seeker", "Champion", "Hero", "Spirit", "Star"];
    return `${adjectives[index % adjectives.length]} ${nouns[Math.floor(index / adjectives.length) % nouns.length]}`;
  };

  if (loading) {
    return (
      <div className="card-enhanced p-6">
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Trophy className="h-6 w-6 text-accent" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-enhanced overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/25 icon-glow">
              <Trophy className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">XP Leaderboard</h3>
              {userRank && (
                <p className="text-xs text-muted-foreground">
                  Your rank: <span className="font-bold text-primary">#{userRank}</span>
                </p>
              )}
            </div>
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLeaderboardVisibility}
              className="text-xs h-8 px-3 hover:bg-secondary/50"
            >
              {showOnLeaderboard ? (
                <>
                  <Eye className="mr-1.5 h-3.5 w-3.5 text-primary" /> Visible
                </>
              ) : (
                <>
                  <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Hidden
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Leaderboard entries */}
      <div className="px-5 pb-5 space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-8 glass-card rounded-xl">
            <Star className="h-8 w-8 text-accent/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Be the first on the leaderboard!</p>
          </div>
        ) : (
          entries.slice(0, 10).map((entry, index) => {
            const isCurrentUser = user?.id === entry.user_id;
            const displayName = entry.display_name || getAnonymousName(index);

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isCurrentUser 
                    ? "bg-primary/10 border border-primary/30" 
                    : "bg-secondary/20 hover:bg-secondary/40 border border-transparent"
                }`}
              >
                {getRankBadge(index + 1)}

                <Avatar className="h-10 w-10 border-2 border-border/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-semibold">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-foreground">
                    {displayName}
                    {isCurrentUser && <span className="text-primary ml-1.5 text-xs">(You)</span>}
                  </p>
                  <Badge className={`text-xs px-2 py-0.5 ${getLevelColor(entry.current_level)}`}>
                    Lv.{entry.current_level} {getLevelTitle(entry.current_level)}
                  </Badge>
                </div>

                <div className="text-right">
                  <p className="font-bold text-sm flex items-center gap-1 justify-end text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    {entry.total_xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
