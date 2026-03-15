import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunitySubscriptions } from "@/hooks/useCommunitySubscriptions";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CommunityNotifyButtonProps {
  targetType: "chat_room" | "forum";
  targetId: string;
  compact?: boolean;
}

export const CommunityNotifyButton = ({
  targetType,
  targetId,
  compact = true,
}: CommunityNotifyButtonProps) => {
  const { isSubscribed, toggleSubscription } = useCommunitySubscriptions();
  const [toggling, setToggling] = useState(false);

  const subscribed = isSubscribed(targetType, targetId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setToggling(true);
    await toggleSubscription(targetType, targetId);
    setToggling(false);
  };

  const label = subscribed ? "Turn off notifications" : "Turn on notifications";

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={toggling}
        className="h-7 w-7 shrink-0"
        aria-label={label}
        title={label}
      >
        <AnimatePresence mode="wait">
          {subscribed ? (
            <motion.div
              key="on"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <BellRing className="w-3.5 h-3.5 text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="off"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  }

  return (
    <Button
      variant={subscribed ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={toggling}
      className="text-xs h-7"
    >
      {subscribed ? (
        <>
          <BellRing className="w-3.5 h-3.5 mr-1 text-primary" />
          Subscribed
        </>
      ) : (
        <>
          <Bell className="w-3.5 h-3.5 mr-1" />
          Notify Me
        </>
      )}
    </Button>
  );
};
