import { useState } from "react";
import { MoreHorizontal, Flag, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { ReportDialog } from "./ReportDialog";
import { useBlockedUsers } from "@/hooks/useModeration";
import { useAuth } from "@/contexts/AuthContext";

interface UserActionsMenuProps {
  userId: string;
  targetType: "forum_post" | "forum_reply" | "chat_message";
  targetId: string;
  compact?: boolean;
}

export const UserActionsMenu = ({
  userId,
  targetType,
  targetId,
  compact = false,
}: UserActionsMenuProps) => {
  const { user } = useAuth();
  const { blockUser, unblockUser, isUserBlocked } = useBlockedUsers();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Don't show menu for own content
  if (!user || userId === user.id) return null;

  const isBlocked = isUserBlocked(userId);

  const handleBlock = async () => {
    setProcessing(true);
    await blockUser(userId);
    setProcessing(false);
    setShowBlockConfirm(false);
  };

  const handleUnblock = async () => {
    setProcessing(true);
    await unblockUser(userId);
    setProcessing(false);
    setShowUnblockConfirm(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={compact ? "h-6 w-6" : "h-8 w-8"}
          >
            <MoreHorizontal className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
            <span className="sr-only">User actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
            <Flag className="w-4 h-4 mr-2" />
            Report
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isBlocked ? (
            <DropdownMenuItem onClick={() => setShowUnblockConfirm(true)}>
              <UserCheck className="w-4 h-4 mr-2" />
              Unblock user
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => setShowBlockConfirm(true)}
              className="text-destructive focus:text-destructive"
            >
              <UserX className="w-4 h-4 mr-2" />
              Block user
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report Dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        targetType={targetType}
        targetId={targetId}
        reportedUserId={userId}
      />

      {/* Block Confirmation */}
      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              When you block someone:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>You won't see their posts or messages</li>
                <li>They won't be notified that you blocked them</li>
                <li>You can unblock them at any time</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? "Blocking..." : "Block User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unblock Confirmation */}
      <AlertDialog open={showUnblockConfirm} onOpenChange={setShowUnblockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock User</AlertDialogTitle>
            <AlertDialogDescription>
              This user will be able to see your posts and you'll see their content again. You can block them again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock} disabled={processing}>
              {processing ? "Unblocking..." : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
