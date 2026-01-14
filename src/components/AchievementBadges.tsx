import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, Star, Trophy, Medal, Crown, Gem, Heart, Zap, Shield, Flame, Diamond, Sparkles, Sun, Moon, Target, Rocket, Mountain, TreePine, Infinity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  daysRequired: number;
  color: string;
}

const badges: Badge[] = [
  // First Week
  { id: "day1", name: "First Step", description: "Complete your first day sober", icon: Star, daysRequired: 1, color: "from-yellow-400 to-orange-500" },
  { id: "day2", name: "Day Two", description: "Keep the momentum going", icon: Zap, daysRequired: 2, color: "from-blue-300 to-blue-500" },
  { id: "day3", name: "Three Days Strong", description: "The hardest days are behind you", icon: Shield, daysRequired: 3, color: "from-green-400 to-teal-500" },
  { id: "day5", name: "High Five", description: "5 days of determination", icon: Heart, daysRequired: 5, color: "from-pink-400 to-rose-500" },
  { id: "week1", name: "One Week Warrior", description: "7 days of strength", icon: Shield, daysRequired: 7, color: "from-blue-400 to-cyan-500" },
  
  // First Month
  { id: "day10", name: "Double Digits", description: "10 days of progress", icon: Target, daysRequired: 10, color: "from-orange-400 to-amber-500" },
  { id: "week2", name: "Two Week Champion", description: "14 days of commitment", icon: Zap, daysRequired: 14, color: "from-purple-400 to-pink-500" },
  { id: "day21", name: "Habit Former", description: "21 days - a new habit is born", icon: Sparkles, daysRequired: 21, color: "from-violet-400 to-purple-500" },
  { id: "month1", name: "Monthly Master", description: "30 days of recovery", icon: Medal, daysRequired: 30, color: "from-green-400 to-emerald-500" },
  
  // First Quarter
  { id: "day45", name: "Halfway Hero", description: "45 days of resilience", icon: Mountain, daysRequired: 45, color: "from-slate-400 to-gray-600" },
  { id: "month2", name: "Double Down", description: "60 days strong", icon: Heart, daysRequired: 60, color: "from-red-400 to-rose-500" },
  { id: "day75", name: "75 Hard", description: "75 days of discipline", icon: Flame, daysRequired: 75, color: "from-orange-500 to-red-600" },
  { id: "month3", name: "Quarter Champion", description: "90 days of growth", icon: Trophy, daysRequired: 90, color: "from-amber-400 to-yellow-500" },
  
  // First Half Year
  { id: "day100", name: "Century Club", description: "100 days - triple digits!", icon: Crown, daysRequired: 100, color: "from-yellow-400 to-amber-500" },
  { id: "day120", name: "Four Month Force", description: "120 days of determination", icon: Rocket, daysRequired: 120, color: "from-blue-500 to-indigo-600" },
  { id: "day150", name: "150 & Thriving", description: "150 days of transformation", icon: Sun, daysRequired: 150, color: "from-amber-300 to-orange-500" },
  { id: "month6", name: "Half Year Hero", description: "180 days of transformation", icon: Crown, daysRequired: 180, color: "from-indigo-400 to-violet-500" },
  
  // First Year
  { id: "day200", name: "200 Days", description: "200 days of new life", icon: Diamond, daysRequired: 200, color: "from-cyan-400 to-blue-500" },
  { id: "day250", name: "Quarter Millennium", description: "250 days of strength", icon: TreePine, daysRequired: 250, color: "from-green-500 to-emerald-600" },
  { id: "day300", name: "300 Spartans", description: "300 days of warrior spirit", icon: Shield, daysRequired: 300, color: "from-red-500 to-orange-600" },
  { id: "year1", name: "Year One Legend", description: "365 days of new life", icon: Gem, daysRequired: 365, color: "from-pink-400 to-purple-500" },
  
  // Years 2-5
  { id: "month18", name: "18 Month Milestone", description: "548 days of inspiration", icon: Moon, daysRequired: 548, color: "from-indigo-500 to-purple-600" },
  { id: "year2", name: "Two Year Titan", description: "730 days of growth", icon: Award, daysRequired: 730, color: "from-teal-400 to-cyan-500" },
  { id: "year3", name: "Three Year Triumph", description: "1,095 days of mastery", icon: Trophy, daysRequired: 1095, color: "from-amber-500 to-yellow-600" },
  { id: "year4", name: "Four Year Force", description: "1,460 days of power", icon: Flame, daysRequired: 1460, color: "from-orange-500 to-red-500" },
  { id: "year5", name: "Half Decade Hero", description: "5 years of transformation", icon: Crown, daysRequired: 1825, color: "from-purple-500 to-pink-600" },
  
  // Years 6-10
  { id: "year6", name: "Six Year Sage", description: "6 years of wisdom", icon: Sparkles, daysRequired: 2190, color: "from-blue-400 to-indigo-500" },
  { id: "year7", name: "Seven Year Star", description: "7 years of brilliance", icon: Star, daysRequired: 2555, color: "from-yellow-400 to-orange-500" },
  { id: "year8", name: "Eight Year Elite", description: "8 years of excellence", icon: Diamond, daysRequired: 2920, color: "from-cyan-400 to-teal-500" },
  { id: "year9", name: "Nine Year Noble", description: "9 years of honor", icon: Shield, daysRequired: 3285, color: "from-violet-400 to-purple-500" },
  { id: "year10", name: "Decade of Freedom", description: "10 years - a true inspiration", icon: Gem, daysRequired: 3650, color: "from-emerald-400 to-green-600" },
  
  // Years 15-25
  { id: "year15", name: "15 Year Phoenix", description: "15 years risen from ashes", icon: Flame, daysRequired: 5475, color: "from-orange-400 to-red-600" },
  { id: "year20", name: "Two Decade Diamond", description: "20 years of unbreakable spirit", icon: Diamond, daysRequired: 7300, color: "from-blue-300 to-cyan-400" },
  { id: "year25", name: "Silver Jubilee", description: "25 years of living proof", icon: Crown, daysRequired: 9125, color: "from-gray-300 to-slate-400" },
  
  // Years 30-50
  { id: "year30", name: "Three Decade Legend", description: "30 years of legacy", icon: Trophy, daysRequired: 10950, color: "from-amber-400 to-yellow-600" },
  { id: "year40", name: "Four Decade Founder", description: "40 years of pioneering", icon: Mountain, daysRequired: 14600, color: "from-slate-500 to-gray-700" },
  { id: "year50", name: "Golden Jubilee", description: "50 years - half a century free", icon: Crown, daysRequired: 18250, color: "from-yellow-400 to-amber-600" },
  
  // Years 60-100
  { id: "year60", name: "Diamond Anniversary", description: "60 years of brilliance", icon: Diamond, daysRequired: 21900, color: "from-blue-200 to-cyan-400" },
  { id: "year75", name: "Platinum Legacy", description: "75 years of extraordinary life", icon: Gem, daysRequired: 27375, color: "from-gray-200 to-slate-400" },
  { id: "year100", name: "Century of Freedom", description: "100 years - the ultimate achievement", icon: Infinity, daysRequired: 36500, color: "from-purple-400 via-pink-500 to-amber-400" },
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
        <ScrollArea className="h-[320px] pr-2">
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
        </ScrollArea>

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
