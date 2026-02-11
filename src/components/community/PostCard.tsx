import { memo, useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, X, Check, Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getInitials, getAvatarColor } from "@/lib/anonymousNames";
import { EmojiReactions } from "./EmojiReactions";
import { ForumReplies } from "./ForumReplies";
import { MentionText } from "./MentionInput";
import { UserActionsMenu } from "./UserActionsMenu";
import { BookmarkButton } from "./BookmarkButton";
import { SubscribeButton } from "./SubscribeButton";
import { FollowButton } from "./FollowButton";
import { PollDisplay } from "./PollDisplay";
import { formatTimeAgo, validatePostTitle, validatePostContent } from "@/hooks/useCommunity";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  replyCount: number;
  createdAt: string;
  displayName: string;
  userId: string;
  isOwn: boolean;
  index: number;
  isPinned?: boolean;
  tags?: string[];
  onReplyAdded?: () => void;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 10000;

export const PostCard = memo(({ 
  id, 
  title, 
  content, 
  replyCount, 
  createdAt, 
  displayName, 
  userId, 
  isOwn,
  index,
  isPinned = false,
  tags = [],
  onReplyAdded,
  onPostUpdated,
  onPostDeleted
}: PostCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveEdit = async () => {
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!validatePostTitle(trimmedTitle)) {
      toast.error(`Title must be between 1 and ${MAX_TITLE_LENGTH} characters`);
      return;
    }

    if (!validatePostContent(trimmedContent)) {
      toast.error(`Content must be between 1 and ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("forum_posts")
        .update({ title: trimmedTitle, content: trimmedContent })
        .eq("id", id);

      if (error) throw error;

      toast.success("Post updated!");
      setIsEditing(false);
      onPostUpdated?.();
    } catch {
      toast.error("Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete associated replies first
      await supabase.from("forum_replies").delete().eq("post_id", id);
      
      // Delete the post
      const { error } = await supabase.from("forum_posts").delete().eq("id", id);

      if (error) throw error;

      toast.success("Post deleted!");
      setShowDeleteDialog(false);
      onPostDeleted?.();
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(title);
    setEditContent(content);
    setIsEditing(false);
  };

  const titleRemaining = MAX_TITLE_LENGTH - editTitle.length;
  const contentRemaining = MAX_CONTENT_LENGTH - editContent.length;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="gradient-card border-border/50 hover:border-border/70 transition-colors">
          <CardContent className="p-3">
            {/* Author header */}
            <header className="flex items-center gap-2 mb-2">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium shadow-sm ${getAvatarColor(userId)}`}
                aria-hidden="true"
              >
                {getInitials(displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {isOwn ? "You" : displayName}
                </p>
                <time className="text-[10px] text-muted-foreground" dateTime={createdAt}>
                  {formatTimeAgo(createdAt)}
                </time>
              </div>
              
              {/* Actions menu for own posts */}
              {isOwn && !isEditing ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="sr-only">Post options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : !isOwn && !isEditing ? (
                <UserActionsMenu
                  userId={userId}
                  targetType="forum_post"
                  targetId={id}
                />
              ) : null}
            </header>
            
            {/* Post content */}
            {isEditing ? (
              <div className="space-y-3 mb-4">
                <div>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={MAX_TITLE_LENGTH}
                    placeholder="Post title"
                    aria-label="Edit post title"
                  />
                  {titleRemaining < 50 && (
                    <p className={`text-xs mt-1 text-right ${titleRemaining < 10 ? "text-destructive" : "text-muted-foreground"}`}>
                      {titleRemaining} characters remaining
                    </p>
                  )}
                </div>
                <div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={MAX_CONTENT_LENGTH}
                    placeholder="Post content"
                    rows={4}
                    aria-label="Edit post content"
                  />
                  {contentRemaining < 500 && (
                    <p className={`text-xs mt-1 text-right ${contentRemaining < 100 ? "text-destructive" : "text-muted-foreground"}`}>
                      {contentRemaining} characters remaining
                    </p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={saving}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSaveEdit} 
                    disabled={saving || !editTitle.trim() || !editContent.trim()}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xs font-semibold text-foreground mb-1 leading-snug">{title}</h3>
                <MentionText 
                  text={content} 
                  className="text-[10px] text-muted-foreground mb-3 line-clamp-3 leading-relaxed block" 
                />
              </>
            )}
            
            {/* Footer with reactions and actions */}
            {!isEditing && (
              <footer className="flex items-center justify-between gap-2 flex-wrap">
                <EmojiReactions targetId={id} targetType="forum_post" />
                <div className="flex items-center gap-1">
                  <BookmarkButton postId={id} compact />
                  <SubscribeButton postId={id} compact />
                </div>
              </footer>
            )}

            {/* Poll if exists */}
            {!isEditing && <PollDisplay postId={id} />}

            {/* Replies section */}
            {!isEditing && (
              <ForumReplies 
                postId={id} 
                replyCount={replyCount} 
                onReplyAdded={onReplyAdded || (() => {})} 
              />
            )}
          </CardContent>
        </Card>
      </motion.article>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This will also delete all replies. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

PostCard.displayName = "PostCard";
