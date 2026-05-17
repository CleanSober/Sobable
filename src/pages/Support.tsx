import { Mail, MessageCircle, Shield, Clock, HelpCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

const FAQS = [
  {
    q: "How do I reset my sobriety counter?",
    a: "Go to your Profile and tap 'Edit Profile' to update your sobriety start date.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "On iOS, go to Settings → Apple ID → Subscriptions. On Android, go to Google Play Store → Subscriptions. On web, use the 'Manage Subscription' button in the app.",
  },
  {
    q: "How do I restore my purchases on a new device?",
    a: "Open the app, go to the upgrade screen, and tap 'Restore Purchases' at the bottom.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your journal entries, mood data, and personal information are encrypted and only accessible to you. We never sell your data.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Profile → scroll to the bottom and tap 'Delete Account'. This will permanently remove all your data.",
  },
];

const Support = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Sobable Support — FAQs, Contact & Crisis Resources"
        description="Get help with Sobable: reset your sober counter, manage your subscription, restore purchases, delete your account, and find crisis support."
        path="/support"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Sober Club Support</h1>
          <p className="text-muted-foreground">We're here to help you on your recovery journey.</p>
        </div>

        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="sr-only">Contact Us</h2>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                For any questions, issues, or feedback, reach out to our support team:
              </p>
              <a
                href="mailto:support@soberclub.app"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                support@soberclub.app
              </a>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                We typically respond within 24 hours.
              </p>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="sr-only">Frequently Asked Questions</h2>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{q}</p>
                  <p className="text-sm text-muted-foreground">{a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="crisis-heading">
          <h2 id="crisis-heading" className="sr-only">Crisis Resources</h2>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                Crisis Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If you or someone you know is in crisis, please reach out to these free, confidential resources:
              </p>
              <ul className="space-y-2 text-sm">
                <li><strong>SAMHSA Helpline:</strong> <a href="tel:1-800-662-4357" className="text-primary hover:underline">1-800-662-4357</a> (24/7)</li>
                <li><strong>Crisis Text Line:</strong> Text HOME to <a href="sms:741741" className="text-primary hover:underline">741741</a></li>
                <li><strong>988 Suicide & Crisis Lifeline:</strong> Call or text <a href="tel:988" className="text-primary hover:underline">988</a></li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="legal-heading">
          <h2 id="legal-heading" className="sr-only">Legal</h2>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/terms" className="block text-sm text-primary hover:underline">Terms of Service</a>
              <a href="/privacy" className="block text-sm text-primary hover:underline">Privacy Policy</a>
            </CardContent>
          </Card>
        </section>

        <p className="text-center text-xs text-muted-foreground pt-4">
          © {new Date().getFullYear()} Sober Club. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Support;
