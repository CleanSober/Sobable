import { motion } from "framer-motion";
import { 
  ArrowLeft, Shield, Lock, Eye, Database, Bell, Users, Trash2, Mail, 
  Globe, Cookie, Baby, Scale, Server, Share2, AlertTriangle, FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const sections = [
    {
      icon: Database,
      title: "1. Information We Collect",
      items: [
        { subtitle: "Account Information", points: [
          "Email address and display name provided during registration",
          "Authentication credentials (securely hashed; we never store plain-text passwords)",
          "Profile information including avatar, sobriety start date, and substances tracked",
        ]},
        { subtitle: "Recovery & Health Data", points: [
          "Sobriety tracking dates and milestones",
          "Mood entries, craving levels, and emotional check-ins",
          "Trigger logs including situations, emotions, intensity levels, and coping strategies",
          "Sleep tracking data (bedtime, wake time, quality ratings)",
          "Journal entries and personal reflections",
          "Prevention plan data (warning signals, coping strategies, emergency contacts)",
          "Challenge progress and daily goal completion",
        ]},
        { subtitle: "Usage & Device Information", points: [
          "App interaction data (features used, session duration, navigation patterns)",
          "Device type, operating system version, and unique device identifiers",
          "IP address, browser type, and approximate geolocation (country/region level)",
          "Crash reports and performance diagnostics",
        ]},
        { subtitle: "Community Data", points: [
          "Posts, comments, replies, and reactions shared in community features",
          "Chat messages and forum interactions",
          "User reports, blocks, and moderation actions",
        ]},
        { subtitle: "Payment Information", points: [
          "Subscription status and plan type",
          "Transaction history (amounts and dates; full payment details are processed and stored exclusively by third-party payment processors)",
        ]},
        { subtitle: "Optional Information", points: [
          "Sponsor phone number and emergency contact information",
          "Personal motivational reminders",
          "Daily spending amounts (for savings calculations)",
        ]},
      ]
    },
    {
      icon: Lock,
      title: "2. How We Use Your Information",
      items: [
        { subtitle: "Service Delivery", points: [
          "To create, maintain, and secure your account",
          "To provide sobriety tracking, mood logging, and all core App features",
          "To generate personalized insights, recommendations, and AI-powered analysis",
          "To facilitate community features including posts, forums, and chat",
          "To process subscriptions and manage payment status",
        ]},
        { subtitle: "Improvement & Analytics", points: [
          "To analyze usage patterns and improve App functionality",
          "To develop new features based on aggregated (anonymized) usage data",
          "To monitor and improve App performance, stability, and security",
          "To conduct internal research using anonymized and aggregated data sets",
        ]},
        { subtitle: "Communications", points: [
          "To send streak reminders, progress updates, and motivational content (if opted in)",
          "To send weekly digest emails summarizing your progress (if opted in)",
          "To notify you of important changes to the App, Terms, or Privacy Policy",
          "To respond to your support requests and inquiries",
        ]},
        { subtitle: "Safety & Compliance", points: [
          "To detect, prevent, and address technical issues, fraud, and abuse",
          "To enforce our Terms of Service and Community Guidelines",
          "To moderate community content and protect user safety",
          "To comply with applicable legal obligations, court orders, and law enforcement requests",
        ]},
      ]
    },
    {
      icon: Shield,
      title: "3. Data Protection & Security",
      items: [
        { subtitle: "Technical Safeguards", points: [
          "All data is encrypted in transit using TLS 1.2+ (HTTPS)",
          "Data at rest is encrypted using AES-256 encryption",
          "Row-level security (RLS) policies ensure users can only access their own data",
          "Authentication tokens are securely managed with automatic refresh and expiration",
          "Regular security audits and vulnerability assessments are conducted",
        ]},
        { subtitle: "Organizational Safeguards", points: [
          "Access to user data is strictly limited to authorized personnel on a need-to-know basis",
          "All personnel with data access undergo background checks and security training",
          "We maintain incident response procedures for data breaches",
          "We will notify affected users and relevant authorities of any data breach within 72 hours as required by applicable law",
        ]},
        { subtitle: "Important Disclaimer", points: [
          "While we implement industry-standard security measures, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security of your data.",
        ]},
      ]
    },
    {
      icon: Share2,
      title: "4. Data Sharing & Disclosure",
      items: [
        { subtitle: "We DO NOT", points: [
          "Sell your personal information to third parties — ever",
          "Share your recovery data, mood entries, journal content, or health information with advertisers",
          "Provide your data to data brokers or marketing companies",
        ]},
        { subtitle: "We MAY Share Data With", points: [
          "Service providers who assist in operating the App (hosting, analytics, payment processing) — bound by confidentiality agreements",
          "Law enforcement or government authorities when required by law, subpoena, or court order",
          "Third parties in connection with a merger, acquisition, bankruptcy, or sale of Company assets — with prior notice to users",
          "Other users — only content you voluntarily share in community features",
        ]},
        { subtitle: "Third-Party Service Providers", points: [
          "Cloud hosting & database infrastructure (data storage and processing)",
          "Authentication services (secure account management)",
          "Payment processors: Stripe, Apple App Store, Google Play (subscription billing)",
          "AI/ML model providers (for generating insights — data is sent only as needed and not retained by providers for training)",
          "Analytics services (anonymized usage data only)",
        ]},
      ]
    },
  ];

  const rightsSections = [
    {
      icon: Eye,
      title: "5. Your Privacy Rights",
      content: `Depending on your location, you may have the following rights regarding your personal data:

ACCESS: You have the right to request a copy of all personal data we hold about you. We will provide this in a commonly used, machine-readable format within 30 days of your request.

CORRECTION: You can update or correct your personal information at any time through the App settings, or by contacting us.

DELETION: You can request deletion of your account and all associated personal data. Upon request, we will delete your data within 30 days, except where retention is required by law.

PORTABILITY: You have the right to receive your data in a structured, machine-readable format and to transfer it to another service.

RESTRICTION: You can request that we restrict processing of your data under certain circumstances.

OBJECTION: You can object to processing of your data for certain purposes, including direct marketing.

WITHDRAWAL OF CONSENT: Where processing is based on consent, you may withdraw consent at any time without affecting the lawfulness of processing before withdrawal.

NON-DISCRIMINATION: We will not discriminate against you for exercising any of your privacy rights.

To exercise any of these rights, contact us at privacy@sobable.app. We will respond within 30 days (or as required by applicable law).`
    },
    {
      icon: Globe,
      title: "6. Regional Privacy Compliance",
      content: `GDPR (European Economic Area): If you are located in the EEA, UK, or Switzerland, you have additional rights under the General Data Protection Regulation. Our lawful bases for processing include: performance of contract (providing the Service), legitimate interests (improving the App, preventing fraud), consent (marketing communications), and legal obligations. You may lodge a complaint with your local Data Protection Authority.

CCPA/CPRA (California): California residents have additional rights under the California Consumer Privacy Act and California Privacy Rights Act, including the right to know what personal information is collected, the right to delete, the right to opt out of sale (we do not sell personal information), and the right to non-discrimination. California residents may designate an authorized agent to make requests on their behalf.

LGPD (Brazil): Brazilian residents have rights under the Lei Geral de Proteção de Dados, including confirmation of processing, access, correction, anonymization, portability, and deletion.

POPIA (South Africa): South African residents have rights under the Protection of Personal Information Act, including the right to access, correct, and delete personal information.

We process and store data primarily in the United States. By using the App, you consent to the transfer of your data to the United States, which may have different data protection laws than your country of residence. We ensure appropriate safeguards are in place for international data transfers.`
    },
    {
      icon: Cookie,
      title: "7. Cookies & Tracking Technologies",
      content: `The App may use the following technologies:

ESSENTIAL COOKIES/STORAGE: Required for authentication, session management, and core App functionality. These cannot be disabled without affecting App operation.

ANALYTICS: We may use anonymized analytics to understand how the App is used and to improve our services. Analytics data is aggregated and cannot be used to identify individual users.

PUSH NOTIFICATIONS: If you opt in, we use push notification tokens to deliver reminders and motivational content. You can disable notifications at any time through your device settings.

ADVERTISING: If ads are displayed (free tier), third-party ad networks may use identifiers for ad delivery and measurement. You can opt out of personalized advertising through your device settings.

We do not use tracking technologies to monitor your activity across other websites or applications.`
    },
    {
      icon: Baby,
      title: "8. Children's Privacy",
      content: `The App is not intended for use by individuals under the age of 18 (or the age of majority in your jurisdiction). We do not knowingly collect personal information from minors.

If we become aware that we have collected personal information from a person under 18, we will take immediate steps to delete such information. If you believe a minor has provided us with personal information, please contact us immediately at privacy@sobable.app.

Parents and guardians who believe their child has provided personal information to us may request deletion by contacting us at the email address above.`
    },
    {
      icon: Trash2,
      title: "9. Data Retention & Deletion",
      content: `ACTIVE ACCOUNTS: Your data is retained for as long as your account is active and as needed to provide you with our services.

ACCOUNT DELETION: Upon account deletion request:
• Personal profile data, mood entries, trigger logs, journal entries, sleep data, and other personal tracking data will be permanently deleted within 30 days
• Community posts and forum contributions may be anonymized rather than deleted to preserve conversation context
• Backup copies will be purged within 90 days
• Payment records may be retained as required by tax and financial regulations (typically 7 years)

INACTIVE ACCOUNTS: Accounts inactive for more than 24 months may be flagged for deletion. We will attempt to notify you via email before deleting inactive accounts.

ANONYMIZED DATA: We may retain anonymized, aggregated data that cannot be used to identify individual users for statistical analysis and service improvement purposes indefinitely.

LEGAL REQUIREMENTS: We may retain certain data as required by applicable laws, regulations, or legal proceedings, even after account deletion.`
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Privacy Policy</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your recovery journey is deeply personal. We are committed to protecting your data with the highest standards of privacy and security.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Effective Date: February 6, 2026 · Last Updated: February 6, 2026
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-enhanced p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">Introduction</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Sobable ("Company," "we," "us," or "our") operates the Sobable mobile and web application ("App" or "Service"). This Privacy Policy explains how we collect, use, disclose, retain, and safeguard your information when you use our Service.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We understand that recovery data and health-related information is among the most sensitive personal data. We treat all user data with the utmost care and confidentiality. <strong className="text-foreground">We never sell your personal information.</strong>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By using the App, you consent to the data practices described in this Privacy Policy. If you do not agree with this Policy, please do not use the App.
          </p>
        </motion.div>

        {/* Sensitive Data Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card-enhanced p-5 mb-8 border-warning/30 bg-warning/5"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-warning/15 border border-warning/25 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">Sensitive Health Data Notice</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This App collects data related to substance use recovery, mental health, mood, and sleep patterns. While we implement strong protections, please be aware that you are voluntarily providing this sensitive information. We are <strong className="text-foreground">not</strong> a HIPAA-covered entity, and data shared through the App is not protected by HIPAA. If you require HIPAA-protected communications, please use your healthcare provider's designated channels.
              </p>
            </div>
          </div>
        </motion.div>

        {/* List-based Sections */}
        <div className="space-y-5">
          {sections.map((section, sIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + sIndex * 0.04 }}
              className="card-enhanced p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              </div>
              <div className="space-y-5">
                {section.items.map((item, iIndex) => (
                  <div key={iIndex}>
                    <h4 className="text-sm font-semibold text-foreground mb-2">{item.subtitle}</h4>
                    <ul className="space-y-1.5">
                      {item.points.map((point, pIndex) => (
                        <li key={pIndex} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Text-based Sections */}
        <div className="space-y-5 mt-5">
          {rightsSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.04 }}
              className="card-enhanced p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Third-Party Services Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="card-enhanced p-6 mt-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">10. Third-Party Services & Links</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            The App may contain links to third-party websites, services, or resources. We are not responsible for the privacy practices, content, or security of any third-party services. We encourage you to review the privacy policies of any third-party services you access.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Third-party service providers who process data on our behalf are contractually obligated to protect your data and may only use it for the purposes we specify.
          </p>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58 }}
          className="card-enhanced p-6 mt-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">11. Changes to This Policy</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. Material changes will be communicated through the App or via email at least 30 days before they take effect. The "Last Updated" date at the top of this policy indicates when the latest revisions were made. Your continued use of the App after changes become effective constitutes your acceptance of the revised Policy. We encourage you to review this Policy periodically.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-enhanced p-6 mt-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">12. Contact Us</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If you have questions about this Privacy Policy, wish to exercise your data rights, or need to report a privacy concern, please contact us:
          </p>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Privacy inquiries: </span><span className="text-primary font-medium">privacy@sobable.app</span></p>
            <p><span className="text-muted-foreground">Data deletion requests: </span><span className="text-primary font-medium">privacy@sobable.app</span></p>
            <p><span className="text-muted-foreground">General support: </span><span className="text-primary font-medium">support@sobable.app</span></p>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            We will respond to all privacy-related requests within 30 days (or as required by applicable law in your jurisdiction).
          </p>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-wrap gap-4 justify-center">
          <Link to="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
