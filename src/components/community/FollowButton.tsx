import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserFollows } from "@/hooks/useForumFeatures";
import { useAuth } from "@/contexts/AuthContext";

interface FollowButtonProps {
  userId: string;
  compact?: boolean;
}

export const FollowButton = ({ userId, compact = false }: FollowButtonProps) => {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useUserFollows();
  const [loading, setLoading] = useState(false);

  // Don't show for own profile
  if (!user || userId === user.id) return null;

  const following = isFollowing(userId);

  const handleClick = async () => {
    setLoading(true);
    await toggleFollow(userId);
    setLoading(false);
  };

  if (compact) {
    return (
      <Button
        variant={following ? "secondary" : "default"}
        size="sm"
        onClick={handleClick}
        disabled={loading}
        className="h-7 text-xs"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : following ? (
          <>
            <UserCheck className="w-3 h-3 mr-1" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3 mr-1" />
            Follow
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={following ? "secondary" : "default"}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : following ? (
        <>
          <UserCheck className="w-4 h-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};
