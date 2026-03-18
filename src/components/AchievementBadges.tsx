import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, Star, Trophy, Medal, Crown, Gem, Heart, Zap, Shield, Flame, Diamond, Sparkles, Sun, Moon, Target, Rocket, Mountain, TreePine, Infinity, Share2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useInterstitialAd } from "./InterstitialAd";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  daysRequired: number;
  color: string;
}

// Social media sharing utilities
const getShareText = (badge: Badge, daysSober: number) => {
  return `🎉 I just earned the "${badge.name}" badge! ${daysSober} days sober and counting. ${badge.description} #Sobriety #Recovery #Progress`;
};

const getShareUrl = () => {
  return window.location.origin;
};

const shareToFacebook = (badge: Badge, daysSober: number) => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}&quote=${encodeURIComponent(getShareText(badge, daysSober))}`;
  window.open(url, '_blank', 'width=600,height=400');
};

const shareToTwitter = (badge: Badge, daysSober: number) => {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(badge, daysSober))}&url=${encodeURIComponent(getShareUrl())}`;
  window.open(url, '_blank', 'width=600,height=400');
};

const shareToLinkedIn = (badge: Badge, daysSober: number) => {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}&summary=${encodeURIComponent(getShareText(badge, daysSober))}`;
  window.open(url, '_blank', 'width=600,height=400');
};

const shareToWhatsApp = (badge: Badge, daysSober: number) => {
  const url = `https://wa.me/?text=${encodeURIComponent(getShareText(badge, daysSober) + ' ' + getShareUrl())}`;
  window.open(url, '_blank', 'width=600,height=400');
};

const shareToTelegram = (badge: Badge, daysSober: number) => {
  const url = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareText(badge, daysSober))}`;
  window.open(url, '_blank', 'width=600,height=400');
};

const shareToPinterest = (badge: Badge, daysSober: number) => {
  const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(getShareUrl())}&description=${encodeURIComponent(getShareText(badge, daysSober))}`;
  window.open(url, '_blank', 'width=600,height=400');
};

const copyToClipboard = async (badge: Badge, daysSober: number) => {
  try {
    await navigator.clipboard.writeText(getShareText(badge, daysSober) + ' ' + getShareUrl());
    toast.success("Copied to clipboard!");
  } catch {
    toast.error("Failed to copy");
  }
};

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
  const { showAd } = useInterstitialAd();
  const previousUnlockedCount = useRef<number | null>(null);

  const unlockedBadges = badges.filter((b) => daysSober >= b.daysRequired);
  const lockedBadges = badges.filter((b) => daysSober < b.daysRequired);
  const nextBadge = lockedBadges[0];
  const daysToNext = nextBadge ? nextBadge.daysRequired - daysSober : 0;

  // Show interstitial ad when a new badge is unlocked
  useEffect(() => {
    const currentUnlockedCount = unlockedBadges.length;
    
    // Only trigger if we have a previous count and it increased
    if (previousUnlockedCount.current !== null && currentUnlockedCount > previousUnlockedCount.current) {
      const newBadge = unlockedBadges[currentUnlockedCount - 1];
      toast.success(`🎉 New badge unlocked: ${newBadge.name}!`);
      
      // Show interstitial ad after unlocking a new achievement (natural break point)
      setTimeout(() => {
        showAd();
      }, 2000);
    }
    
    previousUnlockedCount.current = currentUnlockedCount;
  }, [unlockedBadges.length, showAd]);

  return (
    <Card className="gradient-card border-border/50 overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-primary" />
            Achievement Badges
          </CardTitle>
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {unlockedBadges.length}/{badges.length}
          </span>
        </div>
        {nextBadge && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                initial={{ width: 0 }}
                animate={{ width: `${((nextBadge.daysRequired - daysToNext) / nextBadge.daysRequired) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              {daysToNext}d → <span className="text-primary font-medium">{nextBadge.name}</span>
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <ScrollArea className="h-[280px]">
          <div className="grid grid-cols-4 gap-2 pt-1 pb-1 pr-2">
          {badges.map((badge, index) => {
            const isUnlocked = daysSober >= badge.daysRequired;
            const Icon = badge.icon;
            const isNextUp = nextBadge?.id === badge.id;

            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.015 }}
                onClick={() => setSelectedBadge(badge)}
                className={`relative flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all border ${
                  isUnlocked
                    ? "bg-gradient-to-br " + badge.color + " border-white/20 shadow-lg shadow-black/10 active:scale-95"
                    : isNextUp
                    ? "bg-muted/30 border-primary/30 border-dashed"
                    : "bg-muted/20 border-transparent opacity-40"
                }`}
              >
                <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center ${
                  isUnlocked ? "bg-white/20" : "bg-muted/50"
                }`}>
                  {isUnlocked ? (
                    <Icon className="w-4 h-4 text-white" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <span className={`text-[7px] text-center font-semibold leading-tight line-clamp-2 ${
                  isUnlocked ? "text-white" : "text-muted-foreground"
                }`}>
                  {badge.name}
                </span>
                {isUnlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-card"
                  >
                    <Star className="w-2 h-2 text-white" />
                  </motion.div>
                )}
                {isNextUp && !isUnlocked && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center ring-2 ring-card"
                  >
                    <Zap className="w-2 h-2 text-primary-foreground" />
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
              <div className="flex items-center justify-between">
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
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              
              {/* Social Share Buttons - Only show for unlocked badges */}
              {daysSober >= selectedBadge.daysRequired && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Share2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Share your achievement</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Facebook */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToFacebook(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50"
                    >
                      <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-[10px]">Facebook</span>
                    </Button>
                    
                    {/* X/Twitter */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToTwitter(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-foreground/10 hover:border-foreground/50"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-[10px]">X</span>
                    </Button>
                    
                    {/* LinkedIn */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToLinkedIn(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/50"
                    >
                      <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="text-[10px]">LinkedIn</span>
                    </Button>
                    
                    {/* WhatsApp */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToWhatsApp(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-[#25D366]/10 hover:border-[#25D366]/50"
                    >
                      <svg className="w-5 h-5" fill="#25D366" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-[10px]">WhatsApp</span>
                    </Button>
                    
                    {/* Telegram */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToTelegram(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-[#0088cc]/10 hover:border-[#0088cc]/50"
                    >
                      <svg className="w-5 h-5" fill="#0088cc" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      <span className="text-[10px]">Telegram</span>
                    </Button>
                    
                    {/* Pinterest */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToPinterest(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-[#E60023]/10 hover:border-[#E60023]/50"
                    >
                      <svg className="w-5 h-5" fill="#E60023" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                      </svg>
                      <span className="text-[10px]">Pinterest</span>
                    </Button>
                    
                    {/* Copy Link */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 col-span-2 hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Share2 className="w-5 h-5 text-primary" />
                      <span className="text-[10px]">Copy Message</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
