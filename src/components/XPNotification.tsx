import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import { useState, useCallback, createContext, useContext } from "react";

interface XPNotification {
  id: string;
  amount: number;
  source: string;
  levelUp?: { level: number; title: string };
}

interface XPNotificationContextType {
  showXPGain: (amount: number, source: string, levelUp?: { level: number; title: string }) => void;
}

const XPNotificationContext = createContext<XPNotificationContextType | null>(null);

export const useXPNotification = () => {
  const context = useContext(XPNotificationContext);
  if (!context) {
    throw new Error("useXPNotification must be used within XPNotificationProvider");
  }
  return context;
};

export const XPNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  const showXPGain = useCallback(
    (amount: number, source: string, levelUp?: { level: number; title: string }) => {
      const id = Math.random().toString(36).substring(7);
      setNotifications((prev) => [...prev, { id, amount, source, levelUp }]);

      // Auto-remove after animation
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    },
    []
  );

  return (
    <XPNotificationContext.Provider value={{ showXPGain }}>
      {children}
      <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.8 }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <div>
                <p className="font-bold">+{notification.amount} XP</p>
                <p className="text-xs text-white/80 capitalize">
                  {notification.source.replace(/_/g, " ")}
                </p>
              </div>
              {notification.levelUp && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="ml-2 bg-white/20 rounded-lg px-2 py-1"
                >
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Level {notification.levelUp.level}!
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </XPNotificationContext.Provider>
  );
};
