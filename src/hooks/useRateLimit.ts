import { useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RateLimitConfig {
  /** Max actions allowed in the time window */
  maxActions: number;
  /** Time window in minutes */
  windowMinutes: number;
  /** Minimum seconds between consecutive actions (client-side cooldown) */
  cooldownSeconds: number;
  /** The action type for server-side counting (chat_message, forum_post, forum_reply) */
  actionType: "chat_message" | "forum_post" | "forum_reply";
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  chat_message: { maxActions: 15, windowMinutes: 5, cooldownSeconds: 2, actionType: "chat_message" },
  forum_post: { maxActions: 5, windowMinutes: 30, cooldownSeconds: 10, actionType: "forum_post" },
  forum_reply: { maxActions: 10, windowMinutes: 15, cooldownSeconds: 5, actionType: "forum_reply" },
  community_post: { maxActions: 5, windowMinutes: 15, cooldownSeconds: 10, actionType: "forum_post" },
};

export const useRateLimit = (configKey: keyof typeof DEFAULT_CONFIGS) => {
  const lastActionRef = useRef<number>(0);
  const config = DEFAULT_CONFIGS[configKey];

  const checkRateLimit = useCallback(async (userId: string): Promise<boolean> => {
    // Client-side cooldown check
    const now = Date.now();
    const elapsed = (now - lastActionRef.current) / 1000;
    if (lastActionRef.current > 0 && elapsed < config.cooldownSeconds) {
      const remaining = Math.ceil(config.cooldownSeconds - elapsed);
      toast.error(`Please wait ${remaining}s before posting again`);
      return false;
    }

    // Server-side rate limit check
    try {
      const { data, error } = await supabase.rpc("count_recent_actions", {
        p_user_id: userId,
        p_action_type: config.actionType,
        p_minutes: config.windowMinutes,
      });

      if (error) {
        console.error("Rate limit check error:", error);
        // Allow action if check fails (fail-open for UX, server RLS still protects)
        return true;
      }

      if (data !== null && data >= config.maxActions) {
        toast.error(
          `You've reached the limit of ${config.maxActions} ${config.actionType.replace("_", " ")}s in ${config.windowMinutes} minutes. Please try again later.`
        );
        return false;
      }
    } catch {
      // Fail open
      return true;
    }

    return true;
  }, [config]);

  const recordAction = useCallback(() => {
    lastActionRef.current = Date.now();
  }, []);

  return { checkRateLimit, recordAction };
};
