import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaderboard } from "@/hooks/useForumFeatures";
import { useUserProfiles } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials, getAvatarColor } from "@/lib/anonymousNames";
import { useEffect } from "react";

export const Leaderboard = () => {
  const { user } = useAuth();
  const { leaders, loading } = useLeaderboard(10);
  const { fetchProfiles, getDisplayNameForUser } = useUserProfiles();

  useEffect(() => {
    if (leaders.length > 0) {
      fetchProfiles(leaders.map((l) => l.user_id));
    }
  }, [leaders, fetchProfiles]);

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-secondary/30 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leaders.length === 0) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No leaders yet. Be the first to earn karma!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-xs font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  const userRank = user ? leaders.findIndex((l) => l.user_id === user.id) : -1;

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 px-3 pb-3">
        {/* Your rank summary */}
        {user && userRank >= 0 && (
          <div className="mb-2 p-2 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-[10px] text-muted-foreground">Your rank</p>
            <p className="text-sm font-bold text-primary">#{userRank + 1} of {leaders.length}</p>
          </div>
        )}
        {user && userRank === -1 && (
          <div className="mb-2 p-2 rounded-lg bg-secondary/40 text-center">
            <p className="text-[10px] text-muted-foreground">Start posting to appear on the leaderboard!</p>
          </div>
        )}

        {leaders.map((leader, index) => {
          const displayName = getDisplayNameForUser(leader.user_id);
          const rank = index + 1;
          const isCurrentUser = user?.id === leader.user_id;

          return (
            <motion.div
              key={leader.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                isCurrentUser
                  ? "bg-primary/10 border border-primary/20 ring-1 ring-primary/10"
                  : "bg-secondary/20 hover:bg-secondary/40"
              }`}
            >
              <div className="w-5 flex justify-center">
                {getRankIcon(rank)}
              </div>
              
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium ${getAvatarColor(leader.user_id)}`}
              >
                {getInitials(displayName)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {isCurrentUser ? "You" : displayName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {leader.posts_count}p · {leader.replies_count}r
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs font-semibold text-primary">{leader.total_karma}</p>
                <p className="text-[9px] text-muted-foreground">karma</p>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};
