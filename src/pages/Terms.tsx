import { motion } from "framer-motion";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle, Scale, RefreshCw, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: `By downloading, installing, or using Clean & Sober, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application. We reserve the right to modify these terms at any time, and your continued use of the app constitutes acceptance of any changes.`
    },
    {
      icon: FileText,
      title: "Description of Service",
      content: `Clean & Sober is a recovery support application designed to help individuals track their sobriety journey, log moods and triggers, connect with a supportive community, and access recovery resources. The app is intended as a supplementary tool and is not a substitute for professional medical treatment, therapy, or addiction counseling.`
    },
    {
      icon: AlertTriangle,
      title: "Medical Disclaimer",
      content: `This application is not a medical device and does not provide medical advice, diagnosis, or treatment. The content and features are for informational and motivational purposes only. If you are experiencing a medical emergency, please call emergency services immediately. Always seek the advice of qualified healthcare providers for any medical concerns.`
    },
    {
      icon: Scale,
      title: "User Responsibilities",
      content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to update it as necessary. You must not use the app for any unlawful purpose or in violation of these terms. You are solely responsible for any content you post in community features.`
    },
    {
      icon: XCircle,
      title: "Prohibited Conduct",
      content: `You agree not to: harass, bully, or threaten other users; post harmful, offensive, or illegal content; attempt to gain unauthorized access to other accounts; use the app to promote substances or harmful behaviors; share others' personal information without consent; or interfere with the proper functioning of the application.`
    },
    {
      icon: RefreshCw,
      title: "Subscription & Payments",
      content: `Some features may require a paid subscription. Subscriptions automatically renew unless cancelled at least 24 hours before the renewal date. Payment is charged to your App Store or Play Store account. You can manage and cancel subscriptions in your device's account settings. Refunds are subject to the policies of Apple or Google.`
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
          <h1 className="text-lg font-semibold text-foreground">Terms of Service</h1>
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
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Terms of Service
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Please read these terms carefully before using Clean & Sober. By using our app, you agree to these terms and conditions.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: January 30, 2026
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
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Community Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-enhanced p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Community Guidelines</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our community is built on mutual support and respect. When participating in community features:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              Be supportive and encouraging to fellow members
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              Respect others' privacy and recovery journeys
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              Report any concerning content or behavior
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              Share experiences without providing medical advice
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              Maintain a safe and judgment-free environment
            </li>
          </ul>
        </motion.div>

        {/* Intellectual Property */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="card-enhanced p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">Intellectual Property</h3>
          <p className="text-muted-foreground leading-relaxed">
            The Clean & Sober app, including its design, features, content, and branding, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
          </p>
        </motion.div>

        {/* Limitation of Liability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-enhanced p-6 mt-6 border-destructive/20"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">Limitation of Liability</h3>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, Clean & Sober and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the application. The app is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation.
          </p>
        </motion.div>

        {/* Termination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="card-enhanced p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">Termination</h3>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to suspend or terminate your access to the app at any time for violation of these terms or for any other reason at our sole discretion. You may delete your account at any time through the app settings. Upon termination, your right to use the app ceases immediately.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-enhanced p-6 mt-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about these Terms of Service, please contact us at:
          </p>
          <p className="mt-3 text-primary font-medium">legal@cleanandsober.app</p>
        </motion.div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-wrap gap-4 justify-center">
          <Link to="/privacy" className="text-sm text-primary hover:underline">
            Privacy Policy
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

export default Terms;
