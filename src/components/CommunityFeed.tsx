import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Send, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string;
  post_type: string;
  likes: number;
  created_at: string;
  user_id: string;
}

export const CommunityFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<"win" | "struggle" | "support">("win");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setPosts(data);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("community_posts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_posts" },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addPost = async () => {
    if (!newPost.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase.from("community_posts").insert({
      content: newPost.trim(),
      post_type: postType,
      user_id: user.id,
    });

    if (error) {
      toast.error("Failed to post. Please try again.");
    } else {
      setNewPost("");
      toast.success("Posted!");
    }
    setLoading(false);
  };

  const likePost = async (id: string, currentLikes: number) => {
    await supabase
      .from("community_posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", id);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "win": return "border-l-green-500 bg-green-500/5";
      case "struggle": return "border-l-orange-500 bg-orange-500/5";
      case "support": return "border-l-blue-500 bg-blue-500/5";
      default: return "";
    }
  };

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Community Support
        </CardTitle>
        <p className="text-sm text-muted-foreground">Share anonymously with others on the same journey</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["win", "struggle", "support"] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={postType === type ? "default" : "outline"}
                  onClick={() => setPostType(type)}
                  className="capitalize"
                >
                  {type === "win" ? "🎉" : type === "struggle" ? "💪" : "💙"} {type}
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="Share your thoughts..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="resize-none"
              rows={2}
            />
            <Button onClick={addPost} disabled={!newPost.trim() || loading} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Be the first to share! 💪
            </p>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border-l-4 ${getTypeStyle(post.post_type)}`}
              >
                <p className="text-sm mb-2">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{timeAgo(post.created_at)}</span>
                  <button
                    onClick={() => likePost(post.id, post.likes)}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Heart className="w-4 h-4" fill={post.likes > 0 ? "currentColor" : "none"} />
                    {post.likes}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
