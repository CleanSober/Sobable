import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, MessageSquare, Crown, Trophy, Sparkles, Bookmark } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PremiumGate } from "./PremiumGate";
import { ForumList } from "./ForumList";
import { ForumView } from "./ForumView";
import { LiveChat } from "./LiveChat";
import { Leaderboard } from "./Leaderboard";
import { BookmarkedPosts } from "./BookmarkedPosts";
import { CreateForumModal } from "./CreateForumModal";
import { CommunityGuidelines, hasAcceptedGuidelines } from "./CommunityGuidelines";

interface Forum {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  post_count: number;
}

export const CommunityHub = () => {
  const { isPremium, loading } = usePremiumStatus();
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [showCreateForumModal, setShowCreateForumModal] = useState(false);
  const [forumRefreshKey, setForumRefreshKey] = useState(0);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(hasAcceptedGuidelines);

  const handleForumCreated = useCallback(() => {
    setForumRefreshKey((prev) => prev + 1);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return <PremiumGate />;
  }

  if (!guidelinesAccepted) {
    return <CommunityGuidelines onAccepted={() => setGuidelinesAccepted(true)} />;
  }

  if (selectedForum) {
    return (
      <ForumView
        forum={selectedForum}
        onBack={() => setSelectedForum(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {/* Header */}
      <header className="text-center py-1">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <Crown className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
          <h1 className="text-base font-bold text-foreground">Community</h1>
          <Sparkles className="w-3 h-3 text-primary/60" aria-hidden="true" />
        </div>
        <p className="text-[10px] text-muted-foreground">Share, support, and grow together</p>
      </header>

      {/* Tabs navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger 
            value="chat" 
            className="flex items-center gap-1 text-[10px] data-[state=active]:bg-primary/10"
          >
            <MessageSquare className="w-3 h-3" aria-hidden="true" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="forums" 
            className="flex items-center gap-1 text-[10px] data-[state=active]:bg-primary/10"
          >
            <Users className="w-3 h-3" aria-hidden="true" />
            <span>Forums</span>
          </TabsTrigger>
          <TabsTrigger 
            value="leaderboard" 
            className="flex items-center gap-1 text-[10px] data-[state=active]:bg-primary/10"
          >
            <Trophy className="w-3 h-3" aria-hidden="true" />
            <span>Leaders</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-2 focus-visible:outline-none">
          <LiveChat />
        </TabsContent>

        <TabsContent value="forums" className="mt-2 focus-visible:outline-none">
          <ForumList
            key={forumRefreshKey}
            onSelectForum={setSelectedForum}
            onCreateForum={() => setShowCreateForumModal(true)}
          />
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-2 focus-visible:outline-none">
          <Leaderboard />
        </TabsContent>
      </Tabs>

      {/* Create Forum Modal */}
      <CreateForumModal
        open={showCreateForumModal}
        onOpenChange={setShowCreateForumModal}
        onForumCreated={handleForumCreated}
      />
    </motion.div>
  );
};