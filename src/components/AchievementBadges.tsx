import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, Star, Trophy, Medal, Crown, Gem, Heart, Zap, Shield, Flame, Diamond, Sparkles, Sun, Moon, Target, Rocket, Mountain, TreePine, Infinity, Share2, X, History as HistoryIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useInterstitialAd } from "./InterstitialAd";

import { badges, type Badge } from "@/lib/badges";

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

const shareToReddit = (badge: Badge, daysSober: number) => {
  const url = `https://www.reddit.com/submit?url=${encodeURIComponent(getShareUrl())}&title=${encodeURIComponent(getShareText(badge, daysSober))}`;
  window.open(url, '_blank', 'width=600,height=500');
};

const shareToMessenger = (badge: Badge, daysSober: number) => {
  const url = `https://www.facebook.com/dialog/send?app_id=140586622674265&link=${encodeURIComponent(getShareUrl())}&redirect_uri=${encodeURIComponent(getShareUrl())}`;
  window.open(url, '_blank', 'width=600,height=500');
};

const shareToEmail = (badge: Badge, daysSober: number) => {
  const subject = `I earned the "${badge.name}" sobriety badge!`;
  const body = `${getShareText(badge, daysSober)}\n\n${getShareUrl()}`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const shareToSMS = (badge: Badge, daysSober: number) => {
  const text = `${getShareText(badge, daysSober)} ${getShareUrl()}`;
  window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
};

const shareNative = async (badge: Badge, daysSober: number) => {
  const text = getShareText(badge, daysSober);
  const url = getShareUrl();
  if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
    try {
      await (navigator as Navigator).share({
        title: `${badge.name} • Sobable`,
        text,
        url,
      });
      return;
    } catch (err) {
      // User cancelled or share failed — fall through to clipboard
      if ((err as DOMException)?.name === "AbortError") return;
    }
  }
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast.success("Copied — paste it anywhere!");
  } catch {
    toast.error("Sharing not available on this device");
  }
};

const copyToClipboard = async (badge: Badge, daysSober: number) => {
  try {
    await navigator.clipboard.writeText(getShareText(badge, daysSober) + ' ' + getShareUrl());
    toast.success("Copied to clipboard!");
  } catch {
    toast.error("Failed to copy");
  }
};


interface AchievementBadgesProps {
  daysSober: number;
  startDate?: string;
}

export const AchievementBadges = ({ daysSober, startDate }: AchievementBadgesProps) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { showAd } = useInterstitialAd();
  const previousUnlockedCount = useRef<number | null>(null);

  const unlockedBadges = badges.filter((b) => daysSober >= b.daysRequired);
  const lockedBadges = badges.filter((b) => daysSober < b.daysRequired);
  const nextBadge = lockedBadges[0];
  const daysToNext = nextBadge ? nextBadge.daysRequired - daysSober : 0;

  // Compute the date a badge was reached based on startDate
  const startMs = startDate ? new Date(startDate).getTime() : null;
  const dateForBadge = (b: Badge): string | null => {
    if (!startMs) return null;
    const d = new Date(startMs + (b.daysRequired - 1) * 86400000);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };
  const historyBadges = [...unlockedBadges].reverse();

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
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                showHistory
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
              aria-pressed={showHistory}
            >
              <HistoryIcon className="w-3 h-3" />
              History
            </button>
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {unlockedBadges.length}/{badges.length}
            </span>
          </div>
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
          {showHistory ? (
            <div className="pt-1 pb-1 pr-2 space-y-1.5">
              {historyBadges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <HistoryIcon className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No milestones yet. Your achievement history will appear here.
                  </p>
                </div>
              ) : (
                historyBadges.map((badge, index) => {
                  const Icon = badge.icon;
                  const reachedOn = dateForBadge(badge);
                  return (
                    <motion.button
                      key={badge.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedBadge(badge)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 active:scale-[0.99] transition-all text-left"
                    >
                      <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${badge.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-tight truncate">{badge.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Day {badge.daysRequired}
                          {reachedOn ? ` • ${reachedOn}` : ""}
                        </p>
                      </div>
                      <Star className="w-3.5 h-3.5 text-primary shrink-0" />
                    </motion.button>
                  );
                })
              )}
            </div>
          ) : (
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
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all border min-h-[78px] ${
                    isUnlocked
                      ? "bg-gradient-to-br " + badge.color + " border-white/20 shadow-lg shadow-black/10 active:scale-95"
                      : isNextUp
                      ? "bg-muted/40 border-primary/40 border-dashed"
                      : "bg-muted/30 border-border/40 opacity-70"
                  }`}
                >
                  <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isUnlocked ? "bg-white/20" : "bg-muted/60"
                  }`}>
                    {isUnlocked ? (
                      <Icon className="w-4 h-4 text-white" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-[10px] text-center font-semibold leading-tight line-clamp-2 ${
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
                      transition={{ duration: 2, repeat: 999 }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center ring-2 ring-card"
                    >
                      <Zap className="w-2 h-2 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
            </div>
          )}
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
                    
                    {/* Reddit */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToReddit(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-[#FF4500]/10 hover:border-[#FF4500]/50"
                    >
                      <svg className="w-5 h-5" fill="#FF4500" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12.4c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                      </svg>
                      <span className="text-[10px]">Reddit</span>
                    </Button>

                    {/* Messenger */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToMessenger(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-[#0084FF]/10 hover:border-[#0084FF]/50"
                    >
                      <svg className="w-5 h-5" fill="#0084FF" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                      </svg>
                      <span className="text-[10px]">Messenger</span>
                    </Button>

                    {/* Email */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToEmail(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Mail className="w-5 h-5 text-primary" />
                      <span className="text-[10px]">Email</span>
                    </Button>

                    {/* SMS */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSMS(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-green-500/10 hover:border-green-500/50"
                    >
                      <MessageSquare className="w-5 h-5 text-green-500" />
                      <span className="text-[10px]">SMS</span>
                    </Button>

                    {/* Native share sheet (Instagram, TikTok, Snap, etc.) */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareNative(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 col-span-2 hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Share2 className="w-5 h-5 text-primary" />
                      <span className="text-[10px]">More (Instagram, TikTok…)</span>
                    </Button>

                    {/* Copy Link */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedBadge, daysSober)}
                      className="flex flex-col items-center gap-1 h-auto py-2 col-span-2 hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Copy className="w-5 h-5 text-primary" />
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
