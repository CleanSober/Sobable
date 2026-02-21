import { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserPlus, Copy, Check, Send, Gift, Users, Sparkles, 
  Share2, Twitter, Facebook, MessageCircle, Award 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";
import { calculateDaysSober, calculateMoneySaved, getMilestones } from "@/lib/storage";

interface Invitation {
  id: string;
  invitee_email: string;
  invite_code: string;
  status: string;
  created_at: string;
}

interface ShareCardProps {
  daysSober: number;
  moneySaved: number;
  milestone?: string;
}

const ShareCard = ({ daysSober, moneySaved, milestone }: ShareCardProps) => {
  const weeks = Math.floor(daysSober / 7);
  const months = Math.floor(daysSober / 30);

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-primary via-primary/90 to-accent text-white">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1" fill="currentColor" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-white/20">
            <Award className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Sobable</span>
        </div>

        <div className="text-center mb-4">
          <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-5xl font-bold mb-1">
            {daysSober}
          </motion.p>
          <p className="text-lg opacity-90">Days Sober</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-xl bg-white/10">
            <p className="text-xl font-bold">{weeks}</p>
            <p className="text-xs opacity-80">Weeks</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-white/10">
            <p className="text-xl font-bold">{months}</p>
            <p className="text-xs opacity-80">Months</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-white/10">
            <p className="text-xl font-bold">${moneySaved}</p>
            <p className="text-xs opacity-80">Saved</p>
          </div>
        </div>

        {milestone && (
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-xs font-medium">
              🏆 {milestone}
            </span>
          </div>
        )}

        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>
    </div>
  );
};

export const ShareAndInvite = () => {
  const { user } = useAuth();
  const { profile } = useUserData();
  const [email, setEmail] = useState("");
  const [loading, setSending] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const inviteLink = `${window.location.origin}?ref=${user?.id?.slice(0, 8) || "app"}`;

  const daysSober = profile?.sobriety_start_date
    ? calculateDaysSober(profile.sobriety_start_date)
    : 0;
  const moneySaved = profile?.sobriety_start_date && profile?.daily_spending
    ? calculateMoneySaved(profile.sobriety_start_date, profile.daily_spending)
    : 0;
  const { reached } = getMilestones(daysSober);
  const latestMilestone = reached.length > 0 ? reached[reached.length - 1] : undefined;
  const shareText = `🎉 I've been sober for ${daysSober} days! ${latestMilestone ? `Just hit my ${latestMilestone} milestone! ` : ''}Every day is a victory. #SobrietyJourney #Recovery`;

  const fetchInvitations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("friend_invitations")
      .select("*")
      .eq("inviter_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (!error && data) setInvitations(data);
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
        .insert({ inviter_id: user.id, invitee_email: email.trim().toLowerCase() });
      if (error) {
        if (error.code === "23505") toast.error("You've already invited this email");
        else throw error;
        return;
      }
      toast.success("Invitation sent!", { description: "Your friend will receive bonus XP when they join!" });
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
      setLinkCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "width=550,height=420");
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`, "_blank", "width=550,height=420");
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Sobriety Progress", text: shareText });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") toast.error("Failed to share");
      }
    } else {
      copyShareText();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted": return "bg-success/15 text-success border-success/25";
      case "pending": return "bg-warning/15 text-warning border-warning/25";
      default: return "bg-muted text-muted-foreground border-muted";
    }
  };

  const acceptedCount = invitations.filter(i => i.status === "accepted").length;

  return (
    <div className="card-enhanced overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25 icon-glow">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Share & Invite</h3>
            <p className="text-xs text-muted-foreground">
              Celebrate progress & earn <span className="text-accent font-bold">+50 XP</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <Tabs defaultValue="share" className="w-full" onValueChange={(v) => v === "invite" && fetchInvitations()}>
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-secondary/30">
            <TabsTrigger value="share" className="gap-2 data-[state=active]:bg-primary/15">
              <Share2 className="h-4 w-4" /> Share Progress
            </TabsTrigger>
            <TabsTrigger value="invite" className="gap-2 data-[state=active]:bg-primary/15">
              <UserPlus className="h-4 w-4" /> Invite Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4 mt-0">
            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gradient-primary text-primary-foreground">
                  <Share2 className="w-4 h-4 mr-2" /> Create Share Card
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Your Achievement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <ShareCard daysSober={daysSober} moneySaved={moneySaved} milestone={latestMilestone} />
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={shareToTwitter} className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" /> Twitter/X
                    </Button>
                    <Button variant="outline" onClick={shareToFacebook} className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" /> Facebook
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={shareViaWebAPI} className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> More Options
                    </Button>
                    <Button variant="outline" onClick={copyShareText} className="flex items-center gap-2">
                      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />} Copy Text
                    </Button>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">{shareText}</div>
                </div>
              </DialogContent>
            </Dialog>

            {latestMilestone && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground">Celebrate: {latestMilestone}!</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setIsShareOpen(true)}>Share</Button>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="invite" className="space-y-4 mt-0">
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

            <div className="glass-card rounded-xl p-4 space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> Share your invite link
              </label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="text-xs bg-secondary/30 border-border/50 font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                  className={`shrink-0 transition-all duration-300 ${linkCopied ? 'border-success/50 bg-success/10' : 'hover:bg-secondary/50'}`}
                >
                  {linkCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

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
                <Button onClick={sendInvite} disabled={loading || !email.trim()} className="shrink-0 gradient-primary text-primary-foreground">
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Send className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {invitations.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recent invitations</label>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {invitations.slice(0, 3).map((inv, index) => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/20 border border-border/30 text-sm"
                    >
                      <span className="truncate flex-1 text-foreground">{inv.invitee_email}</span>
                      <Badge variant="outline" className={`text-xs capitalize font-medium ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
