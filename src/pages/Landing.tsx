import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Heart, 
  Shield, 
  TrendingUp, 
  Calendar, 
  Brain, 
  Phone, 
  Sparkles,
  ArrowRight,
  Star,
  Download,
  Users,
  Clock,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppStoreBadges from "@/components/AppStoreBadges";
import { useAuth } from "@/contexts/AuthContext";
import sobableLogo from "@/assets/sobable-logo.png";
import phoneMockup1 from "@/assets/phone-mockup-1.png";
import phoneMockup1Webp from "@/assets/phone-mockup-1.webp";
import phoneMockup2 from "@/assets/phone-mockup-2.png";
import phoneMockup2Webp from "@/assets/phone-mockup-2.webp";
import phoneMockupSquare from "@/assets/phone-mockup-square.png";
import phoneMockupSquareWebp from "@/assets/phone-mockup-square.webp";
import socialHeroBanner from "@/assets/brand/social-hero-banner.png";

const features = [
  {
    icon: Calendar,
    title: "Sobriety Day Counter",
    description: "Track every sober day with a beautiful countdown timer. Celebrate 24 hours, 30 days, 90 days, and beyond."
  },
  {
    icon: TrendingUp,
    title: "Money Saved Calculator",
    description: "See exactly how much money you save by not drinking. Watch your savings grow daily."
  },
  {
    icon: Heart,
    title: "Daily Mood Tracker",
    description: "Log your emotions and cravings daily to understand patterns in your recovery journey."
  },
  {
    icon: Brain,
    title: "Trigger & Craving Logger",
    description: "Identify what triggers cravings and build personalized coping strategies to prevent relapse."
  },
  {
    icon: Sparkles,
    title: "Recovery Motivation",
    description: "Get daily affirmations, motivational quotes, and encouragement tailored to your sobriety journey."
  },
  {
    icon: Phone,
    title: "Emergency SOS Button",
    description: "One-tap access to your sponsor, therapist, or AA hotline when you need support most."
  }
];

const testimonials = [
  {
    name: "Sarah M.",
    days: 247,
    quote: "This sobriety tracker helped me stay accountable. Seeing my sober day count grow keeps me motivated to never drink again."
  },
  {
    name: "Michael R.",
    days: 89,
    quote: "The money saved calculator blew my mind. I've saved over $2,000 by quitting alcohol. Best free recovery app I've found."
  },
  {
    name: "Jennifer K.",
    days: 412,
    quote: "The trigger logging feature helped me understand my drinking patterns and avoid relapse. A must-have for anyone in AA."
  }
];

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect authenticated users to the app
  useEffect(() => {
    if (!loading && user) {
      navigate("/app");
    }
  }, [user, loading, navigate]);

  return (
    <main className="min-h-screen bg-background overflow-x-hidden" role="main">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Background with hero banner */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={socialHeroBanner} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-teal-500/20 border border-amber-500/30 mb-8">
                <img 
                  src={sobableLogo} 
                  alt="Sobable - Rise. Recover. Renew." 
                  width={28} 
                  height={28} 
                  className="w-7 h-7" 
                />
                <span className="text-sm font-medium bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Rise. Recover. Renew.</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Your Recovery{" "}
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-teal-400 bg-clip-text text-transparent">Starts Today.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl lg:max-w-none"
            >
              Track your sobriety journey with Sobable. Count days sober, calculate money saved, and build lasting recovery—one day at a time.
            </motion.p>

            {/* Primary CTA - App Store Downloads */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center lg:justify-start gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Download Free on iOS & Android
              </p>
              <AppStoreBadges size="lg" className="justify-center lg:justify-start" />
            </motion.div>

            {/* Secondary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
            >
              <Button asChild size="lg" variant="outline" className="px-8 py-6 text-lg border-border/50 hover:bg-secondary/50">
                <Link to="/auth">
                  Try Web Version
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>

            {/* Social Proof Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0 p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 to-teal-500/5 border border-amber-500/20"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl md:text-3xl font-bold text-foreground">
                  <Users className="w-5 h-5 text-amber-400" />
                  50K+
                </div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center border-x border-amber-500/20">
                <div className="flex items-center justify-center gap-1 text-2xl md:text-3xl font-bold text-foreground">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  4.9
                </div>
                <div className="text-xs text-muted-foreground">App Rating</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl md:text-3xl font-bold text-foreground">
                  <Flame className="w-5 h-5 text-amber-400" />
                  24/7
                </div>
                <div className="text-xs text-muted-foreground">Support</div>
              </div>
            </motion.div>
          </div>

          {/* Right side - Phone mockups */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              {/* Main phone mockup */}
              <motion.picture
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <source 
                  srcSet={`${phoneMockup1Webp} 1x, ${phoneMockup1Webp} 2x`} 
                  type="image/webp" 
                />
                <img
                  src={phoneMockup1}
                  alt="Sobriety Counter App - Track Sober Days Free"
                  width={288}
                  height={512}
                  className="w-72 h-auto rounded-3xl shadow-2xl"
                  fetchPriority="high"
                />
              </motion.picture>
              {/* Secondary phone mockup - LCP element */}
              <motion.picture
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -right-20 top-20"
              >
                <source 
                  srcSet={`${phoneMockup2Webp} 1x, ${phoneMockup2Webp} 2x`} 
                  type="image/webp" 
                />
                <img
                  src={phoneMockup2}
                  alt="Addiction Recovery App - Daily Motivation &amp; Support"
                  width={224}
                  height={398}
                  fetchPriority="high"
                  className="w-56 h-auto rounded-3xl shadow-xl opacity-80"
                />
              </motion.picture>
              {/* Decorative glow behind phones */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl -z-10 scale-150" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-background to-card/30" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Powerful Features</span>
            </div>
            <h2 id="features-heading" className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent">Recover</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Free tools for addiction recovery and relapse prevention. Track, reflect, and grow stronger every day.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Phone mockup showcase */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative flex justify-center"
            >
              <div className="relative">
                <motion.picture
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <source 
                    srcSet={`${phoneMockupSquareWebp} 1x, ${phoneMockupSquareWebp} 2x`} 
                    type="image/webp" 
                  />
                  <img
                    src={phoneMockupSquare}
                    alt="Sobriety Tracker Features - Mood Logging, Money Saved Calculator"
                    width={448}
                    height={448}
                    loading="lazy"
                    className="w-full max-w-md rounded-3xl shadow-2xl"
                  />
                </motion.picture>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl -z-10 scale-110" />
              </div>
            </motion.div>

            {/* Features grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-amber-500/10 hover:border-amber-500/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-teal-600 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-shadow duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mid-section Download CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground mb-4">Get all features free</p>
            <AppStoreBadges size="md" />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6" aria-labelledby="how-it-works-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="how-it-works-heading" className="text-3xl md:text-5xl font-bold mb-4">
              Start Your{" "}
              <span className="bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent">Journey</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: "1", title: "Download Sobable", description: "Get the free app on iOS or Android. Takes less than 30 seconds to set up." },
              { step: "2", title: "Set Your Sobriety Date", description: "Enter when you started your recovery. Your journey counter starts tracking immediately." },
              { step: "3", title: "Rise & Renew", description: "Log mood, cravings, and triggers. Earn milestones and watch your transformation unfold." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-lg shadow-amber-500/20">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA after steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <AppStoreBadges size="lg" />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-b from-card/30 to-background" aria-labelledby="testimonials-heading">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-amber-400">Success Stories</span>
            </div>
            <h2 id="testimonials-heading" className="text-3xl md:text-5xl font-bold mb-4">
              Real People,{" "}
              <span className="bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent">Real Recovery</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands who have transformed their lives with Sobable.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-amber-500/10"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{testimonial.name}</span>
                  <span className="text-sm text-amber-400 font-semibold">{testimonial.days} days sober</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 px-6" aria-labelledby="privacy-heading">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
              <Shield className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
            <h2 id="privacy-heading" className="text-3xl md:text-4xl font-bold mb-4">
              Your Privacy, Protected
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your recovery journey is personal. Your data stays on your device. No account required. No data collection. No ads.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["No Account Needed", "Offline Access", "Zero Data Collection", "Anonymous Forever"].map((item, index) => (
                <div key={index} className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-teal-500/10 border border-amber-500/20">
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-teal-500/5 to-amber-500/10 border border-amber-500/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-teal-500/5" />
          <div className="relative z-10">
            <img 
              src={sobableLogo} 
              alt="Sobable" 
              className="w-16 h-16 mx-auto mb-6"
            />
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Rise. Recover.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent">Renew.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Your transformation starts with a single step. Download Sobable and begin your journey today.
            </p>
            
            {/* Primary: App Store badges */}
            <div className="mb-6">
              <AppStoreBadges size="lg" />
            </div>

            {/* Secondary: Web version */}
            <div className="pt-6 border-t border-amber-500/20">
              <p className="text-sm text-muted-foreground mb-4">Or continue in browser</p>
              <Button asChild size="lg" variant="outline" className="px-8 py-6 text-lg border-amber-500/30 hover:bg-amber-500/10">
                <Link to="/auth">
                  Use Web Version
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-amber-500/10">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={sobableLogo} alt="Sobable" className="w-6 h-6" />
            <span className="font-semibold bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent">Sobable</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Rise. Recover. Renew. You are not alone on this journey.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
