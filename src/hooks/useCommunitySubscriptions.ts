import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CommunitySubscription {
  id: string;
  target_type: string;
  target_id: string;
}

export const useCommunitySubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<CommunitySubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("community_subscriptions")
        .select("id, target_type, target_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const isSubscribed = useCallback(
    (targetType: string, targetId: string) => {
      return subscriptions.some(
        (s) => s.target_type === targetType && s.target_id === targetId
      );
    },
    [subscriptions]
  );

  const toggleSubscription = useCallback(
    async (targetType: string, targetId: string) => {
      if (!user) return;

      const existing = subscriptions.find(
        (s) => s.target_type === targetType && s.target_id === targetId
      );

      if (existing) {
        // Unsubscribe
        const { error } = await supabase
          .from("community_subscriptions")
          .delete()
          .eq("id", existing.id);

        if (error) {
          toast.error("Failed to unsubscribe");
          return;
        }

        setSubscriptions((prev) => prev.filter((s) => s.id !== existing.id));
        toast.success("Notifications turned off");
      } else {
        // Subscribe
        const { data, error } = await supabase
          .from("community_subscriptions")
          .insert({
            user_id: user.id,
            target_type: targetType,
            target_id: targetId,
          })
          .select("id, target_type, target_id")
          .single();

        if (error) {
          toast.error("Failed to subscribe");
          return;
        }

        setSubscriptions((prev) => [...prev, data]);
        toast.success("Notifications turned on");
      }
    },
    [user, subscriptions]
  );

  return { subscriptions, loading, isSubscribed, toggleSubscription };
};
