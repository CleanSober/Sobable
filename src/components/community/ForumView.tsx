import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Send, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getDisplayName, getInitials, getAvatarColor } from "@/lib/anonymousNames";

interface Forum {
  id: string;
  title: string;
  description: string | null;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  likes: number;
  reply_count: number;
  created_at: string;
  user_id: string;
}

interface UserProfile {
  user_id: string;
  display_name: string | null;
}

interface ForumViewProps {
  forum: Forum;
  onBack: () => void;
}

export const ForumView = ({ forum, onBack }: ForumViewProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [forum.id]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("forum_id", forum.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
      
      // Fetch all unique user profiles
      const userIds = [...new Set(data.map((p) => p.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);

        if (profilesData) {
          const profileMap = new Map<string, UserProfile>();
          profilesData.forEach((p) => profileMap.set(p.user_id, p));
          setProfiles(profileMap);
        }
      }
    }
    setLoading(false);
  };

  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim() || !user) return;

    setSubmitting(true);
    const { error } = await supabase.from("forum_posts").insert({
      forum_id: forum.id,
      user_id: user.id,
      title: newTitle.trim(),
      content: newContent.trim(),
    });

    if (error) {
      toast.error("Failed to create post");
    } else {
      toast.success("Post created!");
      setNewTitle("");
      setNewContent("");
      setShowNewPost(false);
      fetchPosts();
    }
    setSubmitting(false);
  };

  const likePost = async (postId: string, currentLikes: number) => {
    await supabase
      .from("forum_posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", postId);
    fetchPosts();
  };

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  const getUserDisplayName = (userId: string) => {
    const profile = profiles.get(userId);
    return getDisplayName(profile?.display_name, userId);
  };

  const isOwnPost = (userId: string) => userId === user?.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">{forum.title}</h2>
          <p className="text-sm text-muted-foreground">{forum.description}</p>
        </div>
      </div>

      {!showNewPost ? (
        <Button onClick={() => setShowNewPost(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      ) : (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Post title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="What's on your mind?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
              <Button onClick={createPost} disabled={submitting || !newTitle.trim() || !newContent.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, index) => {
            const displayName = getUserDisplayName(post.user_id);
            const isOwn = isOwnPost(post.user_id);
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="gradient-card border-border/50">
                  <CardContent className="p-4">
                    {/* Author info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(post.user_id)}`}
                      >
                        {getInitials(displayName)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {isOwn ? "You" : displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    
                    {/* Post content */}
                    <h3 className="font-medium text-foreground mb-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <button
                        onClick={() => likePost(post.id, post.likes)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Heart className="w-4 h-4" fill={post.likes > 0 ? "currentColor" : "none"} />
                        {post.likes}
                      </button>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.reply_count}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
