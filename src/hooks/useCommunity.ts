import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

export interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  from_user_id: string;
  notification_type: "mention" | "reply" | "reaction";
  target_type: "forum_post" | "forum_reply" | "chat_message";
  target_id: string;
  content_preview: string | null;
  is_read: boolean;
  created_at: string;
}

export interface TypingUser {
  id: string;
  displayName: string;
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

  const getAllProfiles = useCallback(() => {
    return Array.from(profiles.values());
  }, [profiles]);

  return { profiles, fetchProfiles, getDisplayNameForUser, getAllProfiles };
};

// Custom hook for reactions with realtime updates
export const useReactions = (targetId: string, targetType: "forum_post" | "chat_message" | "forum_reply") => {
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

// Custom hook for typing indicators
export const useTypingIndicator = (roomId: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user || !roomId) return;

    const channel = supabase.channel(`typing-${roomId}`, {
      config: {
        presence: { key: user.id },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.entries(state).forEach(([userId, presences]) => {
          if (userId !== user.id && Array.isArray(presences)) {
            const presence = presences[0] as { isTyping?: boolean; displayName?: string };
            if (presence?.isTyping) {
              users.push({ id: userId, displayName: presence.displayName || "Someone" });
            }
          }
        });
        
        setTypingUsers(users);
      })
      .subscribe();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [roomId, user?.id]);

  const startTyping = useCallback(async (displayName: string) => {
    if (!channelRef.current || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Track typing status
    await channelRef.current.track({ isTyping: true, displayName });

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(async () => {
      await channelRef.current?.track({ isTyping: false, displayName });
    }, 3000);
  }, [user]);

  const stopTyping = useCallback(async (displayName: string) => {
    if (!channelRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await channelRef.current.track({ isTyping: false, displayName });
  }, []);

  return { typingUsers, startTyping, stopTyping };
};

// Custom hook for notifications
export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [user?.id]);

  return { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead };
};

// Utility to extract mentions from text
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map((m) => m.slice(1)) : [];
};

// Utility to create notifications for mentions
export const createMentionNotifications = async (
  text: string,
  fromUserId: string,
  targetType: "forum_post" | "forum_reply" | "chat_message",
  targetId: string,
  profiles: UserProfile[]
) => {
  const mentionedNames = extractMentions(text);
  if (mentionedNames.length === 0) return;

  // Find matching user IDs
  const mentionedUsers = profiles.filter((p) => {
    const displayName = getDisplayName(p.display_name, p.user_id);
    return mentionedNames.some(
      (name) => displayName.toLowerCase() === name.toLowerCase()
    );
  });

  // Create notifications for each mentioned user (except self)
  const notifications = mentionedUsers
    .filter((u) => u.user_id !== fromUserId)
    .map((u) => ({
      user_id: u.user_id,
      from_user_id: fromUserId,
      notification_type: "mention" as const,
      target_type: targetType,
      target_id: targetId,
      content_preview: text.slice(0, 100),
    }));

  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }
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
