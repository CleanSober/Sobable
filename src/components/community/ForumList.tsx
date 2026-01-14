import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, ChevronRight, Plus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Forum {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  post_count: number;
}

interface ForumListProps {
  onSelectForum: (forum: Forum) => void;
  onCreateForum: () => void;
}

const FORUM_ICONS: Record<string, string> = {
  "daily-wins": "🎉",
  "coping-strategies": "🧠",
  "support-circle": "💙",
  "milestones": "🏆",
  "resources": "📚",
};

const ForumCard = memo(({ 
  forum, 
  index, 
  onSelect 
}: { 
  forum: Forum; 
  index: number; 
  onSelect: () => void;
}) => {
  const icon = FORUM_ICONS[forum.slug] || "💬";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className="cursor-pointer hover:bg-secondary/50 hover:border-border transition-all duration-200 gradient-card border-border/50 group"
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        aria-label={`${forum.title} forum with ${forum.post_count} posts`}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">{icon}</span>
            <div className="min-w-0">
              <h3 className="font-medium text-foreground truncate">{forum.title}</h3>
              {forum.description && (
                <p className="text-sm text-muted-foreground truncate">{forum.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0 ml-2">
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">{forum.post_count}</span>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ForumCard.displayName = "ForumCard";

export const ForumList = ({ onSelectForum, onCreateForum }: ForumListProps) => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      const { data, error } = await supabase
        .from("forums")
        .select("id, title, description, slug, post_count")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setForums(data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading forums">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-secondary/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" aria-hidden="true" />
          Forums
        </h2>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCreateForum}
          aria-label="Create a new forum"
        >
          <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
          New Forum
        </Button>
      </header>

      {/* Forums list */}
      {forums.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" aria-hidden="true" />
          <p className="font-medium">No forums available</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <nav className="space-y-3" aria-label="Forum list">
          {forums.map((forum, index) => (
            <ForumCard
              key={forum.id}
              forum={forum}
              index={index}
              onSelect={() => onSelectForum(forum)}
            />
          ))}
        </nav>
      )}
    </div>
  );
};
