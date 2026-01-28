import { motion } from "framer-motion";
import { Phone, BookHeart, Timer, MessageCircle, Sparkles } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
  action: () => void;
}

export const QuickActions = () => {
  const { profile } = useUserData();

  const actions: QuickAction[] = [
    {
      id: "sponsor",
      label: "Call Sponsor",
      icon: Phone,
      gradient: "from-emerald-400 to-teal-500",
      glowColor: "168 84% 45%",
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
      gradient: "from-pink-400 to-rose-500",
      glowColor: "340 82% 52%",
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
      gradient: "from-blue-400 to-cyan-500",
      glowColor: "190 90% 50%",
      action: () => {
        toast.info("Starting breathing exercise...", {
          duration: 2000,
          icon: "🧘"
        });
      }
    },
    {
      id: "support",
      label: "Get Help",
      icon: MessageCircle,
      gradient: "from-violet-400 to-purple-500",
      glowColor: "270 76% 55%",
      action: () => {
        window.location.href = "tel:988";
      }
    }
  ];

  return (
    <div className="card-enhanced p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 border border-transparent hover:border-border/50 transition-all duration-300"
            >
              <div 
                className={`relative p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg transition-all duration-300`}
                style={{
                  boxShadow: `0 8px 20px -4px hsl(${action.glowColor} / 0.3)`
                }}
              >
                <Icon className="w-5 h-5 text-white" />
                
                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10"
                  style={{ background: `linear-gradient(to bottom right, hsl(${action.glowColor}), hsl(${action.glowColor} / 0.5))` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
