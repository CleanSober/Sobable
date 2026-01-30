import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle, Circle, Sparkles, Clock, Gift, Zap, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";
import { toast } from "sonner";
import { differenceInHours, startOfDay, endOfDay } from "date-fns";

interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  type: "mood" | "journal" | "meditation" | "trigger" | "community" | "sleep";
  icon: typeof Target;
}

// Pool of daily challenges that rotate
const CHALLENGE_POOL: DailyChallenge[] = [
  { id: "log_mood", name: "Mood Check", description: "Log your mood today", xpReward: XP_REWARDS.mood_log, type: "mood", icon: Target },
  { id: "write_journal", name: "Journal Entry", description: "Write in your journal", xpReward: XP_REWARDS.journal, type: "journal", icon: Target },
  { id: "meditate", name: "Mindful Moment", description: "Complete a meditation", xpReward: XP_REWARDS.meditation, type: "meditation", icon: Target },
  { id: "log_trigger", name: "Trigger Tracker", description: "Log a trigger (or note you had none!)", xpReward: XP_REWARDS.trigger_log, type: "trigger", icon: Target },
  { id: "community_post", name: "Community Connect", description: "Post or reply in the community", xpReward: XP_REWARDS.community_post, type: "community", icon: Target },
  { id: "log_sleep", name: "Sleep Log", description: "Record your sleep quality", xpReward: 10, type: "sleep", icon: Target },
];

// Get today's challenges based on the date (deterministic rotation)
const getTodaysChallenges = (): DailyChallenge[] => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Select 3 challenges based on the day
  const shuffled = [...CHALLENGE_POOL].sort((a, b) => {
    const aHash = (a.id.charCodeAt(0) + dayOfYear) % 100;
    const bHash = (b.id.charCodeAt(0) + dayOfYear) % 100;
    return aHash - bHash;
  });
  
  return shuffled.slice(0, 3);
};

export const DailyChallenges = () => {
  const { user } = useAuth();
  const { addXP } = useGamification();
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const todaysChallenges = useMemo(() => getTodaysChallenges(), []);
  
  // Time until reset
  const hoursUntilReset = useMemo(() => {
    const now = new Date();
    const endOfToday = endOfDay(now);
    return Math.max(0, differenceInHours(endOfToday, now));
  }, []);

  useEffect(() => {
    checkCompletedChallenges();
  }, [user]);

  const checkCompletedChallenges = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const completed: string[] = [];

    // Check each challenge type
    const [moodRes, journalRes, sleepRes, triggerRes] = await Promise.all([
      supabase.from("mood_entries").select("id").eq("user_id", user.id).eq("date", today).limit(1),
      supabase.from("journal_entries").select("id").eq("user_id", user.id).gte("created_at", `${today}T00:00:00`).limit(1),
      supabase.from("sleep_entries").select("id").eq("user_id", user.id).eq("date", today).limit(1),
      supabase.from("trigger_entries").select("id").eq("user_id", user.id).eq("date", today).limit(1),
    ]);

    if (moodRes.data?.length) completed.push("log_mood");
    if (journalRes.data?.length) completed.push("write_journal");
    if (sleepRes.data?.length) completed.push("log_sleep");
    if (triggerRes.data?.length) completed.push("log_trigger");

    // Check daily goals for meditation
    const { data: goals } = await supabase
      .from("daily_goals")
      .select("meditation_done")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (goals?.meditation_done) completed.push("meditate");

    // Check community activity
    const [postsRes, repliesRes] = await Promise.all([
      supabase.from("forum_posts").select("id").eq("user_id", user.id).gte("created_at", `${today}T00:00:00`).limit(1),
      supabase.from("forum_replies").select("id").eq("user_id", user.id).gte("created_at", `${today}T00:00:00`).limit(1),
    ]);

    if (postsRes.data?.length || repliesRes.data?.length) completed.push("community_post");

    setCompletedToday(completed);
    setLoading(false);
  };

  const claimReward = async (challenge: DailyChallenge) => {
    if (!user || claiming) return;

    setClaiming(challenge.id);
    
    // Check if already claimed (stored in localStorage for today)
    const claimedKey = `claimed_${challenge.id}_${new Date().toISOString().split("T")[0]}`;
    if (localStorage.getItem(claimedKey)) {
      toast.info("Reward already claimed!");
      setClaiming(null);
      return;
    }

    const result = await addXP(challenge.xpReward, "daily_challenge", `Completed: ${challenge.name}`);
    
    if (result) {
      localStorage.setItem(claimedKey, "true");
      toast.success(`+${challenge.xpReward} XP earned!`, {
        description: challenge.name,
      });
    }
    
    setClaiming(null);
  };

  const isChallengeComplete = (challengeId: string) => completedToday.includes(challengeId);
  
  const isRewardClaimed = (challengeId: string) => {
    const claimedKey = `claimed_${challengeId}_${new Date().toISOString().split("T")[0]}`;
    return localStorage.getItem(claimedKey) === "true";
  };

  const totalXP = todaysChallenges.reduce((sum, c) => sum + c.xpReward, 0);
  const earnedXP = todaysChallenges.reduce((sum, c) => {
    if (isRewardClaimed(c.id)) return sum + c.xpReward;
    return sum;
  }, 0);

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="py-8 flex justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Daily Challenges
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {hoursUntilReset}h left
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Progress value={(earnedXP / totalXP) * 100} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground font-medium">
            {earnedXP}/{totalXP} XP
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {todaysChallenges.map((challenge, index) => {
            const isComplete = isChallengeComplete(challenge.id);
            const isClaimed = isRewardClaimed(challenge.id);

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isClaimed
                    ? "bg-primary/10 border-primary/30"
                    : isComplete
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-muted/30 border-border/50"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isClaimed ? "bg-primary/20" : isComplete ? "bg-green-500/20" : "bg-muted/50"
                }`}>
                  {isClaimed ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : isComplete ? (
                    <Gift className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${isClaimed ? "text-primary" : ""}`}>
                    {challenge.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {challenge.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {challenge.xpReward}
                  </Badge>
                  
                  {isComplete && !isClaimed && (
                    <Button
                      size="sm"
                      onClick={() => claimReward(challenge)}
                      disabled={claiming === challenge.id}
                      className="gradient-primary text-primary-foreground text-xs h-7"
                    >
                      {claiming === challenge.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        "Claim"
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {todaysChallenges.every(c => isRewardClaimed(c.id)) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <Sparkles className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-medium text-primary">All challenges complete!</p>
            <p className="text-xs text-muted-foreground">Come back tomorrow for new challenges</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
