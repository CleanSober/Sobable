import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ========================================
// BOOKMARKS
// ========================================

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarkedPostIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("post_bookmarks")
        .select("post_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setBookmarkedPostIds(new Set(data?.map((b) => b.post_id) || []));
    } catch {
      // User may not be premium
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const toggleBookmark = async (postId: string) => {
    if (!user) return false;

    const isBookmarked = bookmarkedPostIds.has(postId);

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from("post_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);
        if (error) throw error;
        toast.success("Bookmark removed");
      } else {
        const { error } = await supabase
          .from("post_bookmarks")
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
        toast.success("Post bookmarked");
      }
      await fetchBookmarks();
      return true;
    } catch {
      toast.error("Failed to update bookmark");
      return false;
    }
  };

  return { bookmarkedPostIds, loading, toggleBookmark, isBookmarked: (id: string) => bookmarkedPostIds.has(id) };
};

// ========================================
// POLLS
// ========================================

export interface Poll {
  id: string;
  post_id: string;
  question: string;
  options: string[];
  ends_at: string | null;
  allows_multiple: boolean;
  created_at: string;
}

export interface PollVote {
  poll_id: string;
  user_id: string;
  option_index: number;
}

export const usePolls = (postId?: string) => {
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [userVotes, setUserVotes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPoll = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      const { data: pollData } = await supabase
        .from("polls")
        .select("*")
        .eq("post_id", postId)
        .single();

      if (pollData) {
        setPoll({
          ...pollData,
          options: pollData.options as string[]
        });

        // Fetch aggregate vote counts via RPC (no user_id exposure)
        const { data: countsData } = await supabase
          .rpc("get_poll_vote_counts", { p_poll_id: pollData.id });

        const counts: Record<number, number> = {};
        if (Array.isArray(countsData)) {
          for (const item of countsData as { option_index: number; count: number }[]) {
            counts[item.option_index] = item.count;
          }
        }
        setVoteCounts(counts);

        // Fetch only the current user's own votes
        if (user) {
          const { data: myVotes } = await supabase
            .from("poll_votes")
            .select("option_index")
            .eq("poll_id", pollData.id)
            .eq("user_id", user.id);

          setUserVotes(myVotes?.map((v) => v.option_index) || []);
        }
      }
    } catch {
      // No poll for this post
    } finally {
      setLoading(false);
    }
  }, [postId, user?.id]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  const vote = async (optionIndex: number) => {
    if (!user || !poll) return false;

    const hasVoted = userVotes.includes(optionIndex);

    try {
      if (hasVoted) {
        const { error } = await supabase
          .from("poll_votes")
          .delete()
          .eq("poll_id", poll.id)
          .eq("user_id", user.id)
          .eq("option_index", optionIndex);
        if (error) throw error;
      } else {
        if (!poll.allows_multiple && userVotes.length > 0) {
          await supabase
            .from("poll_votes")
            .delete()
            .eq("poll_id", poll.id)
            .eq("user_id", user.id);
        }
        const { error } = await supabase
          .from("poll_votes")
          .insert({ poll_id: poll.id, user_id: user.id, option_index: optionIndex });
        if (error) throw error;
      }
      await fetchPoll();
      return true;
    } catch {
      toast.error("Failed to vote");
      return false;
    }
  };

  const getVoteCount = (optionIndex: number) => voteCounts[optionIndex] || 0;

  const getTotalVotes = () =>
    Object.values(voteCounts).reduce((sum, c) => sum + c, 0);

  return { poll, votes: [], userVotes, loading, vote, getVoteCount, getTotalVotes };
};

// ========================================
// USER FOLLOWING
// ========================================

export const useUserFollows = () => {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFollows = useCallback(async () => {
    if (!user) {
      setFollowingIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data: following } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const { count: followers } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id);

      setFollowingIds(new Set(following?.map((f) => f.following_id) || []));
      setFollowersCount(followers || 0);
      setFollowingCount(following?.length || 0);
    } catch {
      // User may not be premium
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFollows();
  }, [fetchFollows]);

  const toggleFollow = async (userId: string) => {
    if (!user || userId === user.id) return false;

    const isFollowing = followingIds.has(userId);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        if (error) throw error;
        toast.success("Unfollowed");
      } else {
        const { error } = await supabase
          .from("user_follows")
          .insert({ follower_id: user.id, following_id: userId });
        if (error) throw error;
        toast.success("Following");
      }
      await fetchFollows();
      return true;
    } catch {
      toast.error("Failed to update follow");
      return false;
    }
  };

  return { 
    followingIds, 
    followersCount, 
    followingCount, 
    loading, 
    toggleFollow, 
    isFollowing: (id: string) => followingIds.has(id) 
  };
};

// ========================================
// KARMA & BADGES
// ========================================

export interface UserKarma {
  user_id: string;
  total_karma: number;
  posts_count: number;
  replies_count: number;
  reactions_received: number;
  helpful_votes: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  earned_at: string;
}

export const BADGE_DEFINITIONS = {
  first_post: { name: "First Steps", description: "Posted your first message", icon: "✍️" },
  ten_posts: { name: "Contributor", description: "Made 10 posts", icon: "📝" },
  fifty_posts: { name: "Prolific Writer", description: "Made 50 posts", icon: "🖊️" },
  first_reply: { name: "Helpful Hand", description: "Replied to someone", icon: "🤝" },
  ten_replies: { name: "Supporter", description: "Made 10 replies", icon: "💬" },
  fifty_replies: { name: "Community Pillar", description: "Made 50 replies", icon: "🏛️" },
  karma_100: { name: "Rising Star", description: "Earned 100 karma", icon: "⭐" },
  karma_500: { name: "Influential", description: "Earned 500 karma", icon: "🌟" },
  karma_1000: { name: "Legend", description: "Earned 1000 karma", icon: "👑" },
  week_streak: { name: "Consistent", description: "Active for 7 days straight", icon: "🔥" },
  month_member: { name: "Veteran", description: "Member for 30 days", icon: "🎖️" },
};

export const useKarma = (userId?: string) => {
  const { user } = useAuth();
  const [karma, setKarma] = useState<UserKarma | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchKarma = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      const { data: karmaData } = await supabase
        .from("user_karma")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      const { data: badgesData } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", targetUserId)
        .order("earned_at", { ascending: false });

      if (karmaData) setKarma(karmaData);
      if (badgesData) setBadges(badgesData);
    } catch {
      // No karma record yet
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchKarma();
  }, [fetchKarma]);

  const initializeKarma = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc("initialize_user_karma", {
        p_user_id: user.id,
      });
      
      if (error) throw error;
      await fetchKarma();
    } catch {
      // Ignore
    }
  };

  const addKarma = async (points: number, type: "post" | "reply" | "reaction" | "helpful") => {
    if (!user || !karma) return;

    try {
      const { error } = await supabase.rpc("add_user_karma", {
        p_user_id: user.id,
        p_points: Math.min(points, 10),
        p_type: type,
      });

      if (error) throw error;
      await fetchKarma();
      await checkBadges();
    } catch {
      // Ignore
    }
  };

  const checkBadges = async () => {
    if (!user || !karma) return;

    const badgeTypes = badges.map((b) => b.badge_type);
    const newBadges: { badge_type: string; badge_name: string; badge_description: string }[] = [];

    const mapBadge = (type: keyof typeof BADGE_DEFINITIONS) => ({
      badge_type: type,
      badge_name: BADGE_DEFINITIONS[type].name,
      badge_description: BADGE_DEFINITIONS[type].description,
    });

    // Check post milestones
    if (karma.posts_count >= 1 && !badgeTypes.includes("first_post")) {
      newBadges.push(mapBadge("first_post"));
    }
    if (karma.posts_count >= 10 && !badgeTypes.includes("ten_posts")) {
      newBadges.push(mapBadge("ten_posts"));
    }
    if (karma.posts_count >= 50 && !badgeTypes.includes("fifty_posts")) {
      newBadges.push(mapBadge("fifty_posts"));
    }

    // Check reply milestones
    if (karma.replies_count >= 1 && !badgeTypes.includes("first_reply")) {
      newBadges.push(mapBadge("first_reply"));
    }
    if (karma.replies_count >= 10 && !badgeTypes.includes("ten_replies")) {
      newBadges.push(mapBadge("ten_replies"));
    }
    if (karma.replies_count >= 50 && !badgeTypes.includes("fifty_replies")) {
      newBadges.push(mapBadge("fifty_replies"));
    }

    // Check karma milestones
    if (karma.total_karma >= 100 && !badgeTypes.includes("karma_100")) {
      newBadges.push(mapBadge("karma_100"));
    }
    if (karma.total_karma >= 500 && !badgeTypes.includes("karma_500")) {
      newBadges.push(mapBadge("karma_500"));
    }
    if (karma.total_karma >= 1000 && !badgeTypes.includes("karma_1000")) {
      newBadges.push(mapBadge("karma_1000"));
    }

    // Award new badges via secure RPC
    for (const badge of newBadges) {
      try {
        await supabase.rpc("award_badge", {
          p_user_id: user.id,
          p_badge_type: badge.badge_type,
          p_badge_name: badge.badge_name,
          p_badge_description: badge.badge_description,
        });
        toast.success(`🏆 Badge earned: ${badge.badge_name}!`);
      } catch {
        // Badge already exists or invalid type
      }
    }

    if (newBadges.length > 0) {
      await fetchKarma();
    }
  };

  return { karma, badges, loading, initializeKarma, addKarma, checkBadges };
};

// ========================================
// THREAD SUBSCRIPTIONS
// ========================================

export const useThreadSubscriptions = () => {
  const { user } = useAuth();
  const [subscribedPostIds, setSubscribedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscribedPostIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("thread_subscriptions")
        .select("post_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setSubscribedPostIds(new Set(data?.map((s) => s.post_id) || []));
    } catch {
      // User may not be premium
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const toggleSubscription = async (postId: string) => {
    if (!user) return false;

    const isSubscribed = subscribedPostIds.has(postId);

    try {
      if (isSubscribed) {
        const { error } = await supabase
          .from("thread_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);
        if (error) throw error;
        toast.success("Unsubscribed from thread");
      } else {
        const { error } = await supabase
          .from("thread_subscriptions")
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
        toast.success("Subscribed to thread");
      }
      await fetchSubscriptions();
      return true;
    } catch {
      toast.error("Failed to update subscription");
      return false;
    }
  };

  return { 
    subscribedPostIds, 
    loading, 
    toggleSubscription, 
    isSubscribed: (id: string) => subscribedPostIds.has(id) 
  };
};

// ========================================
// LEADERBOARD
// ========================================

export const useLeaderboard = (limit = 10) => {
  const [leaders, setLeaders] = useState<(UserKarma & { display_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from("user_karma")
          .select("*")
          .order("total_karma", { ascending: false })
          .limit(limit);

        if (error) throw error;
        setLeaders(data || []);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  return { leaders, loading };
};
