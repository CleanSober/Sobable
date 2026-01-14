import { useState, useEffect } from "react";
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

export const ForumList = ({ onSelectForum, onCreateForum }: ForumListProps) => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    const { data, error } = await supabase
      .from("forums")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setForums(data);
    }
    setLoading(false);
  };

  const getForumIcon = (slug: string) => {
    switch (slug) {
      case "daily-wins": return "🎉";
      case "coping-strategies": return "🧠";
      case "support-circle": return "💙";
      default: return "💬";
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-secondary/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Forums
        </h2>
        <Button size="sm" variant="outline" onClick={onCreateForum}>
          <Plus className="w-4 h-4 mr-1" />
          New Forum
        </Button>
      </div>

      <div className="space-y-3">
        {forums.map((forum, index) => (
          <motion.div
            key={forum.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer hover:bg-secondary/50 transition-colors gradient-card border-border/50"
              onClick={() => onSelectForum(forum)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getForumIcon(forum.slug)}</span>
                  <div>
                    <h3 className="font-medium text-foreground">{forum.title}</h3>
                    <p className="text-sm text-muted-foreground">{forum.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">{forum.post_count}</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
