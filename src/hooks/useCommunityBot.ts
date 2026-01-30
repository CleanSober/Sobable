import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TriggerBotReplyOptions {
  content: string;
  targetId: string;
  targetType: "chat_message" | "forum_post" | "community_post";
}

/**
 * Hook to trigger community bot auto-replies after a random delay (1-5 minutes)
 */
export const useCommunityBot = () => {
  const pendingTimeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const triggerBotReply = useCallback(({ content, targetId, targetType }: TriggerBotReplyOptions) => {
    // Random delay between 1-5 minutes (60000-300000ms)
    const delayMs = Math.floor(Math.random() * (300000 - 60000 + 1)) + 60000;
    
    console.log(`Scheduling bot reply in ${Math.round(delayMs / 1000)}s for ${targetType}:${targetId}`);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await supabase.functions.invoke("community-bot", {
          body: {
            type: "auto_reply",
            content,
            targetId,
            targetType,
          },
        });

        if (response.error) {
          console.error("Bot reply failed:", response.error);
        } else {
          console.log("Bot reply sent successfully");
        }
      } catch (error) {
        console.error("Failed to trigger bot reply:", error);
      } finally {
        pendingTimeouts.current.delete(timeoutId);
      }
    }, delayMs);

    pendingTimeouts.current.add(timeoutId);

    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
      pendingTimeouts.current.delete(timeoutId);
    };
  }, []);

  // Cancel all pending bot replies
  const cancelAll = useCallback(() => {
    pendingTimeouts.current.forEach(clearTimeout);
    pendingTimeouts.current.clear();
  }, []);

  return { triggerBotReply, cancelAll };
};
