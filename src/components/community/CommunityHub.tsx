import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, MessageSquare, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);

  useEffect(() => {
    checkPremiumStatus();
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan_type, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!error && data) {
      setIsPremium(data.plan_type === "premium" || data.plan_type === "pro");
    } else {
      setIsPremium(false);
    }
    setLoading(false);
  };

  const handleUpgrade = () => {
    toast.info("Premium upgrade coming soon! Stay tuned.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
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
      <div className="text-center py-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-amber-500" />
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
        </div>
        <p className="text-muted-foreground">Connect with others on the journey</p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="forums" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Forums
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <LiveChat />
        </TabsContent>

        <TabsContent value="forums" className="mt-4">
          <ForumList
            onSelectForum={setSelectedForum}
            onCreateForum={() => toast.info("Forum creation coming soon!")}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
