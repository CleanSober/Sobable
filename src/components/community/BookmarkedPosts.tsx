import { useState, useEffect, useCallback } from "react";
import { Bookmark, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfiles, ForumPost } from "@/hooks/useCommunity";
import { PostCard } from "./PostCard";

export const BookmarkedPosts = () => {
  const { user } = useAuth();
  const { fetchProfiles, getDisplayNameForUser } = useUserProfiles();
  const [posts, setPosts] = useState<(ForumPost & { is_pinned?: boolean; tags?: string[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarkedPosts = useCallback(async () => {
    if (!user) return;
    setError(null);
    setLoading(true);

    try {
      // Get bookmark post IDs
      const { data: bookmarks, error: bErr } = await supabase
        .from("post_bookmarks")
        .select("post_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bErr) throw bErr;
      if (!bookmarks || bookmarks.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const postIds = bookmarks.map((b) => b.post_id);

      const { data: postData, error: pErr } = await supabase
        .from("forum_posts")
        .select("id, title, content, likes, reply_count, created_at, user_id, forum_id, is_pinned, tags")
        .in("id", postIds);

      if (pErr) throw pErr;

      if (postData) {
        // Preserve bookmark order
        const postMap = new Map(postData.map((p) => [p.id, p]));
        const ordered = postIds
          .map((id) => postMap.get(id))
          .filter(Boolean) as typeof postData;

        setPosts(ordered);
        const userIds = [...new Set(ordered.map((p) => p.user_id))];
        if (userIds.length > 0) await fetchProfiles(userIds);
      }
    } catch {
      setError("Failed to load bookmarked posts");
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfiles]);

  useEffect(() => {
    fetchBookmarkedPosts();
  }, [fetchBookmarkedPosts]);

  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading bookmarks">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-secondary/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchBookmarkedPosts} className="mt-3">
          Try again
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <Bookmark className="w-7 h-7 text-primary/60" />
        </div>
        <p className="font-medium text-sm text-foreground">No saved posts yet</p>
        <p className="text-xs mt-1 max-w-[220px] mx-auto">
          Tap the bookmark icon on any forum post to save it here for quick access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] text-muted-foreground">{posts.length} saved post{posts.length !== 1 ? "s" : ""}</p>
      <section className="space-y-3" aria-label="Bookmarked posts">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content}
            replyCount={post.reply_count}
            createdAt={post.created_at}
            displayName={getDisplayNameForUser(post.user_id)}
            userId={post.user_id}
            isOwn={user?.id === post.user_id}
            index={index}
            isPinned={post.is_pinned}
            tags={post.tags || []}
            onPostUpdated={fetchBookmarkedPosts}
            onPostDeleted={fetchBookmarkedPosts}
          />
        ))}
      </section>
    </div>
  );
};
