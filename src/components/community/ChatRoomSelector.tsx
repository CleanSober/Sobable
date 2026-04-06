import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Users, Plus, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
}

interface ChatRoomSelectorProps {
  currentRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
}

export const ChatRoomSelector = memo(({ currentRoom, onSelectRoom }: ChatRoomSelectorProps) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("id, name, description")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data) setRooms(data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!user || !newRoomName.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .insert({
          name: newRoomName.trim(),
          description: newRoomDescription.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Chat room created!");
      setShowCreateDialog(false);
      setNewRoomName("");
      setNewRoomDescription("");
      await fetchRooms();
      
      if (data) {
        onSelectRoom(data);
      }
    } catch (err) {
      toast.error("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-24 h-8 bg-secondary/50 animate-pulse rounded-lg" />
        <div className="w-24 h-8 bg-secondary/50 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Room tabs */}
      <ScrollArea className="w-full">
        <div className="flex items-start gap-2 pb-2 overflow-x-auto">
          {rooms.map((room) => {
            const isActive = currentRoom?.id === room.id;
            return (
              <motion.button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-secondary/50 hover:bg-secondary text-foreground"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                {room.name}
                {isActive && <Check className="w-3.5 h-3.5" />}
              </motion.button>
            );
          })}

          {/* Create room button */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-dashed"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Create Chat Room
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g., Evening Support Group"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-description">Description (optional)</Label>
                  <Textarea
                    id="room-description"
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    placeholder="What is this room about?"
                    rows={3}
                    maxLength={200}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!newRoomName.trim() || creating}
                    className="gradient-primary text-primary-foreground"
                  >
                    {creating ? "Creating..." : "Create Room"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </ScrollArea>

      {/* Current room description */}
      {currentRoom?.description && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-sm text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2"
        >
          {currentRoom.description}
        </motion.div>
      )}
    </div>
  );
});

ChatRoomSelector.displayName = "ChatRoomSelector";