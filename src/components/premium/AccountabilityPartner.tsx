import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Crown, Search, MessageSquare, UserPlus, Check, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Match {
  id: string;
  partner_id: string;
  user_id: string;
  status: string;
  match_score: number;
  shared_goals: string[];
  partner_name?: string;
  partner_days?: number;
}

interface PartnerMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export const AccountabilityPartner = () => {
  const { isPremium } = usePremiumStatus();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPremium || !user) { setLoading(false); return; }
    loadMatches();
  }, [isPremium, user]);

  const loadMatches = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("partner_matches")
      .select("*")
      .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (data) {
      const enriched = await Promise.all(data.map(async (m) => {
        const partnerId = m.user_id === user.id ? m.partner_id : m.user_id;
        const { data: profile } = await supabase.rpc("get_public_profile", { profile_user_id: partnerId }).maybeSingle();
        const days = profile?.sobriety_start_date ? Math.floor((Date.now() - new Date(profile.sobriety_start_date).getTime()) / 86400000) : 0;
        return { ...m, partner_name: profile?.display_name || "Anonymous", partner_days: days };
      }));
      setMatches(enriched);
    }
    setLoading(false);
  };

  const findPartner = async () => {
    if (!user) return;
    setSearching(true);

    try {
      // Find users with similar sobriety stage - use own profile (RLS allows)
      const { data: myProfile } = await supabase.from("profiles").select("sobriety_start_date, substances").eq("user_id", user.id).maybeSingle();
      const myDays = myProfile?.sobriety_start_date ? Math.floor((Date.now() - new Date(myProfile.sobriety_start_date).getTime()) / 86400000) : 0;

      // Find potential matches (users not already matched)
      const existingIds = matches.map(m => m.user_id === user.id ? m.partner_id : m.user_id);
      existingIds.push(user.id);

      const { data: candidates } = await supabase
        .rpc("find_partner_candidates", { 
          p_user_id: user.id, 
          p_exclude_ids: existingIds,
          p_limit: 20 
        });

      if (!candidates || candidates.length === 0) {
        toast.info("No matches available yet. Check back soon!");
        setSearching(false);
        return;
      }

      // Score candidates by similarity
      const scored = candidates.map(c => {
        const cDays = c.sobriety_start_date ? Math.floor((Date.now() - new Date(c.sobriety_start_date).getTime()) / 86400000) : 0;
        const daysDiff = Math.abs(myDays - cDays);
        const substanceOverlap = (myProfile?.substances || []).filter((s: string) => (c.substances || []).includes(s)).length;
        const score = Math.max(0, 100 - daysDiff) + substanceOverlap * 20;
        const sharedGoals = substanceOverlap > 0 ? ["Shared substance recovery"] : ["Recovery support"];
        return { ...c, score, sharedGoals };
      }).sort((a, b) => b.score - a.score);

      const best = scored[0];
      const { error } = await supabase.from("partner_matches").insert({
        user_id: user.id,
        partner_id: best.user_id,
        status: "active",
        match_score: best.score,
        shared_goals: best.sharedGoals,
      });

      if (!error) {
        toast.success(`Matched with ${best.display_name || "a partner"}!`);
        loadMatches();
      }
    } catch (err) {
      toast.error("Failed to find partner");
    } finally {
      setSearching(false);
    }
  };

  const openChat = async (match: Match) => {
    setSelectedMatch(match);
    setChatOpen(true);
    const { data } = await supabase
      .from("partner_messages")
      .select("*")
      .eq("match_id", match.id)
      .order("created_at", { ascending: true })
      .limit(50);
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!user || !selectedMatch || !newMessage.trim()) return;
    const { error } = await supabase.from("partner_messages").insert({
      match_id: selectedMatch.id,
      sender_id: user.id,
      message: newMessage.trim(),
    });
    if (!error) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), sender_id: user.id, message: newMessage.trim(), created_at: new Date().toISOString() }]);
      setNewMessage("");
    }
  };

  // Premium lock is handled by PremiumLockOverlay wrapper in parent

  const activeMatches = matches.filter(m => m.status === "active");

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="card-enhanced overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-bold text-foreground">Accountability Partner</h3>
                    <Crown className="w-3 h-3 text-accent" />
                  </div>
                  <p className="text-[9px] text-muted-foreground">Recover together</p>
                </div>
              </div>
              {activeMatches.length === 0 && (
                <Button size="sm" className="h-7 text-[10px]" onClick={findPartner} disabled={searching}>
                  {searching ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <UserPlus className="w-3 h-3 mr-1" />}
                  Find Partner
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-3 text-[10px] text-muted-foreground">Loading...</div>
            ) : activeMatches.length === 0 ? (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground">No partner yet. Find someone to share your journey!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeMatches.map(match => (
                  <motion.button
                    key={match.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openChat(match)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {(match.partner_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground">{match.partner_name}</p>
                      <p className="text-[9px] text-muted-foreground">{match.partner_days} days sober • {match.match_score}% match</p>
                    </div>
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Chat Modal */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-3 pb-2 border-b border-border/50">
            <DialogTitle className="text-sm">{selectedMatch?.partner_name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
            {messages.length === 0 ? (
              <p className="text-center text-[10px] text-muted-foreground py-8">Send the first message!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] p-2 rounded-xl text-[11px] ${
                    msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 pt-2 border-t border-border/50 flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="text-xs h-8"
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <Button size="sm" className="h-8" onClick={sendMessage}>Send</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
