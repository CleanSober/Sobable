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
  CheckCircle2,
  ArrowRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppStoreBadges from "@/components/AppStoreBadges";
import { useAuth } from "@/contexts/AuthContext";
import appIcon from "@/assets/app-icon.png";
import appIconWebp from "@/assets/app-icon.webp";
import phoneMockup1 from "@/assets/phone-mockup-1.png";
import phoneMockup1Webp from "@/assets/phone-mockup-1.webp";
import phoneMockup2 from "@/assets/phone-mockup-2.png";
import phoneMockup2Webp from "@/assets/phone-mockup-2.webp";
import phoneMockupSquare from "@/assets/phone-mockup-square.png";
import phoneMockupSquareWebp from "@/assets/phone-mockup-square.webp";

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
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <picture>
                  <source srcSet={appIconWebp} type="image/webp" />
                  <img 
                    src={appIcon} 
                    alt="Sober Days App Icon - Free Sobriety Tracker" 
                    width={24} 
                    height={24} 
                    className="w-6 h-6 rounded-lg" 
                  />
                </picture>
                <span className="text-sm text-primary font-medium">Free Sobriety Tracker App</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Track Your Sober Days.{" "}
              <span className="text-gradient">Stay Alcohol-Free.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl lg:max-w-none"
            >
              The #1 free sobriety counter app. Track your recovery, count days sober, calculate money saved, and prevent relapse—one day at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="gradient-primary text-primary-foreground px-8 py-6 text-lg font-semibold shadow-glow hover:shadow-lg transition-all duration-300">
                <Link to="/auth">
                  Start Tracking Free
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg border-border/50 hover:bg-secondary/50"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </motion.div>

            {/* App Store Badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8"
            >
              <p className="text-sm text-muted-foreground mb-4">Download on iOS &amp; Android</p>
              <AppStoreBadges size="md" className="justify-center lg:justify-start" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto lg:mx-0"
            >
              {[
                { value: "100%", label: "Free Forever" },
                { value: "24/7", label: "Access" },
                { value: "100%", label: "Private" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
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
      <section id="features" className="py-24 px-6 bg-card/30" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="features-heading" className="text-3xl md:text-5xl font-bold mb-4">
              Best Sobriety Tracker{" "}
              <span className="text-gradient">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to quit drinking and stay sober. Free tools for addiction recovery and relapse prevention.
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
                  className="gradient-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow duration-300">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
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
              Start Counting{" "}
              <span className="text-gradient">Sober Days</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: "1", title: "Enter Your Sobriety Date", description: "Set when you quit drinking or using. Your sobriety counter starts tracking immediately—no sign-up required." },
              { step: "2", title: "Track Daily Progress", description: "Log mood, cravings, and triggers. Watch your sober day count and money saved grow every day." },
              { step: "3", title: "Stay Sober & Celebrate", description: "Get daily motivation, earn sobriety milestones (24 hours, 1 week, 30 days, 1 year), and access emergency support." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-xl">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-card/30" aria-labelledby="testimonials-heading">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="testimonials-heading" className="text-3xl md:text-5xl font-bold mb-4">
              Real Recovery{" "}
              <span className="text-gradient">Success Stories</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands who have tracked their sobriety and transformed their lives.
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
                className="gradient-card p-6 rounded-2xl border border-border/50"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{testimonial.name}</span>
                  <span className="text-sm text-primary font-semibold">{testimonial.days} days sober</span>
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
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" aria-hidden="true" />
            <h2 id="privacy-heading" className="text-3xl md:text-4xl font-bold mb-4">
              100% Private Sobriety Tracking
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your recovery data stays on your device. No account required. No data collection. No ads. The most private sober app available.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["No Account Needed", "Offline Access", "Zero Data Collection", "Anonymous Forever"].map((item, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
                  <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />
                  <span className="text-sm font-medium">{item}</span>
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
          className="max-w-4xl mx-auto text-center gradient-card p-12 rounded-3xl border border-primary/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Every journey begins with a single step. Take yours today.
            </p>
            <Button asChild size="lg" className="gradient-primary text-primary-foreground px-10 py-6 text-lg font-semibold shadow-glow hover:shadow-lg transition-all duration-300">
              <Link to="/app">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <div className="mt-8">
              <p className="text-sm text-muted-foreground mb-4">Or download the app</p>
              <AppStoreBadges size="sm" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            Made with care for those on the path to recovery. You are not alone.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
