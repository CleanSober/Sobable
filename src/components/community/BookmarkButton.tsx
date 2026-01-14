import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useForumFeatures";
import { useState } from "react";

interface BookmarkButtonProps {
  postId: string;
  compact?: boolean;
}

export const BookmarkButton = ({ postId, compact = false }: BookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [loading, setLoading] = useState(false);

  const bookmarked = isBookmarked(postId);

  const handleClick = async () => {
    setLoading(true);
    await toggleBookmark(postId);
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
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
      >
        {bookmarked ? (
          <BookmarkCheck className="w-4 h-4 text-primary" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={bookmarked ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className="w-4 h-4 mr-1 text-primary" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4 mr-1" />
          Save
        </>
      )}
    </Button>
  );
};
