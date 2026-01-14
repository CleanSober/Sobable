import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useBlockedUsers } from "@/hooks/useModeration";
import { useUserProfiles } from "@/hooks/useCommunity";
import { getInitials, getAvatarColor } from "@/lib/anonymousNames";
import { useEffect } from "react";

export const BlockedUsersList = () => {
  const { blockedUsers, loading, unblockUser } = useBlockedUsers();
  const { fetchProfiles, getDisplayNameForUser } = useUserProfiles();
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [confirmUnblock, setConfirmUnblock] = useState<string | null>(null);

  useEffect(() => {
    if (blockedUsers.length > 0) {
      const userIds = blockedUsers.map((b) => b.blocked_id);
      fetchProfiles(userIds);
    }
  }, [blockedUsers, fetchProfiles]);

  const handleUnblock = async () => {
    if (!confirmUnblock) return;

    setUnblockingId(confirmUnblock);
    await unblockUser(confirmUnblock);
    setUnblockingId(null);
    setConfirmUnblock(null);
  };

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="gradient-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Blocked Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blockedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              You haven't blocked anyone yet.
            </p>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {blockedUsers.map((blocked) => {
                  const displayName = getDisplayNameForUser(blocked.blocked_id);
                  const isUnblocking = unblockingId === blocked.blocked_id;

                  return (
                    <motion.div
                      key={blocked.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(blocked.blocked_id)}`}
                        >
                          {getInitials(displayName)}
                        </div>
                        <span className="text-sm font-medium">{displayName}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmUnblock(blocked.blocked_id)}
                        disabled={isUnblocking}
                      >
                        {isUnblocking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Unblock"
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmUnblock} onOpenChange={(open) => !open && setConfirmUnblock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock User</AlertDialogTitle>
            <AlertDialogDescription>
              This user will be able to see your posts and interact with your content again. You can block them again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock}>Unblock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
