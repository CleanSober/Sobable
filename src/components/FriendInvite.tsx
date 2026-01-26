import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Copy, Check, Send, Gift, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Invitation {
  id: string;
  invitee_email: string;
  invite_code: string;
  status: string;
  created_at: string;
}

export const FriendInvite = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setSending] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}?ref=${user?.id?.slice(0, 8) || "app"}`;

  useEffect(() => {
    if (user) fetchInvitations();
  }, [user]);

  const fetchInvitations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("friend_invitations")
      .select("*")
      .eq("inviter_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setInvitations(data);
    }
  };

  const sendInvite = async () => {
    if (!user || !email.trim()) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase
        .from("friend_invitations")
        .insert({
          inviter_id: user.id,
          invitee_email: email.trim().toLowerCase(),
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("You've already invited this email");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Invitation sent!", {
        description: "Your friend will receive bonus XP when they join!",
      });
      setEmail("");
      fetchInvitations();
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "expired":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  const acceptedCount = invitations.filter(i => i.status === "accepted").length;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5 text-primary" />
          Invite Friends
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Earn <span className="text-primary font-semibold">+50 XP</span> for each friend who joins!
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        {invitations.length > 0 && (
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-lg bg-muted/50 text-center">
              <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{invitations.length}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-green-500/10 text-center">
              <Gift className="h-4 w-4 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold text-green-500">{acceptedCount}</p>
              <p className="text-xs text-muted-foreground">Joined</p>
            </div>
          </div>
        )}

        {/* Share Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Share your invite link</label>
          <div className="flex gap-2">
            <Input
              value={inviteLink}
              readOnly
              className="text-xs bg-muted/50"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Email Invite */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Or send an email invite</label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/50"
              onKeyDown={(e) => e.key === "Enter" && sendInvite()}
            />
            <Button
              onClick={sendInvite}
              disabled={loading || !email.trim()}
              className="shrink-0"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Send className="h-4 w-4" />
                </motion.div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Recent Invitations */}
        {invitations.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recent invitations</label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {invitations.slice(0, 5).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                >
                  <span className="truncate flex-1">{inv.invitee_email}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${getStatusColor(inv.status)}`}
                  >
                    {inv.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
