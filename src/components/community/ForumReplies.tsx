import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, ChevronDown, ChevronUp, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  useUserProfiles, 
  ForumReply, 
  formatTimeAgo, 
  validateMessageLength,
  createMentionNotifications
} from "@/hooks/useCommunity";
import { getInitials, getAvatarColor } from "@/lib/anonymousNames";
import { EmojiReactions } from "./EmojiReactions";
import { MentionInput, MentionText } from "./MentionInput";
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

interface ForumRepliesProps {
  postId: string;
  replyCount: number;
  onReplyAdded: () => void;
}

const MAX_REPLY_LENGTH = 2000;

export const ForumReplies = memo(({ postId, replyCount, onReplyAdded }: ForumRepliesProps) => {
  const { user } = useAuth();
  const { profiles, fetchProfiles, getDisplayNameForUser, getAllProfiles } = useUserProfiles();
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showInput, setShowInput] = useState(false);
  
  // Edit state
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Delete state
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [localReplyCount, setLocalReplyCount] = useState(replyCount);

  useEffect(() => {
    setLocalReplyCount(replyCount);
  }, [replyCount]);

  const fetchReplies = useCallback(async () => {
    if (!expanded) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setReplies(data);
        const userIds = [...new Set(data.map((r) => r.user_id))];
        if (userIds.length > 0) {
          await fetchProfiles(userIds);
        }
      }
    } catch {
      toast.error("Failed to load replies");
    } finally {
      setLoading(false);
    }
  }, [postId, expanded, fetchProfiles]);

  useEffect(() => {
    if (expanded) {
      fetchReplies();
    }
  }, [expanded, fetchReplies]);

  const submitReply = async () => {
    const trimmedReply = newReply.trim();
    
    if (!trimmedReply || !user) return;

    if (!validateMessageLength(trimmedReply, MAX_REPLY_LENGTH)) {
      toast.error(`Reply must be between 1 and ${MAX_REPLY_LENGTH} characters`);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("forum_replies")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: trimmedReply,
        })
        .select()
        .single();

      if (error) throw error;

      // Update reply count on post
      const newCount = localReplyCount + 1;
      await supabase
        .from("forum_posts")
        .update({ reply_count: newCount })
        .eq("id", postId);

      setLocalReplyCount(newCount);

      // Create mention notifications
      await createMentionNotifications(
        trimmedReply,
        user.id,
        "forum_reply",
        data.id,
        getAllProfiles()
      );

      toast.success("Reply posted!");
      setNewReply("");
      setShowInput(false);
      onReplyAdded();
      
      // Refresh replies
      await fetchReplies();
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReply = (reply: ForumReply) => {
    setEditingReplyId(reply.id);
    setEditContent(reply.content);
  };

  const handleSaveEdit = async () => {
    if (!editingReplyId) return;
    
    const trimmedContent = editContent.trim();
    
    if (!validateMessageLength(trimmedContent, MAX_REPLY_LENGTH)) {
      toast.error(`Reply must be between 1 and ${MAX_REPLY_LENGTH} characters`);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("forum_replies")
        .update({ content: trimmedContent })
        .eq("id", editingReplyId);

      if (error) throw error;

      toast.success("Reply updated!");
      setEditingReplyId(null);
      setEditContent("");
      await fetchReplies();
    } catch {
      toast.error("Failed to update reply");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingReplyId(null);
    setEditContent("");
  };

  const handleDeleteReply = async () => {
    if (!deleteReplyId) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("forum_replies")
        .delete()
        .eq("id", deleteReplyId);

      if (error) throw error;

      // Update reply count on post
      const newCount = Math.max(0, localReplyCount - 1);
      await supabase
        .from("forum_posts")
        .update({ reply_count: newCount })
        .eq("id", postId);

      setLocalReplyCount(newCount);

      toast.success("Reply deleted!");
      setDeleteReplyId(null);
      await fetchReplies();
    } catch {
      toast.error("Failed to delete reply");
    } finally {
      setDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitReply();
    }
  };

  const isOwnReply = (userId: string) => userId === user?.id;
  const remainingChars = MAX_REPLY_LENGTH - newReply.length;
  const editRemainingChars = MAX_REPLY_LENGTH - editContent.length;

  return (
    <>
      <div className="mt-3 pt-3 border-t border-border/30">
        {/* Toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <MessageCircle className="w-4 h-4" />
          <span>{localReplyCount} {localReplyCount === 1 ? "reply" : "replies"}</span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Replies list */}
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-secondary/30 animate-pulse" />
                  ))}
                </div>
              ) : replies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  No replies yet. Be the first!
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {replies.map((reply, index) => {
                    const displayName = getDisplayNameForUser(reply.user_id);
                    const isOwn = isOwnReply(reply.user_id);
                    const isEditing = editingReplyId === reply.id;

                    return (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-2 p-2 rounded-lg bg-secondary/30"
                      >
                        <div
                          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(reply.user_id)}`}
                        >
                          {getInitials(displayName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-foreground">
                              {isOwn ? "You" : displayName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(reply.created_at)}
                            </span>
                            
                            {/* Actions menu for own replies */}
                            {isOwn && !isEditing && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto">
                                    <MoreHorizontal className="w-3 h-3" />
                                    <span className="sr-only">Reply options</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditReply(reply)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setDeleteReplyId(reply.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <div className="space-y-2 mt-2">
                              <div className="relative">
                                <MentionInput
                                  value={editContent}
                                  onChange={setEditContent}
                                  placeholder="Edit your reply..."
                                  disabled={saving}
                                  maxLength={MAX_REPLY_LENGTH}
                                  profiles={getAllProfiles()}
                                  multiline
                                  rows={2}
                                  aria-label="Edit reply"
                                />
                                {editRemainingChars < 100 && (
                                  <span 
                                    className={`absolute right-2 bottom-2 text-xs ${
                                      editRemainingChars < 20 ? "text-destructive" : "text-muted-foreground"
                                    }`}
                                  >
                                    {editRemainingChars}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={saving}>
                                  <X className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={handleSaveEdit} 
                                  disabled={saving || !editContent.trim()}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  {saving ? "Saving..." : "Save"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <MentionText 
                                text={reply.content} 
                                className="text-sm text-muted-foreground break-words" 
                              />
                              <div className="mt-1">
                                <EmojiReactions 
                                  targetId={reply.id} 
                                  targetType="forum_reply" 
                                  compact 
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Reply input */}
              {!showInput ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInput(true)}
                  className="text-muted-foreground"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Add a reply
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <MentionInput
                      value={newReply}
                      onChange={setNewReply}
                      onKeyDown={handleKeyDown}
                      placeholder="Write a reply... Use @ to mention"
                      disabled={submitting}
                      maxLength={MAX_REPLY_LENGTH}
                      profiles={getAllProfiles()}
                      multiline
                      rows={2}
                      aria-label="Reply input"
                    />
                    {remainingChars < 100 && (
                      <span 
                        className={`absolute right-2 bottom-2 text-xs ${
                          remainingChars < 20 ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {remainingChars}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowInput(false);
                        setNewReply("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={submitReply}
                      disabled={!newReply.trim() || submitting}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      {submitting ? "Posting..." : "Reply"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteReplyId} onOpenChange={(open) => !open && setDeleteReplyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reply</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reply? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReply}
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

ForumReplies.displayName = "ForumReplies";
