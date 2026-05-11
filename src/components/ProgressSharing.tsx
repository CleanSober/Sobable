import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, Twitter, Facebook, Linkedin, Instagram, Music2, MessageCircle, Award, Download, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUserData } from "@/hooks/useUserData";
import { calculateDaysSober, calculateMoneySaved, getMilestones } from "@/lib/storage";
import { copyText } from "@/lib/clipboard";

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
  const [editedCaption, setEditedCaption] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const daysSober = profile?.sobriety_start_date
    ? calculateDaysSober(profile.sobriety_start_date)
    : 0;
  
  const moneySaved = profile?.sobriety_start_date && profile?.daily_spending
    ? calculateMoneySaved(profile.sobriety_start_date, profile.daily_spending)
    : 0;

  const { reached } = getMilestones(daysSober);
  const latestMilestone = reached.length > 0 ? reached[reached.length - 1] : undefined;

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://sobable.lovable.app";

  const defaultShareText = `🎉 I've been sober for ${daysSober} days! ${latestMilestone ? `Just hit my ${latestMilestone} milestone! ` : ''}Every day is a victory with @Sobable. #SobrietyJourney #Recovery`;
  const shareText = editedCaption ?? defaultShareText;

  const copyToClipboard = async (silent = false) => {
    const result = await copyText(shareText);
    if (result.ok) {
      if (!silent) {
        setCopied(true);
        toast.success(result.message);
        setTimeout(() => setCopied(false), 2000);
      }
      return true;
    }
    if (!silent) {
      toast.error(result.message, {
        duration: 6000,
        action: {
          label: "Show text",
          onClick: () => {
            const ta = document.getElementById("share-caption-textarea") as HTMLTextAreaElement | null;
            ta?.focus();
            ta?.select();
          },
        },
      });
    }
    return false;
  };

  const openWith = async (url: string, platform: string, instruction = "Caption copied — paste it into your post!") => {
    const ok = await copyToClipboard(true);
    if (ok) {
      toast.success(`${platform} opened. ${instruction}`);
    } else {
      toast.warning(`${platform} opened, but couldn't copy the caption — copy it manually from the editor.`, { duration: 6000 });
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    openWith(url, "X (Twitter)", "Text is pre-filled and also copied as backup.");
  };

  const shareToFacebook = () => {
    // Facebook ignores `quote` unless the URL has OG tags, so we always copy first.
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    openWith(url, "Facebook");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    openWith(url, "LinkedIn");
  };

  const shareToInstagram = () => {
    // Instagram has no web share intent; copy caption and open the app/site.
    openWith("https://www.instagram.com/", "Instagram", "Caption copied — paste it into your Story or post!");
  };

  const shareToTikTok = () => {
    openWith("https://www.tiktok.com/upload", "TikTok", "Caption copied — paste it into your video description!");
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Sobriety Progress",
          text: shareText,
          url: shareUrl,
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

  // ---- Branded share image (1080x1350) generated via Canvas ----
  const generateShareImage = async (): Promise<{ url: string; blob: Blob } | null> => {
    setIsGenerating(true);
    try {
      const W = 1080;
      const H = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#0f766e");
      grad.addColorStop(0.55, "#0d9488");
      grad.addColorStop(1, "#059669");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const glow = (x: number, y: number, r: number, alpha: number) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      glow(W * 0.85, H * 0.15, 380, 0.18);
      glow(W * 0.1, H * 0.9, 420, 0.12);

      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "600 44px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✦  SOBABLE  ✦", W / 2, 130);

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 320px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.fillText(String(daysSober), W / 2, H / 2 + 30);

      ctx.font = "500 56px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(daysSober === 1 ? "Day Sober" : "Days Sober", W / 2, H / 2 + 110);

      const weeks = Math.floor(daysSober / 7);
      const months = Math.floor(daysSober / 30);
      const stats: Array<[string, string]> = [
        [String(weeks), "Weeks"],
        [String(months), "Months"],
        [`$${moneySaved}`, "Saved"],
      ];
      const pillW = 280, pillH = 150, gap = 30;
      const totalW = pillW * 3 + gap * 2;
      let startX = (W - totalW) / 2;
      const pillY = H - 380;
      stats.forEach(([val, label]) => {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        const r = 28;
        ctx.beginPath();
        ctx.moveTo(startX + r, pillY);
        ctx.arcTo(startX + pillW, pillY, startX + pillW, pillY + pillH, r);
        ctx.arcTo(startX + pillW, pillY + pillH, startX, pillY + pillH, r);
        ctx.arcTo(startX, pillY + pillH, startX, pillY, r);
        ctx.arcTo(startX, pillY, startX + pillW, pillY, r);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "700 64px system-ui, -apple-system, 'Segoe UI', sans-serif";
        ctx.fillText(val, startX + pillW / 2, pillY + 75);
        ctx.font = "500 30px system-ui, -apple-system, 'Segoe UI', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(label, startX + pillW / 2, pillY + 120);
        startX += pillW + gap;
      });

      if (latestMilestone) {
        ctx.font = "600 36px system-ui, -apple-system, 'Segoe UI', sans-serif";
        ctx.fillStyle = "#fde68a";
        ctx.fillText(`🏆  ${latestMilestone}`, W / 2, H - 170);
      }

      ctx.font = "500 30px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText("Every day is a victory.", W / 2, H - 100);
      ctx.font = "400 26px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("sobable.lovable.app", W / 2, H - 55);

      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to render"))), "image/png")
      );
      const url = URL.createObjectURL(blob);
      const result = { url, blob };
      setGeneratedImage(result);
      return result;
    } catch {
      toast.error("Couldn't generate image");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const ensureImage = async () => generatedImage ?? (await generateShareImage());

  const downloadImage = async () => {
    const img = await ensureImage();
    if (!img) return;
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `sobable-${daysSober}-days.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Image downloaded!");
  };

  const shareImageTo = async (platform: "instagram" | "tiktok" | "facebook") => {
    const img = await ensureImage();
    if (!img) return;
    await copyToClipboard(true);

    const file = new File([img.blob], `sobable-${daysSober}-days.png`, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], text: shareText, title: "My Sobriety Progress" });
        toast.success("Shared!");
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    const a = document.createElement("a");
    a.href = img.url;
    a.download = `sobable-${daysSober}-days.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    const urls: Record<string, string> = {
      instagram: "https://www.instagram.com/",
      tiktok: "https://www.tiktok.com/upload",
      facebook: "https://www.facebook.com/",
    };
    const labels: Record<string, string> = {
      instagram: "Instagram",
      tiktok: "TikTok",
      facebook: "Facebook",
    };
    toast.success(`Image saved & caption copied. Upload it on ${labels[platform]}!`);
    window.open(urls[platform], "_blank", "noopener,noreferrer");
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
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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

              <p className="text-xs text-muted-foreground text-center">
                We'll copy your caption automatically — just paste it into the post.
              </p>

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={shareToTwitter} className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  X (Twitter)
                </Button>
                <Button variant="outline" onClick={shareToFacebook} className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button variant="outline" onClick={shareToLinkedIn} className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button variant="outline" onClick={shareToInstagram} className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Button>
                <Button variant="outline" onClick={shareToTikTok} className="flex items-center gap-2">
                  <Music2 className="w-4 h-4" />
                  TikTok
                </Button>
                <Button variant="outline" onClick={shareViaWebAPI} className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  More
                </Button>
              </div>

              <Button variant="secondary" onClick={() => copyToClipboard()} className="w-full flex items-center gap-2">
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Caption"}
              </Button>

              {/* Branded share image */}
              <div className="rounded-xl border border-border/60 p-3 space-y-3 bg-secondary/30">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Branded share image</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generate a 1080×1350 image with your stats — perfect for Instagram, TikTok, or Facebook posts/stories.
                </p>

                {generatedImage ? (
                  <img
                    src={generatedImage.url}
                    alt="Your branded share image"
                    className="w-full rounded-lg border border-border/40"
                  />
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => generateShareImage()}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating…" : "Generate Image"}
                  </Button>
                )}

                {generatedImage && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" onClick={() => shareImageTo("instagram")} className="gap-1">
                        <Instagram className="w-3.5 h-3.5" />
                        Instagram
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => shareImageTo("tiktok")} className="gap-1">
                        <Music2 className="w-3.5 h-3.5" />
                        TikTok
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => shareImageTo("facebook")} className="gap-1">
                        <Facebook className="w-3.5 h-3.5" />
                        Facebook
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="ghost" size="sm" onClick={downloadImage} className="gap-1">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => generateShareImage()} className="gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Regenerate
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Editable caption */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Edit caption</label>
                  {editedCaption !== null && editedCaption !== defaultShareText && (
                    <button
                      onClick={() => setEditedCaption(null)}
                      className="text-xs text-primary hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <textarea
                  id="share-caption-textarea"
                  value={shareText}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full p-3 rounded-lg bg-secondary/50 text-sm text-foreground border border-border/60 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Write your caption..."
                />
                <p className="text-[10px] text-muted-foreground text-right">{shareText.length}/500</p>
              </div>

              {/* Per-platform share preview */}
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Share preview</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Exactly what will be sent to each platform. Caption is auto-copied; URL is opened in a new tab.
                </p>

                {([
                  {
                    name: "X (Twitter)",
                    icon: Twitter,
                    note: "Caption pre-filled in the tweet composer.",
                    caption: shareText,
                    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                  },
                  {
                    name: "Facebook",
                    icon: Facebook,
                    note: "FB ignores pre-filled text — paste the caption when the dialog opens.",
                    caption: shareText,
                    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
                  },
                  {
                    name: "LinkedIn",
                    icon: Linkedin,
                    note: "LinkedIn only accepts a URL — paste the caption into your post.",
                    caption: shareText,
                    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                  },
                  {
                    name: "Instagram",
                    icon: Instagram,
                    note: "No web intent — opens Instagram so you can paste the caption.",
                    caption: shareText,
                    url: "https://www.instagram.com/",
                  },
                ] as const).map(({ name, icon: Icon, note, caption, url }) => (
                  <div key={name} className="rounded-lg border border-border/40 bg-background/50 p-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold">{name}</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Caption</p>
                      <p className="text-[11px] text-foreground/90 whitespace-pre-wrap break-words">{caption}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">URL opened</p>
                      <p className="text-[10px] text-muted-foreground break-all font-mono">{url}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">{note}</p>
                  </div>
                ))}
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
