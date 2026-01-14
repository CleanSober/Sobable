import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, MessageCircle, Heart, AtSign, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications, formatTimeAgo, Notification } from "@/hooks/useCommunity";
import { usePremiumStatus } from "@/hooks/useCommunity";

const getNotificationIcon = (type: Notification["notification_type"]) => {
  switch (type) {
    case "mention":
      return <AtSign className="w-4 h-4 text-primary" />;
    case "reply":
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case "reaction":
      return <Heart className="w-4 h-4 text-pink-500" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getNotificationText = (notification: Notification) => {
  switch (notification.notification_type) {
    case "mention":
      return "mentioned you";
    case "reply":
      return "replied to your post";
    case "reaction":
      return "reacted to your post";
    default:
      return "sent you a notification";
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = memo(({ notification, onMarkAsRead }: NotificationItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        notification.is_read
          ? "bg-transparent opacity-60"
          : "bg-primary/5 hover:bg-primary/10"
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        {getNotificationIcon(notification.notification_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium">Someone</span>{" "}
          {getNotificationText(notification)}
        </p>
        {notification.content_preview && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            "{notification.content_preview}"
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
      {!notification.is_read && (
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
          aria-label="Mark as read"
        >
          <Check className="w-3.5 h-3.5" />
        </Button>
      )}
    </motion.div>
  );
});

NotificationItem.displayName = "NotificationItem";

export const NotificationsBell = memo(() => {
  const { isPremium } = usePremiumStatus();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Only show for premium users
  if (!isPremium) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">
                You'll see mentions and replies here
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Showing last {notifications.length} notifications
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

NotificationsBell.displayName = "NotificationsBell";
