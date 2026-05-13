import { Award, Star, Trophy, Medal, Crown, Gem, Heart, Zap, Shield, Flame, Diamond, Sparkles, Sun, Moon, Target, Rocket, Mountain, TreePine, Infinity as InfinityIcon } from "lucide-react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  daysRequired: number;
  color: string;
}

export const badges: Badge[] = [
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

  // Years 11-14
  { id: "year11", name: "Eleven Year Ember", description: "11 years burning bright", icon: Flame, daysRequired: 4015, color: "from-orange-400 to-amber-500" },
  { id: "year12", name: "Twelve Year Titan", description: "12 years of strength", icon: Mountain, daysRequired: 4380, color: "from-slate-400 to-stone-500" },
  { id: "year13", name: "Thirteen Year Beacon", description: "13 years of guiding light", icon: Sun, daysRequired: 4745, color: "from-yellow-300 to-orange-400" },
  { id: "year14", name: "Fourteen Year Force", description: "14 years of resolve", icon: Zap, daysRequired: 5110, color: "from-indigo-400 to-blue-500" },

  // Years 15-19
  { id: "year15", name: "15 Year Phoenix", description: "15 years risen from ashes", icon: Flame, daysRequired: 5475, color: "from-orange-400 to-red-600" },
  { id: "year16", name: "Sixteen Year Sentinel", description: "16 years standing tall", icon: Shield, daysRequired: 5840, color: "from-teal-400 to-cyan-600" },
  { id: "year17", name: "Seventeen Year Spark", description: "17 years of inspiration", icon: Sparkles, daysRequired: 6205, color: "from-pink-400 to-rose-500" },
  { id: "year18", name: "Eighteen Year Elder", description: "18 years of wisdom", icon: Moon, daysRequired: 6570, color: "from-indigo-500 to-purple-600" },
  { id: "year19", name: "Nineteen Year Noble", description: "19 years of honor", icon: Crown, daysRequired: 6935, color: "from-amber-400 to-yellow-500" },

  // Years 20-29
  { id: "year20", name: "Two Decade Diamond", description: "20 years of unbreakable spirit", icon: Diamond, daysRequired: 7300, color: "from-blue-300 to-cyan-400" },
  { id: "year21", name: "Twenty-One Year Ace", description: "21 years of mastery", icon: Star, daysRequired: 7665, color: "from-yellow-400 to-amber-500" },
  { id: "year22", name: "Twenty-Two Year Beacon", description: "22 years lighting the way", icon: Sun, daysRequired: 8030, color: "from-orange-300 to-amber-400" },
  { id: "year23", name: "Twenty-Three Year Sage", description: "23 years of wisdom", icon: TreePine, daysRequired: 8395, color: "from-green-500 to-emerald-600" },
  { id: "year24", name: "Twenty-Four Year Titan", description: "24 years of greatness", icon: Mountain, daysRequired: 8760, color: "from-slate-500 to-gray-600" },
  { id: "year25", name: "Silver Jubilee", description: "25 years of living proof", icon: Crown, daysRequired: 9125, color: "from-gray-300 to-slate-400" },
  { id: "year26", name: "Twenty-Six Year Star", description: "26 years shining on", icon: Star, daysRequired: 9490, color: "from-cyan-400 to-blue-500" },
  { id: "year27", name: "Twenty-Seven Year Spirit", description: "27 years unbroken", icon: Heart, daysRequired: 9855, color: "from-rose-400 to-pink-500" },
  { id: "year28", name: "Twenty-Eight Year Elite", description: "28 years of excellence", icon: Award, daysRequired: 10220, color: "from-violet-400 to-purple-500" },
  { id: "year29", name: "Twenty-Nine Year Anchor", description: "29 years steady and strong", icon: Shield, daysRequired: 10585, color: "from-blue-500 to-indigo-600" },

  // Years 30-50
  { id: "year30", name: "Three Decade Legend", description: "30 years of legacy", icon: Trophy, daysRequired: 10950, color: "from-amber-400 to-yellow-600" },
  { id: "year40", name: "Four Decade Founder", description: "40 years of pioneering", icon: Mountain, daysRequired: 14600, color: "from-slate-500 to-gray-700" },
  { id: "year50", name: "Golden Jubilee", description: "50 years - half a century free", icon: Crown, daysRequired: 18250, color: "from-yellow-400 to-amber-600" },

  // Years 60-100
  { id: "year60", name: "Diamond Anniversary", description: "60 years of brilliance", icon: Diamond, daysRequired: 21900, color: "from-blue-200 to-cyan-400" },
  { id: "year75", name: "Platinum Legacy", description: "75 years of extraordinary life", icon: Gem, daysRequired: 27375, color: "from-gray-200 to-slate-400" },
  { id: "year100", name: "Century of Freedom", description: "100 years - the ultimate achievement", icon: InfinityIcon, daysRequired: 36500, color: "from-purple-400 via-pink-500 to-amber-400" },
];

export const getLatestBadge = (daysSober: number): Badge | null => {
  let latest: Badge | null = null;
  for (const b of badges) {
    if (daysSober >= b.daysRequired) latest = b;
    else break;
  }
  return latest;
};
