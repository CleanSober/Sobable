import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, Copy, Check, Twitter, Facebook, MessageCircle, Award, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUserData } from "@/hooks/useUserData";
import { calculateDaysSober, calculateMoneySaved, getMilestones } from "@/lib/storage";

interface ShareCardProps {
  daysSober: number;
  moneySaved: number;
  milestone?: string;
}

const ShareCard = ({ daysSober, moneySaved, milestone }: ShareCardProps) => {
  const weeks = Math.floor(daysSober / 7);
  const months = Math.floor(daysSober / 30);

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary via-primary/90 to-emerald-600 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1" fill="currentColor" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-white/20">
            <Award className="w-5 h-5" />
          </div>
          <span className="font-semibold">Sobable</span>
        </div>

        {/* Main stat */}
        <div className="text-center mb-6">
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-6xl font-bold mb-2"
          >
            {daysSober}
          </motion.p>
          <p className="text-xl opacity-90">Days Sober</p>
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-xl bg-white/10">
            <p className="text-2xl font-bold">{weeks}</p>
            <p className="text-xs opacity-80">Weeks</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/10">
            <p className="text-2xl font-bold">{months}</p>
            <p className="text-xs opacity-80">Months</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/10">
            <p className="text-2xl font-bold">${moneySaved}</p>
            <p className="text-xs opacity-80">Saved</p>
          </div>
        </div>

        {/* Milestone badge */}
        {milestone && (
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium">
              🏆 {milestone}
            </span>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>
    </div>
  );
};

export const ProgressSharing = () => {
  const { profile } = useUserData();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const daysSober = profile?.sobriety_start_date
    ? calculateDaysSober(profile.sobriety_start_date)
    : 0;
  
  const moneySaved = profile?.sobriety_start_date && profile?.daily_spending
    ? calculateMoneySaved(profile.sobriety_start_date, profile.daily_spending)
    : 0;

  const { reached } = getMilestones(daysSober);
  const latestMilestone = reached.length > 0 ? reached[reached.length - 1] : undefined;

  const shareText = `🎉 I've been sober for ${daysSober} days! ${latestMilestone ? `Just hit my ${latestMilestone} milestone! ` : ''}Every day is a victory. #SobrietyJourney #Recovery`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Sobriety Progress",
          text: shareText,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Share2 className="w-5 h-5 text-primary" />
          Share Your Progress
        </CardTitle>
        <p className="text-sm text-muted-foreground">Celebrate and inspire others</p>
      </CardHeader>
      <CardContent>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gradient-primary">
              <Share2 className="w-4 h-4 mr-2" />
              Create Share Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Your Achievement</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Preview Card */}
              <ShareCard 
                daysSober={daysSober} 
                moneySaved={moneySaved} 
                milestone={latestMilestone} 
              />

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={shareToTwitter}
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter/X
                </Button>
                <Button
                  variant="outline"
                  onClick={shareToFacebook}
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={shareViaWebAPI}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  More Options
                </Button>
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy Text
                </Button>
              </div>

              {/* Preview text */}
              <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                {shareText}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick share for milestones */}
        {latestMilestone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  Celebrate: {latestMilestone}!
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsOpen(true)}>
                Share
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
