import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, Database, Bell, Users, Trash2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Account information (email address, display name)",
        "Recovery progress data (sobriety date, mood entries, journal entries)",
        "Usage data (app interactions, feature usage)",
        "Device information (device type, operating system)",
        "Optional: sponsor phone number, emergency contacts"
      ]
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our recovery tracking services",
        "To personalize your experience and recommendations",
        "To send you progress updates and motivational content",
        "To improve our app based on usage patterns",
        "To provide customer support when needed"
      ]
    },
    {
      icon: Shield,
      title: "Data Protection",
      content: [
        "All data is encrypted in transit and at rest",
        "We use industry-standard security measures",
        "Access to your data is strictly limited",
        "Regular security audits are performed",
        "We never sell your personal information"
      ]
    },
    {
      icon: Eye,
      title: "Your Privacy Choices",
      content: [
        "You can access and update your information at any time",
        "You can request a copy of all your data",
        "You can delete your account and all associated data",
        "You can opt out of promotional communications",
        "You control what information is shared in the community"
      ]
    },
    {
      icon: Users,
      title: "Community Features",
      content: [
        "Community posts are visible to other users",
        "You can choose to post anonymously",
        "Direct messages are private between participants",
        "You can block other users at any time",
        "Reported content is reviewed by moderators"
      ]
    },
    {
      icon: Bell,
      title: "Notifications",
      content: [
        "Push notifications are optional",
        "You can customize notification preferences",
        "We send daily motivation if enabled",
        "Weekly digest emails summarize your progress",
        "You can disable all notifications at any time"
      ]
    },
    {
      icon: Trash2,
      title: "Data Retention & Deletion",
      content: [
        "Your data is retained while your account is active",
        "You can request account deletion at any time",
        "Upon deletion, all personal data is removed within 30 days",
        "Some anonymized data may be retained for analytics",
        "Backup data is purged within 90 days of deletion"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Your Privacy Matters
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: January 30, 2026
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-enhanced p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">Introduction</h3>
          <p className="text-muted-foreground leading-relaxed">
            Clean & Sober ("we", "our", or "us") operates the Clean & Sober mobile application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Your recovery journey is personal, and we treat your data with the utmost respect and confidentiality.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="card-enhanced p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Third-Party Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-enhanced p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">Third-Party Services</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use trusted third-party services to help operate our app:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span><strong>Authentication:</strong> Secure login services</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span><strong>Analytics:</strong> Anonymous usage statistics to improve the app</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span><strong>Payment Processing:</strong> Secure subscription handling (if applicable)</span>
            </li>
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-enhanced p-6 mt-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
          </p>
          <p className="mt-3 text-primary font-medium">privacy@cleanandsober.app</p>
        </motion.div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-wrap gap-4 justify-center">
          <Link to="/terms" className="text-sm text-primary hover:underline">
            Terms of Service
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/" className="text-sm text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
