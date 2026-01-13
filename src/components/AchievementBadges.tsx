import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, Star, Trophy, Medal, Crown, Gem, Heart, Zap, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  daysRequired: number;
  color: string;
}

const badges: Badge[] = [
  { id: "day1", name: "First Step", description: "Complete your first day sober", icon: Star, daysRequired: 1, color: "from-yellow-400 to-orange-500" },
  { id: "week1", name: "One Week Warrior", description: "7 days of strength", icon: Shield, daysRequired: 7, color: "from-blue-400 to-cyan-500" },
  { id: "week2", name: "Two Week Champion", description: "14 days of commitment", icon: Zap, daysRequired: 14, color: "from-purple-400 to-pink-500" },
  { id: "month1", name: "Monthly Master", description: "30 days of recovery", icon: Medal, daysRequired: 30, color: "from-green-400 to-emerald-500" },
  { id: "month2", name: "Double Down", description: "60 days strong", icon: Heart, daysRequired: 60, color: "from-red-400 to-rose-500" },
  { id: "month3", name: "Quarter Champion", description: "90 days of growth", icon: Trophy, daysRequired: 90, color: "from-amber-400 to-yellow-500" },
  { id: "month6", name: "Half Year Hero", description: "180 days of transformation", icon: Crown, daysRequired: 180, color: "from-indigo-400 to-violet-500" },
  { id: "year1", name: "Year One Legend", description: "365 days of new life", icon: Gem, daysRequired: 365, color: "from-pink-400 to-purple-500" },
  { id: "year2", name: "Two Year Titan", description: "730 days of inspiration", icon: Award, daysRequired: 730, color: "from-teal-400 to-cyan-500" },
];

interface AchievementBadgesProps {
  daysSober: number;
}

export const AchievementBadges = ({ daysSober }: AchievementBadgesProps) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const unlockedBadges = badges.filter((b) => daysSober >= b.daysRequired);
  const lockedBadges = badges.filter((b) => daysSober < b.daysRequired);
  const nextBadge = lockedBadges[0];
  const daysToNext = nextBadge ? nextBadge.daysRequired - daysSober : 0;

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-primary" />
          Achievement Badges
        </CardTitle>
        {nextBadge && (
          <p className="text-sm text-muted-foreground">
            {daysToNext} days until <span className="text-primary font-medium">{nextBadge.name}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge, index) => {
            const isUnlocked = daysSober >= badge.daysRequired;
            const Icon = badge.icon;

            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedBadge(badge)}
                className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
                  isUnlocked
                    ? "bg-gradient-to-br " + badge.color + " shadow-lg hover:scale-105"
                    : "bg-muted/50 opacity-50"
                }`}
              >
                {isUnlocked ? (
                  <Icon className="w-8 h-8 text-white mb-1" />
                ) : (
                  <Lock className="w-8 h-8 text-muted-foreground mb-1" />
                )}
                <span className={`text-xs text-center font-medium ${isUnlocked ? "text-white" : "text-muted-foreground"}`}>
                  {badge.name}
                </span>
                {isUnlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Star className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedBadge.color}`}>
                  <selectedBadge.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedBadge.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedBadge.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {daysSober >= selectedBadge.daysRequired
                      ? "✅ Unlocked!"
                      : `🔒 ${selectedBadge.daysRequired - daysSober} days to go`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
