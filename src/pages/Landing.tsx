import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  ArrowDown,
  Star,
  Users,
  Clock,
  Flame,
  Check,
  Crown,
  Zap,
  Target,
  AlertTriangle,
  ChevronDown,
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

const painPoints = [
  { icon: AlertTriangle, text: "Losing track of your sober days and starting over" },
  { icon: AlertTriangle, text: "Not knowing how much money you're wasting on substances" },
  { icon: AlertTriangle, text: "Feeling alone with no one to talk to at 2 AM" },
  { icon: AlertTriangle, text: "Not understanding what triggers your cravings" },
];

const benefits = [
  {
    icon: Calendar,
    title: "Never Lose Count Again",
    description: "Your sober day counter tracks every second. Watch 24 hours become 30 days, then 90, then a year.",
  },
  {
    icon: TrendingUp,
    title: "See Your Savings Grow",
    description: "Real-time money saved calculator. Most users save $200+ in their first month alone.",
  },
  {
    icon: Brain,
    title: "Understand Your Triggers",
    description: "Log cravings and triggers to spot patterns. Knowledge is your strongest weapon against relapse.",
  },
  {
    icon: Heart,
    title: "Track Your Healing",
    description: "Daily mood logging reveals how much better life gets. The data doesn't lie — you're getting stronger.",
  },
  {
    icon: Phone,
    title: "SOS When You Need It",
    description: "One tap to call your sponsor, therapist, or hotline. Help is always one button away.",
  },
  {
    icon: Sparkles,
    title: "Daily Motivation",
    description: "Personalized affirmations and quotes that meet you exactly where you are in your journey.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    days: 247,
    saved: "$3,200",
    quote: "I tried 4 other apps. Sobable is the only one that stuck. Seeing my counter at 247 days makes me tear up every time.",
  },
  {
    name: "Michael R.",
    days: 89,
    saved: "$2,100",
    quote: "The money saved feature blew my mind. I didn't realize I was spending $700/month on alcohol. Now that money goes to my kids.",
  },
  {
    name: "Jennifer K.",
    days: 412,
    saved: "$8,900",
    quote: "The trigger logger helped me realize stress at work was my #1 trigger. Once I saw the pattern, I could break it.",
  },
];

const faqs = [
  {
    q: "Is Sobable really free?",
    a: "Yes! All core features — day counter, money saved, mood tracking, trigger logging — are 100% free forever. We offer an optional premium 'Sober Club' for advanced AI coaching and community features.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your recovery journey is personal. We use bank-level encryption and never sell your data. You can use the app completely anonymously.",
  },
  {
    q: "What if I relapse?",
    a: "Recovery isn't linear. Sobable has a built-in relapse prevention plan, emergency SOS button, and supportive community. You can reset your counter without shame — what matters is getting back up.",
  },
  {
    q: "Does it work for all addictions?",
    a: "Yes. Sobable works for alcohol, drugs, smoking, gambling, and more. You customize it to your specific recovery journey during onboarding.",
  },
];

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate("/app");
    }
  }, [user, loading, navigate]);

  const scrollToCTA = () => {
    document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background overflow-x-hidden" role="main">
      {/* ===== STEP 1: HOOK — Emotional Headline ===== */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 mb-8"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Join 50,000+ people in recovery</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-[1.1]"
          >
            You Already Made the{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-primary bg-clip-text text-transparent">
              Hardest Decision.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Now let Sobable help you keep it. Track your sober days, see your money saved, and build the life you deserve — one day at a time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <AppStoreBadges size="lg" />
            <p className="text-xs text-muted-foreground">Free download • No account required • 100% private</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16"
          >
            <button onClick={scrollToCTA} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Scroll down">
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== STEP 2: AGITATE — The Pain Points ===== */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/[0.03] to-background" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sound Familiar?
            </h2>
            <p className="text-muted-foreground text-lg">
              Recovery without the right tools is like navigating in the dark.
            </p>
          </motion.div>

          <div className="space-y-4">
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-destructive/[0.06] border border-destructive/10"
              >
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-foreground/90 font-medium">{point.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-xl md:text-2xl font-semibold">
              There's a better way.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">
                And it's free.
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== STEP 3: SOLUTION — Introduce the App ===== */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Phone showcase */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <motion.picture
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <source srcSet={`${phoneMockup1Webp} 1x`} type="image/webp" />
                <img
                  src={phoneMockup1}
                  alt="Sobable sobriety tracker app"
                  width={288}
                  height={512}
                  className="w-64 sm:w-72 h-auto rounded-3xl shadow-2xl"
                  fetchPriority="high"
                />
              </motion.picture>
              <motion.picture
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -right-16 top-16 hidden sm:block"
              >
                <source srcSet={`${phoneMockup2Webp} 1x`} type="image/webp" />
                <img
                  src={phoneMockup2}
                  alt="Sobable daily motivation"
                  width={200}
                  height={356}
                  className="w-48 h-auto rounded-3xl shadow-xl opacity-80"
                />
              </motion.picture>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-amber-500/20 blur-[80px] -z-10 scale-125" />
            </div>
          </motion.div>

          {/* Value proposition */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <img src={sobableLogo} alt="Sobable" className="w-10 h-10" />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">
                Sobable
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Your Pocket Recovery{" "}
              <span className="bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">
                Companion
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Everything you need to track, understand, and strengthen your recovery — all in one beautiful, private app.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Sobriety day counter with milestones",
                "Real-time money saved calculator",
                "Mood & craving tracker with pattern insights",
                "Emergency SOS for instant support",
                "Daily motivation tailored to you",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground/90">{item}</span>
                </div>
              ))}
            </div>

            <AppStoreBadges size="md" className="justify-start" />
          </motion.div>
        </div>
      </section>

      {/* ===== STEP 4: SOCIAL PROOF — Testimonials + Stats ===== */}
      <section className="py-24 px-6 bg-gradient-to-b from-background via-card/30 to-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Don't Take Our Word for It
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from real people reclaiming their lives.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 mb-14 p-6 rounded-2xl glass-card"
          >
            {[
              { value: "50K+", label: "Active Users", icon: Users },
              { value: "4.9★", label: "App Store Rating", icon: Star },
              { value: "2M+", label: "Sober Days Tracked", icon: Calendar },
              { value: "$12M+", label: "Money Saved", icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-foreground mb-1">
                  <stat.icon className="w-5 h-5 text-amber-400" />
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-amber-500/10 flex flex-col"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-4 italic flex-1">"{t.quote}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <p className="text-xs text-muted-foreground">{t.days} days sober</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">{t.saved}</span>
                    <p className="text-xs text-muted-foreground">saved</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STEP 5: DEEP BENEFITS — Feature Breakdown ===== */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Powerful & Free</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need,{" "}
              <span className="bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">
                Nothing You Don't
              </span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="p-6 rounded-2xl card-enhanced group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-shadow">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Inline CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 text-center"
          >
            <p className="text-muted-foreground mb-4">All of this. Completely free.</p>
            <AppStoreBadges size="md" />
          </motion.div>
        </div>
      </section>

      {/* ===== STEP 6: HOW IT WORKS — Simple 3 Steps ===== */}
      <section className="py-24 px-6 bg-gradient-to-b from-background via-card/20 to-background">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Start in{" "}
              <span className="bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">
                30 Seconds
              </span>
            </h2>
          </motion.div>

          <div className="space-y-0">
            {[
              {
                step: "1",
                title: "Download the Free App",
                desc: "Available on iOS, Android, and web. No credit card, no account required.",
              },
              {
                step: "2",
                title: "Set Your Sobriety Date",
                desc: "Enter when you started (or start today). Your personal counter begins immediately.",
              },
              {
                step: "3",
                title: "Watch Yourself Transform",
                desc: "Log daily, earn milestones, see your money saved grow. Every day you're getting stronger.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex gap-6 items-start py-8 relative"
              >
                {/* Connecting line */}
                {index < 2 && (
                  <div className="absolute left-6 top-[4.5rem] w-px h-[calc(100%-3rem)] bg-gradient-to-b from-amber-500/40 to-transparent" />
                )}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-lg shadow-amber-500/20 relative z-10">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STEP 7: OBJECTION HANDLING — FAQ ===== */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions? We've Got Answers.</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-card/80 border border-border/50 hover:border-amber-500/20 transition-colors text-left"
                >
                  <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-5 pb-5 pt-2 text-muted-foreground"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STEP 8: PRIVACY — Trust Builder ===== */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-10 rounded-3xl glass-card"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Your Privacy is Sacred</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Your recovery is personal. We built Sobable with privacy-first architecture.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["No Account Needed", "Offline Access", "Bank-Level Encryption", "Anonymous Forever"].map((item, i) => (
                <div key={i} className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STEP 9: FINAL CTA — Urgency Close ===== */}
      <section id="final-cta" className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative"
        >
          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-primary/5 to-amber-500/10 rounded-3xl blur-3xl -z-10 scale-110" />

          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-amber-500/[0.08] via-card to-primary/[0.05] border border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

            <img src={sobableLogo} alt="Sobable" className="w-16 h-16 mx-auto mb-6" />

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Every Sober Day Counts.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">
                Start Counting Yours.
              </span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              50,000+ people are already on their journey. The only thing standing between you and Day 1 is a download.
            </p>

            <div className="mb-6">
              <AppStoreBadges size="lg" />
            </div>

            <p className="text-xs text-muted-foreground mb-8">
              Free forever • No credit card • Takes 30 seconds
            </p>

            <div className="pt-6 border-t border-border/30">
              <p className="text-sm text-muted-foreground mb-3">Prefer your browser?</p>
              <Button asChild size="lg" variant="outline" className="px-8 border-amber-500/30 hover:bg-amber-500/10">
                <Link to="/auth">
                  Try Web Version
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={sobableLogo} alt="Sobable" className="w-6 h-6" />
            <span className="font-semibold bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">
              Sobable
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Rise. Recover. Renew.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
