import { useState, useEffect, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, ChevronRight, Plus, Users, Search, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

// Comprehensive forum icons mapping
const FORUM_ICONS: Record<string, string> = {
  "daily-wins": "🎉",
  "coping-strategies": "🧠",
  "support-circle": "💙",
  "milestones": "🏆",
  "resources": "📚",
  "daily-check-ins": "📅",
  "first-30-days": "🌱",
  "milestone-celebrations": "🎊",
  "cravings-triggers": "⚡",
  "family-relationships": "👨‍👩‍👧‍👦",
  "mental-health": "🧘",
  "exercise-fitness": "💪",
  "nutrition-wellness": "🥗",
  "sleep-rest": "😴",
  "meditation-mindfulness": "🕯️",
  "alcohol-recovery": "🍷",
  "smoking-cessation": "🚭",
  "substance-recovery": "💊",
  "gambling-recovery": "🎰",
  "work-career": "💼",
  "financial-recovery": "💰",
  "spirituality": "✨",
  "twelve-step-programs": "📖",
  "smart-recovery": "🎯",
  "therapy-counseling": "🛋️",
  "relapse-prevention": "🛡️",
  "success-stories": "⭐",
  "book-club": "📚",
  "hobbies-interests": "🎨",
  "sober-social-life": "🎭",
  "parents-recovery": "👶",
  "ask-community": "❓",
};

// Forum categories for filtering
const FORUM_CATEGORIES: Record<string, string[]> = {
  "Recovery Types": ["alcohol-recovery", "smoking-cessation", "substance-recovery", "gambling-recovery"],
  "Daily Support": ["daily-wins", "daily-check-ins", "support-circle", "cravings-triggers"],
  "Wellness": ["mental-health", "exercise-fitness", "nutrition-wellness", "sleep-rest", "meditation-mindfulness"],
  "Programs": ["twelve-step-programs", "smart-recovery", "therapy-counseling", "relapse-prevention"],
  "Lifestyle": ["work-career", "financial-recovery", "hobbies-interests", "sober-social-life", "book-club"],
  "Milestones": ["first-30-days", "milestone-celebrations", "success-stories"],
  "Personal": ["family-relationships", "parents-recovery", "spirituality"],
};

type SortOption = "popular" | "recent" | "alphabetical";

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
  const isPopular = forum.post_count >= 10;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Card
        className="cursor-pointer hover:bg-secondary/50 hover:border-primary/30 transition-all duration-200 gradient-card border-border/50 group"
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        aria-label={`${forum.title} forum with ${forum.post_count} posts`}
      >
        <CardContent className="p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-base flex-shrink-0" aria-hidden="true">{icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-medium text-xs text-foreground truncate">{forum.title}</h3>
                {isPopular && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary shrink-0">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    Active
                  </Badge>
                )}
              </div>
              {forum.description && (
                <p className="text-[10px] text-muted-foreground truncate">{forum.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0 ml-2">
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-xs font-medium">{forum.post_count}</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Filter and sort forums
  const filteredForums = useMemo(() => {
    let result = [...forums];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (forum) =>
          forum.title.toLowerCase().includes(query) ||
          forum.description?.toLowerCase().includes(query) ||
          forum.slug.includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      const categorySlugs = FORUM_CATEGORIES[selectedCategory] || [];
      result = result.filter((forum) => categorySlugs.includes(forum.slug));
    }

    // Apply sorting
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.post_count - a.post_count);
        break;
      case "alphabetical":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "recent":
        // Keep original order (most recently created)
        break;
    }

    return result;
  }, [forums, searchQuery, sortBy, selectedCategory]);

  const categories = Object.keys(FORUM_CATEGORIES);

  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading forums">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-secondary/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Header with search and create */}
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" aria-hidden="true" />
            Forums
            <Badge variant="outline" className="ml-1 text-[10px] px-1.5">{forums.length}</Badge>
          </h2>
          <Button 
            size="sm" 
            onClick={onCreateForum}
            className="gradient-primary text-primary-foreground h-7 text-[10px] px-2.5"
            aria-label="Create a new forum"
          >
            <Plus className="w-3.5 h-3.5 mr-0.5" aria-hidden="true" />
            New
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search forums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <Button
            size="sm"
            variant={sortBy === "popular" ? "default" : "outline"}
            onClick={() => setSortBy("popular")}
            className="shrink-0 h-7 text-[10px] px-2"
          >
            <TrendingUp className="w-3 h-3 mr-0.5" />
            Popular
          </Button>
          <Button
            size="sm"
            variant={sortBy === "recent" ? "default" : "outline"}
            onClick={() => setSortBy("recent")}
            className="shrink-0 h-7 text-[10px] px-2"
          >
            <Clock className="w-3 h-3 mr-0.5" />
            Recent
          </Button>
          <Button
            size="sm"
            variant={sortBy === "alphabetical" ? "default" : "outline"}
            onClick={() => setSortBy("alphabetical")}
            className="shrink-0 h-7 text-[10px] px-2"
          >
            A-Z
          </Button>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/20 transition-colors text-[10px] px-1.5 py-0"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/20 transition-colors text-[10px] px-1.5 py-0"
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </header>

      {/* Forums list */}
      {filteredForums.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" aria-hidden="true" />
          <p className="font-medium">
            {searchQuery ? "No forums match your search" : "No forums available"}
          </p>
          <p className="text-sm mt-1">
            {searchQuery ? "Try different keywords" : "Check back soon!"}
          </p>
        </div>
      ) : (
        <nav className="space-y-2" aria-label="Forum list">
          {filteredForums.map((forum, index) => (
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
