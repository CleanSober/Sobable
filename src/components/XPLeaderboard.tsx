import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Eye, EyeOff, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      // Get top users who opted into leaderboard
      const { data: xpData, error: xpError } = await supabase
        .from("user_xp")
        .select("user_id, total_xp, current_level, show_on_leaderboard")
        .eq("show_on_leaderboard", true)
        .order("total_xp", { ascending: false })
        .limit(50);

      if (xpError) throw xpError;

      // Get display names for these users
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

      // Find user's rank
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center text-sm font-medium text-muted-foreground">{rank}</span>;
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return "bg-gradient-to-r from-yellow-400 to-amber-500 text-primary-foreground";
    if (level >= 7) return "bg-gradient-to-r from-purple-500 to-pink-500 text-primary-foreground";
    if (level >= 4) return "bg-gradient-to-r from-blue-500 to-cyan-500 text-primary-foreground";
    return "bg-muted";
  };

  const getAnonymousName = (index: number) => {
    const adjectives = ["Brave", "Strong", "Wise", "Kind", "Noble", "Swift", "Calm", "Bold"];
    const nouns = ["Warrior", "Phoenix", "Guardian", "Seeker", "Champion", "Hero", "Spirit", "Star"];
    return `${adjectives[index % adjectives.length]} ${nouns[Math.floor(index / adjectives.length) % nouns.length]}`;
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Trophy className="h-6 w-6 text-primary" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            XP Leaderboard
          </CardTitle>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLeaderboardVisibility}
              className="text-xs"
            >
              {showOnLeaderboard ? (
                <>
                  <Eye className="mr-1 h-3 w-3" /> Visible
                </>
              ) : (
                <>
                  <EyeOff className="mr-1 h-3 w-3" /> Hidden
                </>
              )}
            </Button>
          )}
        </div>
        {userRank && (
          <p className="text-sm text-muted-foreground">
            Your rank: <span className="font-semibold text-primary">#{userRank}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            Be the first on the leaderboard!
          </p>
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
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  isCurrentUser ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                }`}
              >
                <div className="w-6 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>

                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-xs">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {displayName}
                    {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getLevelColor(entry.current_level)}`}
                  >
                    Lv.{entry.current_level} {getLevelTitle(entry.current_level)}
                  </Badge>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    {entry.total_xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
