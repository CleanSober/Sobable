import { motion } from "framer-motion";
import { Download, Image, Smartphone, Share2, FileText, Play, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import brand assets
import appIcon from "@/assets/brand/app-icon-1024.png";
import socialHero from "@/assets/brand/social-hero-banner.png";
import instagramPost from "@/assets/brand/instagram-post-template.png";
import instagramStory from "@/assets/brand/instagram-story-template.png";
import twitterHeader from "@/assets/brand/twitter-header.png";
import splashScreen from "@/assets/brand/splash-screen.png";
import facebookCover from "@/assets/brand/facebook-cover.png";

// Import videos
import appPreviewVideo from "@/assets/brand/videos/app-preview-portrait.mp4";
import heroAnimationVideo from "@/assets/brand/videos/hero-animation.mp4";
import logoAnimationVideo from "@/assets/brand/videos/logo-animation.mp4";
import storyAnimationVideo from "@/assets/brand/videos/story-animation.mp4";

interface AssetCardProps {
  title: string;
  dimensions: string;
  image: string;
  usage: string;
}

interface VideoCardProps {
  title: string;
  duration: string;
  video: string;
  usage: string;
  poster?: string;
}

const VideoCard = ({ title, duration, video, usage, poster }: VideoCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group"
  >
    <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <video
          src={video}
          poster={poster}
          className="w-full h-full object-cover"
          controls
          playsInline
          muted
          loop
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Play className="w-3 h-3" />
          {duration}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{usage}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => {
              const link = document.createElement("a");
              link.href = video;
              link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.mp4`;
              link.click();
            }}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const AssetCard = ({ title, dimensions, image, usage }: AssetCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group"
  >
    <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={() => {
              const link = document.createElement("a");
              link.href = image;
              link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
              link.click();
            }}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{dimensions}</p>
        <p className="text-xs text-muted-foreground mt-1">{usage}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const brandColors = [
  { name: "Primary Teal", hex: "#0d9488", hsl: "173 85% 31%", usage: "Main brand color, CTAs" },
  { name: "Amber Accent", hex: "#f59e0b", hsl: "38 92% 50%", usage: "Highlights, achievements" },
  { name: "Deep Teal", hex: "#134e4a", hsl: "173 59% 18%", usage: "Dark backgrounds" },
  { name: "Soft Cream", hex: "#fef3c7", hsl: "48 96% 89%", usage: "Light accents" },
  { name: "Success Green", hex: "#22c55e", hsl: "142 71% 45%", usage: "Success states, milestones" },
  { name: "Calm Blue", hex: "#0ea5e9", hsl: "199 89% 48%", usage: "Information, links" },
];

export const BrandAssets = () => {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sobable
          </h1>
          <p className="text-xl text-muted-foreground">
            Brand Assets & Marketing Package
          </p>
        </motion.div>

        <Tabs defaultValue="assets" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto">
            <TabsTrigger value="assets" className="gap-2">
              <Image className="w-4 h-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="w-4 h-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="w-4 h-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="app" className="gap-2">
              <Smartphone className="w-4 h-4" />
              App
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="gap-2">
              <FileText className="w-4 h-4" />
              Guidelines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Promotional Videos</h2>
            <p className="text-muted-foreground">App store previews and marketing animations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VideoCard
                title="App Store Preview"
                duration="5s"
                video={appPreviewVideo}
                poster={splashScreen}
                usage="iOS & Android app store preview"
              />
              <VideoCard
                title="Hero Animation"
                duration="5s"
                video={heroAnimationVideo}
                poster={socialHero}
                usage="Website hero, landing pages"
              />
              <VideoCard
                title="Logo Animation"
                duration="5s"
                video={logoAnimationVideo}
                poster={appIcon}
                usage="Intro/outro, brand reveal"
              />
              <VideoCard
                title="Story Animation"
                duration="5s"
                video={storyAnimationVideo}
                poster={instagramStory}
                usage="Instagram/TikTok stories"
              />
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Core Brand Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AssetCard
                title="App Icon"
                dimensions="1024 × 1024px"
                image={appIcon}
                usage="App stores, favicons"
              />
              <AssetCard
                title="Hero Banner"
                dimensions="1920 × 1080px"
                image={socialHero}
                usage="Website hero, presentations"
              />
              <AssetCard
                title="OG Image"
                dimensions="1200 × 630px"
                image="/og-image.png"
                usage="Social sharing, link previews"
              />
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Social Media Package</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AssetCard
                title="Instagram Post"
                dimensions="1080 × 1080px"
                image={instagramPost}
                usage="Feed posts, carousel covers"
              />
              <AssetCard
                title="Instagram Story"
                dimensions="1080 × 1920px"
                image={instagramStory}
                usage="Stories, Reels cover"
              />
              <AssetCard
                title="Twitter/X Header"
                dimensions="1500 × 500px"
                image={twitterHeader}
                usage="Profile header banner"
              />
              <AssetCard
                title="Facebook Cover"
                dimensions="1640 × 856px"
                image={facebookCover}
                usage="Page cover photo"
              />
            </div>
          </TabsContent>

          <TabsContent value="app" className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">App Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AssetCard
                title="Splash Screen"
                dimensions="1080 × 1920px"
                image={splashScreen}
                usage="App launch screen"
              />
              <AssetCard
                title="App Icon (Full)"
                dimensions="1024 × 1024px"
                image={appIcon}
                usage="iOS & Android stores"
              />
            </div>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Brand Colors</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {brandColors.map((color) => (
                  <Card key={color.name} className="overflow-hidden">
                    <div
                      className="h-20 w-full"
                      style={{ backgroundColor: color.hex }}
                    />
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm text-foreground">{color.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                      <p className="text-xs text-muted-foreground mt-1">{color.usage}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Typography</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Primary Font: Outfit</h3>
                    <p className="text-muted-foreground">
                      A geometric sans-serif typeface that conveys warmth, clarity, and modern professionalism.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-bold">Aa</span>
                      <span className="text-muted-foreground">Bold - Headlines</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-2xl font-semibold">Aa</span>
                      <span className="text-muted-foreground">Semibold - Subheadings</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-xl">Aa</span>
                      <span className="text-muted-foreground">Regular - Body text</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Brand Voice</h2>
              <Card className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">We Are</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>✓ Supportive & encouraging</li>
                      <li>✓ Private & trustworthy</li>
                      <li>✓ Hopeful & optimistic</li>
                      <li>✓ Non-judgmental & inclusive</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">We Avoid</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>✗ Clinical or cold language</li>
                      <li>✗ Shame or guilt-based messaging</li>
                      <li>✗ Unrealistic promises</li>
                      <li>✗ Triggering imagery</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Logo Usage</h2>
              <Card className="p-6">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
                    <img src={appIcon} alt="Sobable Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">The Phoenix Symbol</h4>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Our logo features a geometric phoenix rising, symbolizing rebirth, hope, and the strength 
                      found in recovery. The teal-to-amber gradient represents the journey from darkness to light.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BrandAssets;
