import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, MessageSquare, Heart, UserPlus, AtSign, X, MessageCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";

interface Notification {
  id: string;
  notification_type: string;
  target_type: string;
  target_id: string;
  from_user_id: string;
  content_preview: string | null;
  is_read: boolean;
  created_at: string;
}

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  mention: AtSign,
  reply: MessageCircle,
  like: Heart,
  reaction: Heart,
  follow: UserPlus,
  chat_message: MessageSquare,
  forum_post: MessageSquare,
  default: Bell,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  mention: "text-blue-500 bg-blue-500/10",
  reply: "text-green-500 bg-green-500/10",
  like: "text-pink-500 bg-pink-500/10",
  reaction: "text-pink-500 bg-pink-500/10",
  follow: "text-purple-500 bg-purple-500/10",
  chat_message: "text-teal-500 bg-teal-500/10",
  forum_post: "text-amber-500 bg-amber-500/10",
  default: "text-primary bg-primary/10",
};

export const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast.info(getNotificationTitle(newNotification.notification_type), {
            description: newNotification.content_preview || "New notification",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = async () => {
    if (!user) return;

    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case "mention": return "You were mentioned";
      case "reply": return "New reply";
      case "like": return "Someone liked your post";
      case "reaction": return "New reaction";
      case "follow": return "New follower";
      case "chat_message": return "New chat message";
      case "forum_post": return "New forum activity";
      default: return "Notification";
    }
  };

  const getNotificationIcon = (type: string) => {
    return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
  };

  const getNotificationColor = (type: string) => {
    return NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.default;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-96 p-0 bg-background border border-border shadow-xl z-50" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex gap-2 p-2 border-b border-border bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs h-7 flex-1"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7 flex-1">
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear all
            </Button>
          </div>
        )}

        {/* Notifications list */}
        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                You'll see mentions, replies & more here
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.notification_type);
                  const colorClass = getNotificationColor(notification.notification_type);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className={`group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        notification.is_read
                          ? "bg-transparent hover:bg-muted/50 opacity-70"
                          : "bg-primary/5 hover:bg-primary/10"
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {getNotificationTitle(notification.notification_type)}
                        </p>
                        {notification.content_preview && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            "{notification.content_preview}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        aria-label="Delete notification"
                      >
                        <X className="w-3 h-3" />
                      </Button>

                      {!notification.is_read && (
                        <div className="absolute top-3 right-10 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border bg-muted/20">
            <p className="text-xs text-center text-muted-foreground">
              Showing last {Math.min(notifications.length, 50)} notifications
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
