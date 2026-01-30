import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, MessageSquare, Heart, UserPlus, AtSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  reply: MessageSquare,
  like: Heart,
  follow: UserPlus,
  default: Bell,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  mention: "text-blue-500 bg-blue-500/10",
  reply: "text-green-500 bg-green-500/10",
  like: "text-pink-500 bg-pink-500/10",
  follow: "text-purple-500 bg-purple-500/10",
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
      case "follow": return "New follower";
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} new</Badge>
              )}
            </SheetTitle>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground/70">
                We'll notify you when something happens
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {notifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.notification_type);
                  const colorClass = getNotificationColor(notification.notification_type);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className={`relative p-3 rounded-lg border transition-colors ${
                        notification.is_read
                          ? "bg-background border-border/50"
                          : "bg-primary/5 border-primary/20"
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {getNotificationTitle(notification.notification_type)}
                          </p>
                          {notification.content_preview && (
                            <p className="text-sm text-muted-foreground truncate">
                              {notification.content_preview}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>

                      {!notification.is_read && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
