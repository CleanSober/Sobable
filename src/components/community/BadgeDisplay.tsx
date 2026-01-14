import { motion } from "framer-motion";
import { BADGE_DEFINITIONS, UserBadge } from "@/hooks/useForumFeatures";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  badges: UserBadge[];
  compact?: boolean;
}

export const BadgeDisplay = ({ badges, compact = false }: BadgeDisplayProps) => {
  if (badges.length === 0) return null;

  const getBadgeIcon = (badgeType: string) => {
    return BADGE_DEFINITIONS[badgeType as keyof typeof BADGE_DEFINITIONS]?.icon || "🏆";
  };

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-0.5">
          {badges.slice(0, 3).map((badge, index) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-xs cursor-help"
                >
                  {getBadgeIcon(badge.badge_type)}
                </motion.span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{badge.badge_name}</p>
                <p className="text-xs text-muted-foreground">{badge.badge_description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {badges.length > 3 && (
            <span className="text-xs text-muted-foreground ml-1">+{badges.length - 3}</span>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/50 border border-border/50 cursor-help hover:bg-secondary/80 transition-colors"
              >
                <span className="text-sm">{getBadgeIcon(badge.badge_type)}</span>
                <span className="text-xs font-medium">{badge.badge_name}</span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{badge.badge_description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Earned {new Date(badge.earned_at).toLocaleDateString()}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
