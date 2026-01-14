import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThreadSubscriptions } from "@/hooks/useForumFeatures";
import { useState } from "react";

interface SubscribeButtonProps {
  postId: string;
  compact?: boolean;
}

export const SubscribeButton = ({ postId, compact = false }: SubscribeButtonProps) => {
  const { isSubscribed, toggleSubscription } = useThreadSubscriptions();
  const [loading, setLoading] = useState(false);

  const subscribed = isSubscribed(postId);

  const handleClick = async () => {
    setLoading(true);
    await toggleSubscription(postId);
    setLoading(false);
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={loading}
        className="h-8 w-8"
        aria-label={subscribed ? "Unsubscribe from thread" : "Subscribe to thread"}
      >
        {subscribed ? (
          <BellOff className="w-4 h-4 text-primary" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={subscribed ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      {subscribed ? (
        <>
          <BellOff className="w-4 h-4 mr-1" />
          Unsubscribe
        </>
      ) : (
        <>
          <Bell className="w-4 h-4 mr-1" />
          Subscribe
        </>
      )}
    </Button>
  );
};
