import { motion } from "framer-motion";
import { Phone, BookHeart, Wind, MessageCircle, Sparkles } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";
import { makePhoneCall, hapticSuccess } from "@/lib/nativeActions";

interface QuickActionsProps {
  onNavigateToCheckIn?: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
  action: () => void;
}

export const QuickActions = ({ onNavigateToCheckIn }: QuickActionsProps) => {
  const { profile } = useUserData();

  const actions: QuickAction[] = [
    {
      id: "sponsor",
      label: "Call Sponsor",
      icon: Phone,
      gradient: "from-emerald-400 to-teal-500",
      glowColor: "168 84% 45%",
      action: async () => {
        if (profile?.sponsor_phone) {
          await makePhoneCall(profile.sponsor_phone);
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
      action: async () => {
        if (profile?.personal_reminder) {
          await hapticSuccess();
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
      icon: Wind,
      gradient: "from-blue-400 to-cyan-500",
      glowColor: "190 90% 50%",
      action: () => {
        if (onNavigateToCheckIn) {
          onNavigateToCheckIn();
          // Delay scroll to let check-in tab render
          setTimeout(() => {
            document.querySelector('[data-breathing-exercise]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 400);
        }
      }
    },
    {
      id: "support",
      label: "Get Help",
      icon: MessageCircle,
      gradient: "from-violet-400 to-purple-500",
      glowColor: "270 76% 55%",
      action: () => {
        toast("988 Suicide & Crisis Lifeline", {
          description: "Call or text 988 for 24/7 free support",
          duration: 8000,
          icon: "🆘",
          action: {
            label: "Call 988",
            onClick: () => makePhoneCall("988"),
          },
        });
      }
    }
  ];

  return (
    <div className="card-enhanced p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={action.action}
              className="group flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl bg-secondary/40 active:bg-secondary/70 border border-transparent active:border-border/50 transition-all duration-200 min-w-[72px] snap-start flex-shrink-0"
            >
              <div 
                className={`relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg transition-all duration-300`}
                style={{
                  boxShadow: `0 6px 16px -4px hsl(${action.glowColor} / 0.3)`
                }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight text-center">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
