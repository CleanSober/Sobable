import { motion } from "framer-motion";
import { Phone, BookHeart, Timer, MessageCircle } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
}

export const QuickActions = () => {
  const { profile } = useUserData();

  const actions: QuickAction[] = [
    {
      id: "sponsor",
      label: "Call Sponsor",
      icon: Phone,
      color: "from-green-400 to-emerald-500",
      action: () => {
        if (profile?.sponsor_phone) {
          window.location.href = `tel:${profile.sponsor_phone}`;
        } else {
          toast.info("Add your sponsor's number in settings");
        }
      }
    },
    {
      id: "reminder",
      label: "My Why",
      icon: BookHeart,
      color: "from-pink-400 to-rose-500",
      action: () => {
        if (profile?.personal_reminder) {
          toast.success(profile.personal_reminder, {
            duration: 5000,
            icon: "💪"
          });
        } else {
          toast.info("Add your personal reminder in settings");
        }
      }
    },
    {
      id: "breathe",
      label: "Breathe",
      icon: Timer,
      color: "from-blue-400 to-cyan-500",
      action: () => {
        toast.info("Starting breathing exercise...", {
          duration: 2000,
          icon: "🧘"
        });
        // Could trigger a breathing exercise modal
      }
    },
    {
      id: "support",
      label: "Get Help",
      icon: MessageCircle,
      color: "from-purple-400 to-violet-500",
      action: () => {
        window.location.href = "tel:988";
      }
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.action}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
