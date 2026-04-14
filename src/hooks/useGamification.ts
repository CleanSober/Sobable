import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserXP {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  daily_login_streak: number;
  last_login_reward_date: string | null;
  last_login_date: string | null;
}

export interface XPHistoryEntry {
  id: string;
  xp_amount: number;
  source: string;
  description: string | null;
  created_at: string;
}

// XP rewards configuration
export const XP_REWARDS = {
  daily_login: 25,
  check_in: 15,
  mood_log: 10,
  journal: 20,
  meditation: 15,
  trigger_log: 10,
  community_post: 25,
  community_reply: 10,
  streak_bonus_per_day: 5,
  seven_day_bonus: 100,
  achievement: 50,
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Newcomer" },
  { level: 2, xp: 100, title: "Beginner" },
  { level: 3, xp: 250, title: "Dedicated" },
  { level: 4, xp: 450, title: "Committed" },
  { level: 5, xp: 700, title: "Focused" },
  { level: 6, xp: 1000, title: "Resilient" },
  { level: 7, xp: 1400, title: "Steadfast" },
  { level: 8, xp: 1900, title: "Warrior" },
  { level: 9, xp: 2500, title: "Champion" },
  { level: 10, xp: 3200, title: "Master" },
  { level: 11, xp: 4000, title: "Legend" },
];

export const getLevelTitle = (level: number): string => {
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  if (threshold) return threshold.title;
  return level > 10 ? "Legend" : "Newcomer";
};

export const getXPForLevel = (level: number): number => {
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  if (threshold) return threshold.xp;
  if (level > 10) return 4000 + (level - 10) * 1000;
  return 0;
};

export const getXPForNextLevel = (level: number): number => {
  return getXPForLevel(level + 1);
};

export const useGamification = () => {
  const { user } = useAuth();
  const [userXP, setUserXP] = useState<UserXP | null>(null);
  const [xpHistory, setXpHistory] = useState<XPHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchUserXP = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserXP(data);
      } else {
        // Create initial XP record via secure RPC
        const { data: initResult, error: initError } = await supabase.rpc("initialize_user_xp", {
          p_user_id: user.id,
        });

        if (initError) throw initError;

        // Re-fetch the record after initialization
        const { data: newData } = await supabase
          .from("user_xp")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (newData) setUserXP(newData);
      }
    } catch (error) {
      console.error("Error fetching user XP:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchXPHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("xp_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setXpHistory(data || []);
    } catch (error) {
      console.error("Error fetching XP history:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchUserXP();
    fetchXPHistory();
  }, [fetchUserXP, fetchXPHistory]);

  const claimDailyReward = useCallback(async () => {
    if (!user || claiming) return null;

    setClaiming(true);
    try {
      const { data, error } = await supabase.rpc("claim_daily_login_reward", {
        p_user_id: user.id,
      });

      if (error) throw error;

      const result = data as {
        success: boolean;
        error?: string;
        total_reward?: number;
        new_streak?: number;
        leveled_up?: boolean;
        new_level?: number;
        total_xp?: number;
      };

      if (result.success) {
        toast.success(`+${result.total_reward} XP earned!`, {
          description: result.leveled_up
            ? `🎉 Level up! You're now level ${result.new_level}!`
            : `Day ${result.new_streak} streak bonus!`,
        });
        fetchUserXP();
        fetchXPHistory();
        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      toast.error("Failed to claim reward");
      return null;
    } finally {
      setClaiming(false);
    }
  }, [user, claiming, fetchUserXP, fetchXPHistory]);

  const addXP = useCallback(
    async (
      amount: number,
      source: string,
      description?: string
    ): Promise<{ leveled_up: boolean; new_level: number } | null> => {
      if (!user) return null;

      try {
        const { data, error } = await supabase.rpc("add_user_xp", {
          p_user_id: user.id,
          p_xp_amount: amount,
          p_source: source,
          p_description: description || null,
        });

        if (error) throw error;

        const result = data as {
          success: boolean;
          leveled_up: boolean;
          new_level: number;
          total_xp: number;
        };

        if (result.success) {
          if (result.leveled_up) {
            toast.success(`🎉 Level Up!`, {
              description: `You reached level ${result.new_level}!`,
            });
          }
          fetchUserXP();
          fetchXPHistory();
          return { leveled_up: result.leveled_up, new_level: result.new_level };
        }
        return null;
      } catch (error) {
        console.error("Error adding XP:", error);
        return null;
      }
    },
    [user, fetchUserXP, fetchXPHistory]
  );

  const canClaimDailyReward = userXP
    ? userXP.last_login_reward_date !== new Date().toISOString().split("T")[0]
    : true;

  const xpProgress = userXP
    ? {
        current: userXP.total_xp,
        currentLevelXP: getXPForLevel(userXP.current_level),
        nextLevelXP: getXPForNextLevel(userXP.current_level),
        progressInLevel:
          userXP.total_xp - getXPForLevel(userXP.current_level),
        xpNeededForLevel:
          getXPForNextLevel(userXP.current_level) -
          getXPForLevel(userXP.current_level),
        percentage: Math.min(
          100,
          ((userXP.total_xp - getXPForLevel(userXP.current_level)) /
            (getXPForNextLevel(userXP.current_level) -
              getXPForLevel(userXP.current_level))) *
            100
        ),
      }
    : null;

  return {
    userXP,
    xpHistory,
    xpProgress,
    loading,
    claiming,
    claimDailyReward,
    addXP,
    canClaimDailyReward,
    refetch: fetchUserXP,
  };
};
