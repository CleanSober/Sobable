import { motion } from "framer-motion";
import { 
  Apple, 
  Smartphone, 
  Image, 
  Video, 
  FileText, 
  Copy, 
  Check,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Import brand assets
import appIcon from "@/assets/brand/app-icon-1024.png";
import splashScreen from "@/assets/brand/splash-screen.png";
import socialHero from "@/assets/brand/social-hero-banner.png";

// Import videos
import appPreviewVideo from "@/assets/brand/videos/app-preview-portrait.mp4";
import logoAnimationVideo from "@/assets/brand/videos/logo-animation.mp4";

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleCopy}
      className="gap-2"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      Copy
    </Button>
  );
};

const TextBlock = ({ 
  title, 
  content, 
  maxLength, 
  platform 
}: { 
  title: string; 
  content: string; 
  maxLength: number;
  platform?: "ios" | "android" | "both";
}) => (
  <Card className="bg-card/50">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {platform === "ios" && <Badge variant="outline" className="text-xs">iOS</Badge>}
          {platform === "android" && <Badge variant="outline" className="text-xs">Android</Badge>}
        </div>
        <CopyButton text={content} label={title} />
      </div>
      <CardDescription className="text-xs">
        {content.length} / {maxLength} characters
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
        {content}
      </p>
    </CardContent>
  </Card>
);

// App Store Content
const appStoreContent = {
  appName: "Sobable",
  subtitle: "Sobriety Tracker & Recovery", // iOS only, 30 chars max
  
  shortDescription: "Track your sobriety journey with daily check-ins, mood logging, and milestone celebrations. 100% private.", // 80 chars for Google Play
  
  fullDescriptionIOS: `Begin your recovery journey with Sobable - the most supportive and private sobriety tracking app designed with compassion.

TRACK YOUR PROGRESS
• Count your sober days with a beautiful, motivating counter
• See money saved from your recovery journey
• Celebrate milestones with achievement badges
• View your progress with an intuitive calendar heatmap

DAILY WELLNESS TOOLS
• Log your mood and craving levels each day
• Practice guided breathing exercises
• Access calming meditations for difficult moments
• Complete daily wellness goals and build streaks

UNDERSTAND YOUR JOURNEY
• Track triggers and identify patterns
• Log sleep quality to understand recovery connections
• Get personalized insights based on your data
• Build a relapse prevention plan with coping strategies

STAY CONNECTED
• One-tap emergency support with crisis hotlines
• Quick access to call your sponsor or support contact
• Share wins and struggles with a supportive community
• Access your personal "why" reminder when you need it most

PRIVACY FIRST
• Your data stays on your device
• No account required to start
• Optional cloud sync with full encryption
• We never sell or share your information

Whether you're in early recovery or maintaining long-term sobriety, Sobable provides the tools, motivation, and support you need. Every day clean is a victory worth celebrating.

Download now and take the first step toward a healthier life.`,

  fullDescriptionAndroid: `Begin your recovery journey with Sobable - the most supportive and private sobriety tracking app designed with compassion.

★ TRACK YOUR PROGRESS
• Count your sober days with a beautiful, motivating counter
• See money saved from your recovery journey
• Celebrate milestones with achievement badges
• View your progress with an intuitive calendar heatmap

★ DAILY WELLNESS TOOLS
• Log your mood and craving levels each day
• Practice guided breathing exercises
• Access calming meditations for difficult moments
• Complete daily wellness goals and build streaks

★ UNDERSTAND YOUR JOURNEY
• Track triggers and identify patterns
• Log sleep quality to understand recovery connections
• Get personalized insights based on your data
• Build a relapse prevention plan with coping strategies

★ STAY CONNECTED
• One-tap emergency support with crisis hotlines
• Quick access to call your sponsor or support contact
• Share wins and struggles with a supportive community
• Access your personal "why" reminder when you need it most

★ PRIVACY FIRST
• Your data stays on your device
• No account required to start
• Optional cloud sync with full encryption
• We never sell or share your information

Whether you're in early recovery or maintaining long-term sobriety, Sobable provides the tools, motivation, and support you need.

Download now and take the first step toward a healthier life.`,

  keywords: "sobriety,sober,recovery,addiction,tracker,alcohol,drugs,quit,drinking,clean,wellness,mental health,support,craving,relapse,12 step,AA,NA,milestone,counter",
  
  whatsNew: `Version 2.0 - Major Update!
• New daily goals with streak tracking
• Smart insights powered by AI
• Improved mood and trigger logging
• Enhanced privacy controls
• Performance improvements and bug fixes`,

  promotionalText: "Start your recovery journey today. Track progress, celebrate milestones, and build a healthier life - 100% private.", // iOS, 170 chars

  category: "Health & Fitness",
  secondaryCategory: "Lifestyle",
  
  ageRating: "12+", // Due to references to substance use
  
  supportURL: "https://sobable.app/support",
  privacyURL: "https://sobable.app/privacy",
  marketingURL: "https://sobable.app",
};

const screenshotSpecs = {
  ios: [
    { device: "iPhone 6.7\"", size: "1290 × 2796", required: true },
    { device: "iPhone 6.5\"", size: "1284 × 2778", required: true },
    { device: "iPhone 5.5\"", size: "1242 × 2208", required: true },
    { device: "iPad Pro 12.9\"", size: "2048 × 2732", required: false },
    { device: "iPad Pro 11\"", size: "1668 × 2388", required: false },
  ],
  android: [
    { device: "Phone", size: "1080 × 1920 (min)", required: true },
    { device: "7\" Tablet", size: "1200 × 1920", required: false },
    { device: "10\" Tablet", size: "1920 × 1200", required: false },
  ]
};

const screenshotRecommendations = [
  {
    order: 1,
    title: "Sobriety Counter",
    description: "Show the main counter with days sober, highlighting a meaningful milestone (e.g., 30, 90, or 365 days)",
    callout: "Track Every Sober Day"
  },
  {
    order: 2,
    title: "Money Saved",
    description: "Display the money saved feature with an impressive amount to show tangible benefits",
    callout: "See Your Savings Grow"
  },
  {
    order: 3,
    title: "Daily Check-In",
    description: "Show the mood logging or daily goals feature with a completed check-in",
    callout: "Daily Wellness Check-Ins"
  },
  {
    order: 4,
    title: "Progress Calendar",
    description: "Display the calendar heatmap showing consistent recovery progress",
    callout: "Visualize Your Journey"
  },
  {
    order: 5,
    title: "Achievements",
    description: "Show earned badges and milestones to highlight gamification",
    callout: "Celebrate Milestones"
  },
  {
    order: 6,
    title: "Emergency Support",
    description: "Display quick actions including sponsor call and crisis support",
    callout: "Help When You Need It"
  },
  {
    order: 7,
    title: "Smart Insights",
    description: "Show personalized insights based on mood and trigger patterns",
    callout: "Understand Your Patterns"
  },
  {
    order: 8,
    title: "Guided Meditations",
    description: "Display the meditation library for managing cravings",
    callout: "Calm Your Mind"
  }
];

export const AppStoreGuide = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            App Store Publishing Guide
          </h1>
          <p className="text-muted-foreground">
            Complete guide for Apple App Store & Google Play Store submission
          </p>
        </motion.div>

        {/* Quick Status */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Before You Start</h3>
                <p className="text-sm text-muted-foreground">
                  This app needs to be wrapped with Capacitor for native deployment. 
                  Export to GitHub, then follow the setup instructions below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="metadata" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto">
            <TabsTrigger value="metadata" className="gap-1 text-xs md:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Metadata</span>
            </TabsTrigger>
            <TabsTrigger value="screenshots" className="gap-1 text-xs md:text-sm">
              <Image className="w-4 h-4" />
              <span className="hidden md:inline">Screenshots</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1 text-xs md:text-sm">
              <Video className="w-4 h-4" />
              <span className="hidden md:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="ios" className="gap-1 text-xs md:text-sm">
              <Apple className="w-4 h-4" />
              <span className="hidden md:inline">iOS</span>
            </TabsTrigger>
            <TabsTrigger value="android" className="gap-1 text-xs md:text-sm">
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Android</span>
            </TabsTrigger>
          </TabsList>

          {/* METADATA TAB */}
          <TabsContent value="metadata" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">App Information</h2>
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <TextBlock 
                    title="App Name" 
                    content={appStoreContent.appName} 
                    maxLength={30}
                  />
                  <TextBlock 
                    title="Subtitle (iOS)" 
                    content={appStoreContent.subtitle} 
                    maxLength={30}
                    platform="ios"
                  />
                </div>
                
                <TextBlock 
                  title="Short Description (Google Play)" 
                  content={appStoreContent.shortDescription} 
                  maxLength={80}
                  platform="android"
                />

                <TextBlock 
                  title="Promotional Text (iOS)" 
                  content={appStoreContent.promotionalText} 
                  maxLength={170}
                  platform="ios"
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Full Description</h2>
              <div className="grid gap-4">
                <TextBlock 
                  title="iOS App Store Description" 
                  content={appStoreContent.fullDescriptionIOS} 
                  maxLength={4000}
                  platform="ios"
                />
                <TextBlock 
                  title="Google Play Description" 
                  content={appStoreContent.fullDescriptionAndroid} 
                  maxLength={4000}
                  platform="android"
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Keywords & Category</h2>
              <div className="grid gap-4">
                <TextBlock 
                  title="Keywords (iOS - comma separated)" 
                  content={appStoreContent.keywords} 
                  maxLength={100}
                  platform="ios"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-card/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Primary Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary" className="text-sm">
                        {appStoreContent.category}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Secondary Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary" className="text-sm">
                        {appStoreContent.secondaryCategory}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What's New</h2>
              <TextBlock 
                title="Release Notes" 
                content={appStoreContent.whatsNew} 
                maxLength={4000}
              />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Support URLs</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Support URL</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2">
                    <code className="text-xs bg-muted p-2 rounded flex-1 overflow-x-auto">
                      {appStoreContent.supportURL}
                    </code>
                    <CopyButton text={appStoreContent.supportURL} label="Support URL" />
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Privacy Policy URL</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2">
                    <code className="text-xs bg-muted p-2 rounded flex-1 overflow-x-auto">
                      {appStoreContent.privacyURL}
                    </code>
                    <CopyButton text={appStoreContent.privacyURL} label="Privacy URL" />
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Marketing URL</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2">
                    <code className="text-xs bg-muted p-2 rounded flex-1 overflow-x-auto">
                      {appStoreContent.marketingURL}
                    </code>
                    <CopyButton text={appStoreContent.marketingURL} label="Marketing URL" />
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Age Rating: 12+</h3>
                    <p className="text-sm text-muted-foreground">
                      Due to references to substance use, addiction, and recovery content.
                      Set appropriate content ratings in both stores.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SCREENSHOTS TAB */}
          <TabsContent value="screenshots" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Screenshot Requirements</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="w-5 h-5" />
                      iOS Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {screenshotSpecs.ios.map((spec) => (
                        <li key={spec.device} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{spec.device}</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{spec.size}</code>
                            {spec.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4">
                      Up to 10 screenshots per device size. First 3 are most important.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Android Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {screenshotSpecs.android.map((spec) => (
                        <li key={spec.device} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{spec.device}</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{spec.size}</code>
                            {spec.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4">
                      2-8 screenshots required. JPEG or PNG, max 8MB each.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Recommended Screenshot Sequence</h2>
              <p className="text-muted-foreground mb-6">
                Follow this order for maximum conversion. Each screenshot should have a headline callout and show real app functionality.
              </p>
              
              <div className="grid gap-4">
                {screenshotRecommendations.map((rec) => (
                  <Card key={rec.order} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold">{rec.order}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{rec.title}</h3>
                            <Badge variant="outline" className="text-xs">"{rec.callout}"</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Screenshot Best Practices</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use device frames (iPhone/Android mockups) for professional look</li>
                      <li>• Add headline text above each screenshot (40-50 characters max)</li>
                      <li>• Use brand colors (teal/amber) for consistency</li>
                      <li>• Show real data that looks realistic and aspirational</li>
                      <li>• Test screenshots on actual store listing preview</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VIDEOS TAB */}
          <TabsContent value="videos" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">App Preview Videos</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="w-5 h-5" />
                      iOS App Preview
                    </CardTitle>
                    <CardDescription>
                      15-30 seconds, up to 3 previews per device
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>iPhone 6.7"</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">1290 × 2796</code>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>iPhone 6.5"</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">1284 × 2778</code>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Format</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">H.264, 30fps</code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Google Play Video
                    </CardTitle>
                    <CardDescription>
                      30 seconds - 2 minutes, YouTube link
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Landscape</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">1920 × 1080</code>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Portrait</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">1080 × 1920</code>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Upload to</span>
                      <Badge variant="outline">YouTube (unlisted)</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Video Assets</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="overflow-hidden">
                  <div className="aspect-[9/16] bg-muted relative">
                    <video 
                      src={appPreviewVideo} 
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      muted
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">App Store Preview</h3>
                        <p className="text-xs text-muted-foreground">Portrait 9:16 • 5 seconds</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={appPreviewVideo} download="app-preview.mp4">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    <video 
                      src={logoAnimationVideo} 
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      muted
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Logo Animation</h3>
                        <p className="text-xs text-muted-foreground">Square 1:1 • 5 seconds</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={logoAnimationVideo} download="logo-animation.mp4">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Video Best Practices</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Start with the most compelling feature (sobriety counter)</li>
                      <li>• Show real app interactions, not just animations</li>
                      <li>• Add subtle background music (royalty-free)</li>
                      <li>• Include text callouts for key features</li>
                      <li>• End with app icon and call-to-action</li>
                      <li>• No audio narration for iOS (captions only)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* iOS TAB */}
          <TabsContent value="ios" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">iOS App Store Checklist</h2>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>App Icon</CardTitle>
                    <CardDescription>1024 × 1024px PNG, no alpha/transparency</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <img src={appIcon} alt="App Icon" className="w-20 h-20 rounded-2xl shadow-lg" />
                    <Button variant="outline" asChild>
                      <a href={appIcon} download="app-icon-1024.png" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download Icon
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Required App Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">App Name (30 chars): <strong>{appStoreContent.appName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Subtitle (30 chars): <strong>{appStoreContent.subtitle}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Category: <strong>{appStoreContent.category}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Age Rating: <strong>{appStoreContent.ageRating}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Privacy Policy URL: Required</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      App Review Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• <strong>1.4.1 Physical Harm:</strong> Health apps must provide accurate information. Include medical disclaimer.</li>
                      <li>• <strong>5.1.1 Data Collection:</strong> Clearly describe what health data is collected in privacy policy.</li>
                      <li>• <strong>1.2 User Generated Content:</strong> Community features need moderation and reporting mechanisms.</li>
                      <li>• <strong>Review notes:</strong> Include test account credentials if community features require login.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>App Privacy Details</CardTitle>
                    <CardDescription>For the App Privacy section in App Store Connect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Data Linked to User</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Health & Fitness</Badge>
                          <Badge variant="secondary">Contact Info (optional)</Badge>
                          <Badge variant="secondary">User Content</Badge>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Data Used for Tracking</h4>
                        <Badge variant="outline">None</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ANDROID TAB */}
          <TabsContent value="android" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Google Play Store Checklist</h2>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>App Icon</CardTitle>
                    <CardDescription>512 × 512px PNG, 32-bit with alpha</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <img src={appIcon} alt="App Icon" className="w-20 h-20 rounded-xl shadow-lg" />
                    <Button variant="outline" asChild>
                      <a href={appIcon} download="app-icon-512.png" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download Icon
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Graphic</CardTitle>
                    <CardDescription>1024 × 500px, displayed at top of store listing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-[1024/500] bg-muted rounded-lg overflow-hidden">
                      <img src={socialHero} alt="Feature Graphic" className="w-full h-full object-cover" />
                    </div>
                    <Button variant="outline" asChild>
                      <a href={socialHero} download="feature-graphic.png" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download Feature Graphic
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Required Store Listing Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">App Name (50 chars): <strong>{appStoreContent.appName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Short Description (80 chars): Provided</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Full Description (4000 chars): Provided</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Category: <strong>{appStoreContent.category}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Content Rating: Complete questionnaire</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Safety Section</CardTitle>
                    <CardDescription>Required for Google Play Data Safety</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Data Collected</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Personal Info (optional)</Badge>
                          <Badge variant="secondary">Health Info</Badge>
                          <Badge variant="secondary">App Activity</Badge>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Data Shared</h4>
                        <Badge variant="outline">None</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Security Practices</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Data encrypted in transit</Badge>
                          <Badge variant="secondary">Data deletion available</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Google Play Policy Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• <strong>Health Apps:</strong> Must include appropriate disclaimers about not being medical advice</li>
                      <li>• <strong>Sensitive Content:</strong> References to substance use require appropriate content ratings</li>
                      <li>• <strong>User Data:</strong> Complete Data Safety form accurately</li>
                      <li>• <strong>Target Audience:</strong> Set to 13+ due to content nature</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Setup Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Native App Setup (Capacitor)</CardTitle>
            <CardDescription>Steps to build and deploy to app stores</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">1</span>
                <span>Export project to GitHub via the "Export to GitHub" button</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">2</span>
                <span>Clone the repo locally and run <code className="bg-muted px-1 rounded">npm install</code></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">3</span>
                <span>Add platforms: <code className="bg-muted px-1 rounded">npx cap add ios</code> and/or <code className="bg-muted px-1 rounded">npx cap add android</code></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">4</span>
                <span>Build: <code className="bg-muted px-1 rounded">npm run build && npx cap sync</code></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">5</span>
                <span>Open in Xcode/Android Studio: <code className="bg-muted px-1 rounded">npx cap open ios</code> or <code className="bg-muted px-1 rounded">npx cap open android</code></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">6</span>
                <span>Archive and submit through Xcode / Google Play Console</span>
              </li>
            </ol>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" asChild className="gap-2">
                <a href="https://capacitorjs.com/docs" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Capacitor Documentation
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppStoreGuide;
