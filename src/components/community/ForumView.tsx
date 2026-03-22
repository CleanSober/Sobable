import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Send, Plus, AlertCircle, TrendingUp, Clock, Pin, X, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification, XP_REWARDS } from "@/hooks/useGamification";
import { useRateLimit } from "@/hooks/useRateLimit";
import { toast } from "sonner";
import { useUserProfiles, ForumPost, validatePostTitle, validatePostContent, createMentionNotifications } from "@/hooks/useCommunity";
import { useCommunityBot } from "@/hooks/useCommunityBot";
import { PostCard } from "./PostCard";
import { Badge } from "@/components/ui/badge";

interface Forum {
  id: string;
  title: string;
  description: string | null;
  slug: string;
}

interface ForumViewProps {
  forum: Forum;
  onBack: () => void;
}

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 10000;

type PostSortOption = "newest" | "most_replied";

export const ForumView = ({ forum, onBack }: ForumViewProps) => {
  const { user } = useAuth();
  const { fetchProfiles, getDisplayNameForUser } = useUserProfiles();
  const { triggerBotReply } = useCommunityBot();
  const { checkRateLimit, recordAction } = useRateLimit("forum_post");
  const [posts, setPosts] = useState<(ForumPost & { is_pinned?: boolean; tags?: string[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<PostSortOption>("newest");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [forum.id]);

  const fetchPosts = useCallback(async () => {
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("id, title, content, likes, reply_count, created_at, user_id, forum_id, is_pinned, tags")
        .eq("forum_id", forum.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      if (data) {
        setPosts(data);
        const userIds = [...new Set(data.map((p) => p.user_id))];
        if (userIds.length > 0) {
          await fetchProfiles(userIds);
        }
      }
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [forum.id, fetchProfiles]);

  // Sort posts: pinned first, then by sort option
  const sortedPosts = useMemo(() => {
    const pinned = posts.filter(p => p.is_pinned);
    const unpinned = posts.filter(p => !p.is_pinned);
    
    const sortFn = sortBy === "most_replied" 
      ? (a: typeof posts[0], b: typeof posts[0]) => b.reply_count - a.reply_count
      : (a: typeof posts[0], b: typeof posts[0]) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    
    return [...pinned.sort(sortFn), ...unpinned.sort(sortFn)];
  }, [posts, sortBy]);

  const { addXP } = useGamification();

  const createPost = async () => {
    const trimmedTitle = newTitle.trim();
    const trimmedContent = newContent.trim();
    
    if (!trimmedTitle || !trimmedContent || !user) return;

    if (!validatePostTitle(trimmedTitle)) {
      toast.error(`Title must be between 1 and ${MAX_TITLE_LENGTH} characters`);
      return;
    }

    if (!validatePostContent(trimmedContent)) {
      toast.error(`Content must be between 1 and ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    // Rate limit check
    const allowed = await checkRateLimit(user.id);
    if (!allowed) return;

    setSubmitting(true);
    
    try {
      const { data, error } = await supabase.from("forum_posts").insert({
        forum_id: forum.id,
        user_id: user.id,
        title: trimmedTitle,
        content: trimmedContent,
        tags: newTags.length > 0 ? newTags : null,
      }).select().single();

      if (error) throw error;
      recordAction();
      
      // Trigger bot auto-reply after random delay (1-5 min)
      if (data) {
        triggerBotReply({
          content: `${trimmedTitle}\n\n${trimmedContent}`,
          targetId: data.id,
          targetType: "forum_post",
        });
      }
      
      // Award XP for forum post
      await addXP(XP_REWARDS.community_post, 'community_post', 'Started a new forum discussion');
      
      toast.success("Post created!");
      setNewTitle("");
      setNewContent("");
      setNewTags([]);
      setTagInput("");
      setShowNewPost(false);
      await fetchPosts();
    } catch {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isOwnPost = (userId: string) => userId === user?.id;
  const titleRemaining = MAX_TITLE_LENGTH - newTitle.length;
  const contentRemaining = MAX_CONTENT_LENGTH - newContent.length;

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <header className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="h-8 w-8"
          aria-label="Go back to forum list"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold truncate">{forum.title}</h2>
          {forum.description && (
            <p className="text-[10px] text-muted-foreground truncate">{forum.description}</p>
          )}
        </div>
      </header>

      {/* Sort controls */}
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant={sortBy === "newest" ? "default" : "outline"}
          onClick={() => setSortBy("newest")}
          className="shrink-0 h-7 text-[10px] px-2"
        >
          <Clock className="w-3 h-3 mr-0.5" />
          Newest
        </Button>
        <Button
          size="sm"
          variant={sortBy === "most_replied" ? "default" : "outline"}
          onClick={() => setSortBy("most_replied")}
          className="shrink-0 h-7 text-[10px] px-2"
        >
          <TrendingUp className="w-3 h-3 mr-0.5" />
          Most Replied
        </Button>
      </div>

      {/* Create post section */}
      {!showNewPost ? (
        <Button 
          onClick={() => setShowNewPost(true)} 
          className="w-full h-8 text-xs"
          aria-label="Create a new post"
        >
          <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          Create Post
        </Button>
      ) : (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-3 space-y-2">
            <div>
              <Input
                placeholder="Post title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={MAX_TITLE_LENGTH}
                aria-label="Post title"
              />
              {titleRemaining < 50 && (
                <p className={`text-xs mt-1 text-right ${titleRemaining < 10 ? "text-destructive" : "text-muted-foreground"}`}>
                  {titleRemaining} characters remaining
                </p>
              )}
            </div>
            <div>
              <Textarea
                placeholder="What's on your mind?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                maxLength={MAX_CONTENT_LENGTH}
                aria-label="Post content"
              />
              {contentRemaining < 500 && (
                <p className={`text-xs mt-1 text-right ${contentRemaining < 100 ? "text-destructive" : "text-muted-foreground"}`}>
                  {contentRemaining} characters remaining
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewPost(false);
                  setNewTitle("");
                  setNewContent("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={createPost} 
                disabled={submitting || !newTitle.trim() || !newContent.trim()}
              >
                <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                {submitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="space-y-3" aria-label="Loading posts">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchPosts} className="mt-3">
            Try again
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" aria-hidden="true" />
          <p className="font-medium">No posts yet</p>
          <p className="text-sm mt-1">Be the first to share!</p>
        </div>
      ) : (
        <section className="space-y-3" aria-label="Forum posts">
          {sortedPosts.map((post, index) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              replyCount={post.reply_count}
              createdAt={post.created_at}
              displayName={getDisplayNameForUser(post.user_id)}
              userId={post.user_id}
              isOwn={isOwnPost(post.user_id)}
              index={index}
              isPinned={post.is_pinned}
              tags={post.tags || []}
              onPostUpdated={fetchPosts}
              onPostDeleted={fetchPosts}
            />
          ))}
        </section>
      )}
    </div>
  );
};
