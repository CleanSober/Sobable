import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Users, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  useUserProfiles, 
  useTypingIndicator,
  ChatMessage, 
  validateMessageLength,
  createMentionNotifications
} from "@/hooks/useCommunity";
import { useCommunityBot } from "@/hooks/useCommunityBot";

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
}
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { MentionInput } from "./MentionInput";
import { ChatRoomSelector } from "./ChatRoomSelector";
import { OnlineUsers } from "./OnlineUsers";

const MAX_MESSAGE_LENGTH = 2000;

export const LiveChat = () => {
  const { user } = useAuth();
  const { fetchProfiles, getDisplayNameForUser, getAllProfiles } = useUserProfiles();
  const { triggerBotReply } = useCommunityBot();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get current user's display name for typing indicator
  const currentUserDisplayName = user ? getDisplayNameForUser(user.id) : "";
  
  // Typing indicator hook
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(room?.id || "");

  useEffect(() => {
    fetchRoom();
  }, []);

  useEffect(() => {
    if (!room) return;

    fetchMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat-messages-${room.id}`)
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
          await fetchProfiles([newMsg.user_id]);
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, fetchProfiles]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const fetchRoom = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("id, name, description")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) setRoom(data);
    } catch (err) {
      setError("Failed to load chat room");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!room) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, user_id, message, created_at, room_id")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      
      if (data) {
        setMessages(data);
        const userIds = [...new Set(data.map((m) => m.user_id))];
        await fetchProfiles(userIds);
      }
    } catch {
      setError("Failed to load messages");
    }
  }, [room?.id, fetchProfiles]);

  const handleRoomChange = useCallback((newRoom: ChatRoom) => {
    setRoom(newRoom);
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    
    if (!trimmedMessage || !user || !room) return;
    
    if (!validateMessageLength(trimmedMessage, MAX_MESSAGE_LENGTH)) {
      toast.error(`Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setSending(true);
    stopTyping(currentUserDisplayName);
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: room.id,
          user_id: user.id,
          message: trimmedMessage,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create mention notifications
      await createMentionNotifications(
        trimmedMessage,
        user.id,
        "chat_message",
        data.id,
        getAllProfiles()
      );
      
      // Trigger bot auto-reply after random delay (1-5 min)
      triggerBotReply({
        content: trimmedMessage,
        targetId: data.id,
        targetType: "chat_message",
      });
      
      setNewMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    if (value.trim()) {
      startTyping(currentUserDisplayName);
    } else {
      stopTyping(currentUserDisplayName);
    }
  };

  const isOwnMessage = (userId: string) => userId === user?.id;
  const remainingChars = MAX_MESSAGE_LENGTH - newMessage.length;
  const isNearLimit = remainingChars < 100;

  if (loading) {
    return (
      <Card className="gradient-card border-border/50 h-[60dvh]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !room) {
    return (
      <Card className="gradient-card border-destructive/50 h-[60dvh]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchRoom}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50 overflow-hidden flex flex-col" style={{ height: 'calc(100dvh - 11rem)' }}>
      <CardHeader className="pb-1.5 pt-2 px-2.5 border-b border-border/30 space-y-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <MessageCircle className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            Live Chat
          </CardTitle>
          <OnlineUsers roomId={room?.id} />
        </div>
        
        <ChatRoomSelector
          currentRoom={room}
          onSelectRoom={handleRoomChange}
        />
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="space-y-1.5 p-2">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" aria-hidden="true" />
                <p className="font-medium text-sm">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    id={msg.id}
                    message={msg.message}
                    createdAt={msg.created_at}
                    displayName={getDisplayNameForUser(msg.user_id)}
                    userId={msg.user_id}
                    isOwn={isOwnMessage(msg.user_id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* Typing indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <TypingIndicator typingUsers={typingUsers} />
          )}
        </AnimatePresence>

        <div className="p-2 border-t border-border/50 bg-card/50 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <MentionInput
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={sending}
                maxLength={MAX_MESSAGE_LENGTH}
                profiles={getAllProfiles()}
                aria-label="Message input"
                className={isNearLimit ? "pr-12" : ""}
              />
              {isNearLimit && (
                <span 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] ${
                    remainingChars < 20 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {remainingChars}
                </span>
              )}
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || sending} 
              size="icon"
              className="gradient-primary text-primary-foreground h-9 w-9"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};