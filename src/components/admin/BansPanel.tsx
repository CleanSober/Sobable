import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Ban, UserX, Loader2, Plus, Trash2, Clock, Infinity } from "lucide-react";
import { useUserBans, useBanUser, useUnbanUser } from "@/hooks/useAdmin";
import { formatDistanceToNow, format } from "date-fns";
import { generateAnonymousName } from "@/lib/anonymousNames";

interface BansPanelProps {
  isAdmin: boolean;
}

export const BansPanel = ({ isAdmin }: BansPanelProps) => {
  const { data: bans, isLoading } = useUserBans();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const [isAddingBan, setIsAddingBan] = useState(false);
  const [newBan, setNewBan] = useState({
    userId: "",
    reason: "",
    isPermanent: false,
    duration: 7,
  });

  const handleAddBan = async () => {
    if (!newBan.userId || !newBan.reason) return;

    await banUser.mutateAsync({
      userId: newBan.userId,
      reason: newBan.reason,
      isPermanent: newBan.isPermanent,
      expiresAt: newBan.isPermanent
        ? undefined
        : new Date(
            Date.now() + newBan.duration * 24 * 60 * 60 * 1000
          ).toISOString(),
    });

    setNewBan({ userId: "", reason: "", isPermanent: false, duration: 7 });
    setIsAddingBan(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ban className="w-5 h-5" />
          User Bans
        </CardTitle>
        <Dialog open={isAddingBan} onOpenChange={setIsAddingBan}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Ban
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                Add a new user ban. Enter the user's ID and reason for the ban.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                  placeholder="Enter user UUID"
                  value={newBan.userId}
                  onChange={(e) =>
                    setNewBan({ ...newBan, userId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  placeholder="Reason for ban..."
                  value={newBan.reason}
                  onChange={(e) =>
                    setNewBan({ ...newBan, reason: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Permanent Ban</Label>
                <Switch
                  checked={newBan.isPermanent}
                  onCheckedChange={(checked) =>
                    setNewBan({ ...newBan, isPermanent: checked })
                  }
                />
              </div>
              {!newBan.isPermanent && (
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={newBan.duration}
                    onChange={(e) =>
                      setNewBan({ ...newBan, duration: parseInt(e.target.value) })
                    }
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddingBan(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBan}
                disabled={!newBan.userId || !newBan.reason || banUser.isPending}
              >
                {banUser.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Ban User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {!bans?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserX className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No active bans</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {bans.map((ban) => (
              <motion.div
                key={ban.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-lg border bg-card/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {generateAnonymousName(ban.user_id)}
                      </span>
                      {ban.is_permanent ? (
                        <Badge
                          variant="destructive"
                          className="flex items-center gap-1"
                        >
                          <Infinity className="w-3 h-3" />
                          Permanent
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          {ban.expires_at &&
                            format(new Date(ban.expires_at), "MMM d, yyyy")}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{ban.reason}</p>

                    <div className="text-xs text-muted-foreground">
                      Banned by:{" "}
                      <span className="font-medium">
                        {generateAnonymousName(ban.banned_by)}
                      </span>
                      {" • "}
                      {formatDistanceToNow(new Date(ban.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Ban?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will unban the user and allow them to access the
                            community again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => unbanUser.mutate(ban.id)}
                          >
                            Unban User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};
