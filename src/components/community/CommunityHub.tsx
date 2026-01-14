import { useState } from "react";
import { motion } from "framer-motion";
import { Users, MessageSquare, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePremiumStatus } from "@/hooks/useCommunity";
import { PremiumGate } from "./PremiumGate";
import { ForumList } from "./ForumList";
import { ForumView } from "./ForumView";
import { LiveChat } from "./LiveChat";
import { toast } from "sonner";

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

  const handleUpgrade = () => {
    toast.info("Premium upgrade coming soon! Stay tuned.");
  };

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
    return <PremiumGate onUpgrade={handleUpgrade} />;
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
      className="space-y-6"
    >
      {/* Header */}
      <header className="text-center py-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-amber-500" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
        </div>
        <p className="text-muted-foreground">Connect with others on the journey</p>
      </header>

      {/* Tabs navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger 
            value="chat" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/10"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>Live Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="forums" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/10"
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            <span>Forums</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4 focus-visible:outline-none">
          <LiveChat />
        </TabsContent>

        <TabsContent value="forums" className="mt-4 focus-visible:outline-none">
          <ForumList
            onSelectForum={setSelectedForum}
            onCreateForum={() => toast.info("Forum creation coming soon!")}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
