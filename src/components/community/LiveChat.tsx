import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getDisplayName, getInitials, getAvatarColor } from "@/lib/anonymousNames";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
}

interface UserProfile {
  user_id: string;
  display_name: string | null;
}

export const LiveChat = () => {
  const { user } = useAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRoom();
  }, []);

  useEffect(() => {
    if (!room) return;

    fetchMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${room.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Fetch profile for new message if not cached
          if (!profiles.has(newMsg.user_id)) {
            await fetchProfileForUser(newMsg.user_id);
          }
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchRoom = async () => {
    const { data, error } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (!error && data) {
      setRoom(data);
    }
    setLoading(false);
  };

  const fetchProfileForUser = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .eq("user_id", userId)
      .single();

    if (data) {
      setProfiles((prev) => new Map(prev).set(userId, data));
    }
  };

  const fetchMessages = async () => {
    if (!room) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", room.id)
      .order("created_at", { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data);
      
      // Fetch all unique user profiles
      const userIds = [...new Set(data.map((m) => m.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      if (profilesData) {
        const profileMap = new Map<string, UserProfile>();
        profilesData.forEach((p) => profileMap.set(p.user_id, p));
        setProfiles(profileMap);
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !room) return;

    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      room_id: room.id,
      user_id: user.id,
      message: newMessage.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isOwnMessage = (userId: string) => userId === user?.id;

  const getUserDisplayName = (userId: string) => {
    const profile = profiles.get(userId);
    return getDisplayName(profile?.display_name, userId);
  };

  if (loading) {
    return (
      <Card className="gradient-card border-border/50 h-[500px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-primary" />
          {room?.name || "Live Chat"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{room?.description}</p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px] px-4" ref={scrollRef}>
          <div className="space-y-3 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => {
                  const displayName = getUserDisplayName(msg.user_id);
                  const isOwn = isOwnMessage(msg.user_id);
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        <div 
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(msg.user_id)}`}
                        >
                          {getInitials(displayName)}
                        </div>
                        
                        {/* Message bubble */}
                        <div>
                          {/* Username */}
                          <p className={`text-xs font-medium mb-1 ${isOwn ? "text-right" : "text-left"} text-muted-foreground`}>
                            {isOwn ? "You" : displayName}
                          </p>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-secondary text-secondary-foreground rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim() || sending} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
