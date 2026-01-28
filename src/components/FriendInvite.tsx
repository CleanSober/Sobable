import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Copy, Check, Send, Gift, Users, Sparkles } from "lucide-react";
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-success/15 text-success border-success/25";
      case "pending":
        return "bg-warning/15 text-warning border-warning/25";
      case "expired":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const acceptedCount = invitations.filter(i => i.status === "accepted").length;

  return (
    <div className="card-enhanced overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25 icon-glow">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Invite Friends</h3>
            <p className="text-xs text-muted-foreground">
              Earn <span className="text-accent font-bold">+50 XP</span> for each friend who joins!
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-5 space-y-4">
        {/* Stats */}
        {invitations.length > 0 && (
          <div className="flex gap-3">
            <div className="flex-1 stat-box text-center group">
              <Users className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-xl font-bold text-foreground">{invitations.length}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-success/10 border border-success/20 text-center">
              <Gift className="h-4 w-4 mx-auto mb-1.5 text-success" />
              <p className="text-xl font-bold text-success">{acceptedCount}</p>
              <p className="text-xs text-muted-foreground">Joined</p>
            </div>
          </div>
        )}

        {/* Share Link */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Share your invite link
          </label>
          <div className="flex gap-2">
            <Input
              value={inviteLink}
              readOnly
              className="text-xs bg-secondary/30 border-border/50 font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyLink}
              className={`shrink-0 transition-all duration-300 ${copied ? 'border-success/50 bg-success/10' : 'hover:bg-secondary/50'}`}
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Email Invite */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Or send an email invite</label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/30 border-border/50"
              onKeyDown={(e) => e.key === "Enter" && sendInvite()}
            />
            <Button
              onClick={sendInvite}
              disabled={loading || !email.trim()}
              className="shrink-0 gradient-primary text-primary-foreground"
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
            <label className="text-sm font-medium text-foreground">Recent invitations</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {invitations.slice(0, 5).map((inv, index) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30 text-sm"
                >
                  <span className="truncate flex-1 text-foreground">{inv.invitee_email}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize font-medium ${getStatusBadge(inv.status)}`}
                  >
                    {inv.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
