import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayName } from "@/lib/anonymousNames";

// Types
export interface UserProfile {
  user_id: string;
  display_name: string | null;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  room_id: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  likes: number;
  reply_count: number;
  created_at: string;
  user_id: string;
  forum_id: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

// Custom hook for premium status check with caching
export const usePremiumStatus = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("plan_type, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (!error && data) {
          setIsPremium(data.plan_type === "premium" || data.plan_type === "pro");
        } else {
          setIsPremium(false);
        }
      } catch {
        setIsPremium(false);
      }
      setLoading(false);
    };

    checkPremiumStatus();
  }, [user?.id]);

  return { isPremium, loading };
};

// Custom hook for user profiles with caching
export const useUserProfiles = () => {
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map());

  const fetchProfiles = useCallback(async (userIds: string[]) => {
    const uncachedIds = userIds.filter((id) => !profiles.has(id));
    
    if (uncachedIds.length === 0) return;

    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", uncachedIds);

    if (data) {
      setProfiles((prev) => {
        const newMap = new Map(prev);
        data.forEach((p) => newMap.set(p.user_id, p));
        // Add placeholder for users without profiles
        uncachedIds.forEach((id) => {
          if (!newMap.has(id)) {
            newMap.set(id, { user_id: id, display_name: null });
          }
        });
        return newMap;
      });
    }
  }, [profiles]);

  const getDisplayNameForUser = useCallback(
    (userId: string) => {
      const profile = profiles.get(userId);
      return getDisplayName(profile?.display_name, userId);
    },
    [profiles]
  );

  return { profiles, fetchProfiles, getDisplayNameForUser };
};

// Custom hook for reactions with realtime updates
export const useReactions = (targetId: string, targetType: "forum_post" | "chat_message") => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReactions = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("reactions")
      .select("emoji, user_id")
      .eq("target_type", targetType)
      .eq("target_id", targetId);

    if (error) return;

    const emojiMap = new Map<string, { count: number; hasReacted: boolean }>();
    
    data?.forEach((reaction) => {
      const existing = emojiMap.get(reaction.emoji) || { count: 0, hasReacted: false };
      emojiMap.set(reaction.emoji, {
        count: existing.count + 1,
        hasReacted: existing.hasReacted || reaction.user_id === user.id,
      });
    });

    const reactionsList: Reaction[] = [];
    emojiMap.forEach((value, emoji) => {
      reactionsList.push({ emoji, ...value });
    });
    reactionsList.sort((a, b) => b.count - a.count);
    setReactions(reactionsList);
  }, [targetId, targetType, user?.id]);

  useEffect(() => {
    fetchReactions();

    // Subscribe to realtime reaction updates
    const channel = supabase
      .channel(`reactions-${targetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reactions",
          filter: `target_id=eq.${targetId}`,
        },
        () => fetchReactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReactions, targetId]);

  const toggleReaction = useCallback(
    async (emoji: string) => {
      if (!user || loading) return;

      setLoading(true);
      const existingReaction = reactions.find((r) => r.emoji === emoji && r.hasReacted);

      try {
        if (existingReaction) {
          await supabase
            .from("reactions")
            .delete()
            .eq("user_id", user.id)
            .eq("target_type", targetType)
            .eq("target_id", targetId)
            .eq("emoji", emoji);
        } else {
          await supabase.from("reactions").insert({
            user_id: user.id,
            target_type: targetType,
            target_id: targetId,
            emoji,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [user, loading, reactions, targetType, targetId]
  );

  return { reactions, loading, toggleReaction };
};

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

export const validateMessageLength = (message: string, maxLength = 2000): boolean => {
  return message.length >= 1 && message.length <= maxLength;
};

export const validatePostTitle = (title: string): boolean => {
  return title.length >= 1 && title.length <= 200;
};

export const validatePostContent = (content: string): boolean => {
  return content.length >= 1 && content.length <= 10000;
};

// Time formatting utility
export const formatTimeAgo = (dateStr: string): string => {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
};

export const formatTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
