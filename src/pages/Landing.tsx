import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
import appIcon from "@/assets/app-icon.png";
import phoneMockup1 from "@/assets/phone-mockup-1.png";
import phoneMockup2 from "@/assets/phone-mockup-2.png";
import phoneMockupSquare from "@/assets/phone-mockup-square.png";
const features = [
  {
    icon: Calendar,
    title: "Sobriety Tracking",
    description: "Track your sober days with a beautiful counter that celebrates every milestone."
  },
  {
    icon: TrendingUp,
    title: "Money Saved",
    description: "See exactly how much money you're saving by staying sober."
  },
  {
    icon: Heart,
    title: "Mood Check-ins",
    description: "Daily mood tracking to understand your emotional journey."
  },
  {
    icon: Brain,
    title: "Trigger Analysis",
    description: "Identify and track your triggers to build awareness and coping strategies."
  },
  {
    icon: Sparkles,
    title: "Daily Motivation",
    description: "Receive personalized affirmations and motivational quotes every day."
  },
  {
    icon: Phone,
    title: "Emergency Support",
    description: "Quick access to your sponsor or emergency contacts when you need help."
  }
];

const testimonials = [
  {
    name: "Anonymous",
    days: 247,
    quote: "This app helped me track my progress and stay accountable. The daily motivations keep me going."
  },
  {
    name: "Recovery Warrior",
    days: 89,
    quote: "Being able to see how much money I've saved is incredibly motivating. Every day counts."
  },
  {
    name: "One Day at a Time",
    days: 412,
    quote: "The trigger logging feature helped me understand my patterns and avoid relapses."
  }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
                <img src={appIcon} alt="Sober Days" className="w-6 h-6 rounded-lg" />
                <span className="text-sm text-primary font-medium">Your Journey to Recovery</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Every Sober Day is a{" "}
              <span className="text-gradient">Victory</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl lg:max-w-none"
            >
              Track your sobriety, celebrate your progress, and build a healthier life—one day at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground px-8 py-6 text-lg font-semibold shadow-glow hover:shadow-lg transition-all duration-300">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
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
              <p className="text-sm text-muted-foreground mb-4">Coming soon to mobile</p>
              <AppStoreBadges size="md" className="justify-center lg:justify-start" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto lg:mx-0"
            >
              {[
                { value: "100%", label: "Free" },
                { value: "24/7", label: "Support" },
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
              <motion.img
                src={phoneMockup1}
                alt="Sober Days App - Sobriety Counter"
                className="w-72 h-auto rounded-3xl shadow-2xl relative z-10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Secondary phone mockup */}
              <motion.img
                src={phoneMockup2}
                alt="Sober Days App - Daily Motivation"
                className="absolute -right-20 top-20 w-56 h-auto rounded-3xl shadow-xl opacity-80"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              {/* Decorative glow behind phones */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl -z-10 scale-150" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-gradient">Stay Strong</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to support your recovery journey every step of the way.
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
                <motion.img
                  src={phoneMockupSquare}
                  alt="Sober Days App Features"
                  className="w-full max-w-md rounded-3xl shadow-2xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
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
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple Steps to{" "}
              <span className="text-gradient">Get Started</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: "1", title: "Set Your Sobriety Date", description: "Enter when you started your journey—we'll count every day from there." },
              { step: "2", title: "Track Your Progress", description: "Check in daily with your mood, log triggers, and celebrate milestones." },
              { step: "3", title: "Stay Motivated", description: "Get daily affirmations, see your savings grow, and connect with support when needed." }
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
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Stories of{" "}
              <span className="text-gradient">Hope</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Real experiences from people on their recovery journey.
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
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Privacy Matters
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              All your data stays on your device. No accounts required. No data collection. Your recovery journey is 100% private.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["No Sign-up Required", "Data Stored Locally", "No Tracking", "Anonymous by Default"].map((item, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
                  <CheckCircle2 className="w-4 h-4 text-success" />
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
            <Link to="/app">
              <Button size="lg" className="gradient-primary text-primary-foreground px-10 py-6 text-lg font-semibold shadow-glow hover:shadow-lg transition-all duration-300">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
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
    </div>
  );
};

export default Landing;
