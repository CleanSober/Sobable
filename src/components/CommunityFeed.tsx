import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Send, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Post { id: string; content: string; likes: number; timestamp: Date; type: "win" | "struggle" | "support"; }

const samplePosts: Post[] = [
  { id: "1", content: "30 days sober today! Never thought I'd make it this far. 🎉", likes: 24, timestamp: new Date(Date.now() - 3600000), type: "win" },
  { id: "2", content: "Had a rough day but made it through without slipping. One day at a time.", likes: 18, timestamp: new Date(Date.now() - 7200000), type: "struggle" },
  { id: "3", content: "Remember: every sober day is a victory, no matter how small it feels.", likes: 32, timestamp: new Date(Date.now() - 10800000), type: "support" },
];

export const CommunityFeed = () => {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<"win" | "struggle" | "support">("win");

  const addPost = () => {
    if (!newPost.trim()) return;
    const post: Post = { id: Date.now().toString(), content: newPost, likes: 0, timestamp: new Date(), type: postType };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  const likePost = (id: string) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "win": return "border-l-green-500 bg-green-500/5";
      case "struggle": return "border-l-orange-500 bg-orange-500/5";
      case "support": return "border-l-blue-500 bg-blue-500/5";
      default: return "";
    }
  };

  const timeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
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
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["win", "struggle", "support"] as const).map((type) => (
              <Button key={type} size="sm" variant={postType === type ? "default" : "outline"} onClick={() => setPostType(type)} className="capitalize">
                {type === "win" ? "🎉" : type === "struggle" ? "💪" : "💙"} {type}
              </Button>
            ))}
          </div>
          <Textarea placeholder="Share your thoughts..." value={newPost} onChange={(e) => setNewPost(e.target.value)} className="resize-none" rows={2} />
          <Button onClick={addPost} disabled={!newPost.trim()} className="w-full">
            <Send className="w-4 h-4 mr-2" />Share
          </Button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {posts.map((post, index) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`p-4 rounded-xl border-l-4 ${getTypeStyle(post.type)}`}>
              <p className="text-sm mb-2">{post.content}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{timeAgo(post.timestamp)}</span>
                <button onClick={() => likePost(post.id)} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Heart className="w-4 h-4" fill={post.likes > 0 ? "currentColor" : "none"} /> {post.likes}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
