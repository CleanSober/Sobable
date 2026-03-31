import { motion } from "framer-motion";
import { 
  ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle, Scale, 
  RefreshCw, Mail, Shield, Gavel, Users, Brain, CreditCard, Globe, 
  Clock, Ban, BookOpen, AlertOctagon, HeartPulse, MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  const sections = [
    {
      icon: CheckCircle,
      title: "1. Acceptance of Terms",
      content: `By downloading, installing, accessing, or using the Sober Club application ("App," "Service," or "Platform"), you ("User," "you," or "your") acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and any additional guidelines or policies referenced herein. If you do not agree to these Terms in their entirety, you must immediately cease all use of the App and delete it from your device(s).

These Terms constitute a legally binding agreement between you and Sober Club ("Company," "we," "us," or "our"). We reserve the right to modify, amend, or update these Terms at any time at our sole discretion. Material changes will be communicated through the App or via the email address associated with your account. Your continued use of the App after any modifications constitutes your binding acceptance of the revised Terms. It is your responsibility to review these Terms periodically.`
    },
    {
      icon: FileText,
      title: "2. Description of Service",
      content: `Sober Club is a digital wellness and recovery support application that provides tools including but not limited to: sobriety tracking, mood and trigger logging, guided meditations, breathing exercises, journaling, community forums, gamification features, AI-powered insights, sleep tracking, and motivational content.

THE APP IS DESIGNED SOLELY AS A SUPPLEMENTARY WELLNESS TOOL. It is not a medical device, therapeutic service, counseling platform, or substitute for professional addiction treatment, mental health services, or medical care of any kind. The App does not establish a doctor-patient, therapist-client, or any other professional healthcare relationship between you and the Company.

Features described as "AI-powered," "smart," or "personalized" use automated algorithms and artificial intelligence models. These features generate suggestions based on patterns in your data and should never be interpreted as professional advice, diagnoses, or treatment recommendations.`
    },
    {
      icon: HeartPulse,
      title: "3. Medical & Health Disclaimer",
      content: `THIS IS NOT A MEDICAL APPLICATION. THE APP DOES NOT PROVIDE MEDICAL ADVICE, DIAGNOSIS, TREATMENT, OR CRISIS INTERVENTION.

Nothing contained in this App—including text, graphics, images, information obtained from AI features, community content, or any other material—is intended to be or should be construed as medical advice. The content is provided for general informational and motivational purposes only.

NEVER DISREGARD PROFESSIONAL MEDICAL ADVICE, DELAY SEEKING MEDICAL TREATMENT, OR DISCONTINUE MEDICAL TREATMENT BECAUSE OF INFORMATION PROVIDED BY THIS APP.

If you are experiencing a medical emergency, suicidal ideation, thoughts of self-harm, or any life-threatening situation, IMMEDIATELY call emergency services (911 in the US), contact the 988 Suicide & Crisis Lifeline (call or text 988), or go to your nearest emergency room. This App is NOT designed for crisis intervention and should not be relied upon during emergencies.

The Company makes no representations or warranties regarding the accuracy, completeness, or usefulness of any health-related information provided through the App. Recovery outcomes vary significantly between individuals, and no specific outcome is guaranteed.`
    },
    {
      icon: AlertOctagon,
      title: "4. Assumption of Risk",
      content: `YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE APP IS AT YOUR SOLE RISK.

By using this App, you voluntarily assume all risks associated with its use, including but not limited to:

• Reliance on sobriety tracking data, mood analysis, trigger patterns, AI-generated insights, or any other information provided by the App
• Emotional distress that may arise from engaging with recovery-related content, community discussions, or personal data review
• Decisions made based on App features including but not limited to craving timers, breathing exercises, meditation guides, risk predictions, or personalized recommendations
• Interactions with other users through community features, forums, live chat, or direct messaging
• Any physical, emotional, or psychological harm resulting from following suggestions, participating in challenges, or engaging with any App feature

The Company does not guarantee that the App will prevent relapse, improve health outcomes, or produce any specific result. Individual recovery journeys are unique, and the App's tools and features may not be suitable for every user.`
    },
    {
      icon: Scale,
      title: "5. User Responsibilities & Eligibility",
      content: `AGE REQUIREMENT: You must be at least 18 years of age (or the age of majority in your jurisdiction, whichever is greater) to create an account and use this App. By using the App, you represent and warrant that you meet this age requirement.

You are responsible for:
• Maintaining the confidentiality and security of your account credentials
• All activities that occur under your account, whether authorized by you or not
• Providing accurate, current, and complete information during registration and throughout your use
• Seeking appropriate professional medical and mental health care independently of this App
• Ensuring your use of the App complies with all applicable local, state, national, and international laws and regulations
• Any consequences of decisions you make based on information provided by the App
• Promptly notifying us of any unauthorized use of your account or security breach`
    },
    {
      icon: Ban,
      title: "6. Prohibited Conduct",
      content: `You agree not to, and will not assist or enable others to:

• Use the App for any unlawful, fraudulent, or malicious purpose
• Harass, bully, threaten, intimidate, stalk, or abuse any other user
• Post, transmit, or share content that is defamatory, obscene, pornographic, hateful, discriminatory, or promotes violence or illegal activity
• Impersonate any person or entity, or falsely state or misrepresent your identity or affiliation
• Provide medical advice, diagnosis, or treatment recommendations to other users
• Promote, glorify, or encourage substance use, self-harm, or dangerous behaviors
• Share another user's personal information, recovery details, or private communications without their explicit consent
• Attempt to gain unauthorized access to other users' accounts, the App's systems, servers, or networks
• Interfere with or disrupt the App's infrastructure, functionality, or other users' experience
• Use automated systems, bots, scrapers, or similar technology to access or collect data from the App
• Circumvent, disable, or interfere with security features of the App
• Use the App for commercial purposes, advertising, or solicitation without prior written consent
• Reverse engineer, decompile, disassemble, or attempt to derive the source code of the App

Violation of these provisions may result in immediate account suspension or termination without notice, and may subject you to civil and/or criminal liability.`
    },
    {
      icon: MessageSquare,
      title: "7. User-Generated Content & Community",
      content: `"User Content" means any content you submit, post, or display through the App, including but not limited to community posts, forum discussions, journal entries (when shared), comments, reactions, and messages.

LICENSE GRANT: By submitting User Content to any public or community feature of the App, you grant the Company a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate, and display such content in connection with operating and improving the Service. This license continues even if you stop using the Service, solely to the extent necessary for the Company to operate its services.

PRIVATE CONTENT: Journal entries, mood logs, trigger logs, sleep data, and other personal tracking data that you do not voluntarily share through community features remain private and are not subject to the above license grant.

CONTENT MODERATION: We reserve the right, but have no obligation, to monitor, edit, or remove any User Content at our sole discretion, for any reason or no reason. We are not responsible for the accuracy, quality, legality, or appropriateness of User Content posted by users.

NO ENDORSEMENT: The Company does not endorse any User Content or any opinion, recommendation, or advice expressed therein. Under no circumstances will the Company be liable for any User Content, including any errors or omissions, or any loss or damage resulting from the use of User Content.`
    },
    {
      icon: Brain,
      title: "8. AI Features & Automated Content",
      content: `The App incorporates artificial intelligence and machine learning features, including but not limited to: AI recovery coaching, personalized recommendations, mood analysis, pattern detection, risk predictions, journal prompts, and smart insights ("AI Features").

IMPORTANT DISCLAIMERS REGARDING AI FEATURES:

• AI-generated content is produced by automated systems and may contain errors, inaccuracies, biases, or inappropriate suggestions
• AI Features do not constitute professional advice of any kind—medical, psychological, legal, or otherwise
• AI responses should never be used as a basis for medical decisions, treatment changes, or crisis management
• The Company does not guarantee the accuracy, reliability, completeness, or timeliness of any AI-generated content
• AI models may produce different outputs for similar inputs, and outputs may change as models are updated
• AI Features may not account for your complete medical history, individual circumstances, or current medications
• You should independently verify any information provided by AI Features with qualified professionals

THE COMPANY EXPRESSLY DISCLAIMS ALL LIABILITY ARISING FROM YOUR RELIANCE ON AI-GENERATED CONTENT.`
    },
    {
      icon: CreditCard,
      title: "9. Subscriptions, Payments & Refunds",
      content: `PREMIUM FEATURES: Certain features of the App ("Sober Club" or premium features) require a paid subscription. Pricing, features included, and subscription tiers are described within the App and may change at any time.

AUTO-RENEWAL: Subscriptions automatically renew at the end of each billing period unless cancelled at least 24 hours before the end of the current period. Cancellation of auto-renewal takes effect at the end of the current billing period.

PAYMENT: Payment is charged to your Apple App Store, Google Play Store, or Stripe account at confirmation of purchase. The applicable platform's terms and conditions govern all payment processing.

CANCELLATION: You can manage and cancel your subscription through your device's account settings (Apple/Google) or through the App's account management features. Cancellation does not entitle you to a refund for the current billing period.

REFUNDS: Refund requests are subject to the refund policies of the applicable platform (Apple App Store or Google Play Store). The Company has limited ability to issue refunds for purchases made through third-party platforms. For direct purchases, refund requests must be made within 14 days of purchase.

FREE TRIALS: If offered, free trial periods automatically convert to paid subscriptions unless cancelled before the trial expires. You will be notified before any charge occurs.

PRICE CHANGES: We reserve the right to change subscription pricing. Existing subscribers will be notified of price changes at least 30 days before they take effect. Continued use after a price change constitutes acceptance of the new pricing.`
    },
    {
      icon: BookOpen,
      title: "10. Intellectual Property",
      content: `All content, features, functionality, designs, text, graphics, logos, icons, images, audio, video, software, and the compilation thereof ("Company Content") are the exclusive property of Sober Club and/or its licensors and are protected by United States and international copyright, trademark, trade secret, patent, and other intellectual property laws.

TRADEMARKS: "Sober Club," the Sober Club logo, and all related names, logos, product and service names, designs, and slogans are trademarks of the Company. You may not use such marks without our prior written permission.

RESTRICTIONS: You may not:
• Copy, modify, distribute, sell, lease, or create derivative works based on the App or its content
• Use any data mining, robots, or similar data gathering methods on the App
• Download or cache any content except as explicitly permitted by the App's functionality
• Use any Company Content outside of the App without express written permission

USER FEEDBACK: Any feedback, suggestions, ideas, or other submissions you provide to us regarding the App ("Feedback") shall be deemed non-confidential and shall become the sole property of the Company. We shall be entitled to unrestricted use of Feedback for any purpose without compensation to you.`
    },
    {
      icon: Shield,
      title: "11. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:

THE APP AND ALL CONTENT, FEATURES, AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.

THE COMPANY DOES NOT WARRANT THAT: (A) THE APP WILL FUNCTION UNINTERRUPTED, SECURELY, OR ERROR-FREE; (B) THE RESULTS OBTAINED FROM USE OF THE APP WILL BE ACCURATE OR RELIABLE; (C) ANY ERRORS IN THE APP WILL BE CORRECTED; OR (D) THE APP WILL MEET YOUR SPECIFIC REQUIREMENTS OR EXPECTATIONS.

IN NO EVENT SHALL THE COMPANY, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, PARTNERS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR:
• LOSS OF PROFITS, REVENUE, GOODWILL, OR DATA
• PERSONAL INJURY OR EMOTIONAL DISTRESS
• RELAPSE OR FAILURE TO MAINTAIN SOBRIETY
• DECISIONS MADE BASED ON APP INFORMATION OR AI-GENERATED CONTENT
• INTERACTIONS WITH OTHER USERS
• UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA
• ANY OTHER MATTER RELATING TO THE APP

IN JURISDICTIONS THAT DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, OUR LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.

MAXIMUM LIABILITY: IN ANY CASE, THE COMPANY'S TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THE APP SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID TO THE COMPANY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00).`
    },
    {
      icon: Gavel,
      title: "12. Indemnification",
      content: `You agree to defend, indemnify, and hold harmless the Company, its parent companies, subsidiaries, affiliates, officers, directors, employees, agents, contractors, licensors, service providers, subcontractors, suppliers, and their respective successors and assigns from and against any and all claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:

• Your violation of these Terms
• Your use or misuse of the App
• Your User Content or any content you submit, post, or transmit through the App
• Your violation of any rights of any third party
• Your violation of any applicable laws, rules, or regulations
• Any claim that your User Content caused damage to a third party
• Any misrepresentation made by you
• Your interactions with other users of the App

This indemnification obligation will survive the termination of your account and your use of the App.`
    },
    {
      icon: Scale,
      title: "13. Dispute Resolution & Arbitration",
      content: `PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT.

INFORMAL RESOLUTION: Before filing any formal dispute, you agree to first contact us at legal@soberclub.app and attempt to resolve the dispute informally for at least 30 days.

BINDING ARBITRATION: If informal resolution fails, any dispute, controversy, or claim arising out of or relating to these Terms or the App shall be resolved exclusively through binding individual arbitration administered by the American Arbitration Association ("AAA") under its Consumer Arbitration Rules. The arbitration shall be conducted in English, and the arbitrator's decision shall be final and binding.

CLASS ACTION WAIVER: YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. You expressly waive any right to participate in a class action lawsuit or class-wide arbitration against the Company.

JURY TRIAL WAIVER: YOU HEREBY WAIVE YOUR RIGHT TO A JURY TRIAL FOR ANY CLAIMS COVERED BY THIS ARBITRATION AGREEMENT.

EXCEPTIONS: Notwithstanding the above, either party may: (a) bring an individual action in small claims court; (b) seek injunctive or equitable relief in any court of competent jurisdiction to prevent the actual or threatened infringement of intellectual property rights.

OPT-OUT: You may opt out of this arbitration agreement by sending written notice to legal@soberclub.app within 30 days of first accepting these Terms. The notice must include your name, account information, and a clear statement that you wish to opt out.`
    },
    {
      icon: Globe,
      title: "14. Governing Law & Jurisdiction",
      content: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.

For any claims not subject to arbitration, you consent to the exclusive jurisdiction and venue of the state and federal courts located in Delaware, and you waive any objection to such jurisdiction or venue.

INTERNATIONAL USERS: If you access the App from outside the United States, you do so at your own risk and are responsible for compliance with local laws. The App is operated from the United States, and we make no representation that the App is appropriate or available for use in other locations.`
    },
    {
      icon: RefreshCw,
      title: "15. Termination",
      content: `TERMINATION BY COMPANY: We may suspend, disable, or terminate your account or access to the App at any time, with or without cause, and with or without notice, at our sole discretion. Reasons for termination may include, but are not limited to, violation of these Terms, harmful behavior toward other users, suspected fraudulent activity, or extended periods of inactivity.

TERMINATION BY USER: You may terminate your account at any time through the App settings or by contacting us. Upon termination, your right to use the App ceases immediately.

EFFECTS OF TERMINATION: Upon termination: (a) all licenses and rights granted to you under these Terms will immediately cease; (b) you must cease all use of the App; (c) we may, but are not obligated to, delete your account data in accordance with our Privacy Policy; (d) any outstanding subscription payments remain due; (e) provisions that by their nature should survive termination will survive, including but not limited to Sections 3, 4, 8, 10, 11, 12, 13, 14, and 17.`
    },
    {
      icon: Clock,
      title: "16. Force Majeure",
      content: `The Company shall not be liable for any failure or delay in performing its obligations under these Terms where such failure or delay results from circumstances beyond its reasonable control, including but not limited to: acts of God, natural disasters, pandemics, epidemics, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, labor disputes, shortages of transportation, fuel, energy, labor, or materials, failure of third-party service providers, internet or telecommunications failures, cyberattacks, or government actions.`
    },
    {
      icon: FileText,
      title: "17. General Provisions",
      content: `ENTIRE AGREEMENT: These Terms, together with the Privacy Policy and any other agreements expressly incorporated by reference, constitute the entire agreement between you and the Company regarding the App and supersede all prior agreements and understandings.

SEVERABILITY: If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.

NO WAIVER: The Company's failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waiver of any provision shall be effective only if in writing and signed by the Company.

ASSIGNMENT: You may not assign or transfer your rights or obligations under these Terms without the Company's prior written consent. The Company may assign its rights and obligations without restriction.

NOTICES: We may provide notices to you via the App, email, or other reasonable means. You agree that electronic communications satisfy any legal requirement for written communications.

HEADINGS: Section headings are for convenience only and shall not affect the interpretation of these Terms.

SURVIVAL: All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`
    }
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Terms of Service</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Please read these terms carefully before using Sober Club. By using our app, you agree to these terms and conditions.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Effective Date: February 6, 2026 · Last Updated: February 6, 2026
          </p>
        </motion.div>

        {/* Critical Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-enhanced p-5 mb-8 border-destructive/30 bg-destructive/5"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-destructive/15 border border-destructive/25 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                IMPORTANT: Please Read Before Using
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                These Terms contain an <strong className="text-foreground">arbitration clause and class action waiver</strong> (Section 13) that affect your legal rights. By using the App, you agree to resolve disputes through binding individual arbitration rather than in court.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This App is <strong className="text-foreground">NOT a medical device or healthcare service</strong>. It does not provide medical advice, diagnosis, or treatment. If you are in crisis, call <strong className="text-foreground">911</strong> or the <strong className="text-foreground">988 Suicide & Crisis Lifeline</strong>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
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

        {/* Community Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-enhanced p-6 mt-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Community Guidelines</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Our community exists to provide mutual support. When using community features, you must:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Be supportive and encouraging — never provide medical or treatment advice",
              "Respect others' privacy, anonymity, and recovery journeys",
              "Never share graphic or triggering details about substance use",
              "Report concerning content or behavior immediately",
              "Maintain confidentiality of shared experiences",
              "Never solicit personal information or contact details from other users",
              "Refrain from commercial promotion or solicitation",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="card-enhanced p-6 mt-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If you have questions about these Terms, wish to report a violation, or need to exercise any rights described herein, please contact us:
          </p>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Legal inquiries: </span><span className="text-primary font-medium">legal@soberclub.app</span></p>
            <p><span className="text-muted-foreground">General support: </span><span className="text-primary font-medium">support@soberclub.app</span></p>
            <p><span className="text-muted-foreground">Privacy concerns: </span><span className="text-primary font-medium">privacy@soberclub.app</span></p>
          </div>
        </motion.div>

        {/* Acknowledgment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-enhanced p-5 mt-5 border-primary/20 bg-primary/5"
        >
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            By creating an account or using the Sober Club application, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service in their entirety, including the arbitration clause and class action waiver in Section 13.
          </p>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-wrap gap-4 justify-center">
          <Link to="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
        </div>
      </main>
    </div>
  );
};

export default Terms;
