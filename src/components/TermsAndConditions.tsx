import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Disclaimer Alert */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            Important Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            <strong className="text-foreground">This app is not a substitute for professional medical advice, diagnosis, or treatment.</strong> Sober Club is designed as a supplementary wellness tool and does not establish any healthcare provider relationship.
          </p>
          <p>
            If you are experiencing a medical emergency, thoughts of self-harm, or need immediate assistance:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Emergency Services: <strong>911</strong></li>
            <li>988 Suicide & Crisis Lifeline: <strong>988</strong> (call or text)</li>
            <li>SAMHSA National Helpline: <strong>1-800-662-4357</strong></li>
            <li>Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong></li>
          </ul>
          <p>
            Always consult qualified healthcare professionals for medical advice and treatment plans. AI-powered features generate automated suggestions that should never replace professional guidance.
          </p>
        </CardContent>
      </Card>

      {/* Terms Summary & Link */}
      <Collapsible open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Terms & Conditions Summary
                </span>
                {isTermsOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="text-sm text-muted-foreground space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Last Updated: February 6, 2026
                  </p>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Key Points</h3>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li><strong className="text-foreground">Not Medical Advice:</strong> This App does not provide medical advice, diagnosis, or treatment. Always consult healthcare professionals.</li>
                      <li><strong className="text-foreground">Assumption of Risk:</strong> You voluntarily assume all risks associated with using the App, including reliance on AI-generated insights and recovery tools.</li>
                      <li><strong className="text-foreground">No Guaranteed Outcomes:</strong> The App does not guarantee sobriety, recovery, or any specific health outcome.</li>
                      <li><strong className="text-foreground">AI Disclaimer:</strong> AI-powered features use automated algorithms that may contain errors. AI outputs are not professional advice.</li>
                      <li><strong className="text-foreground">Privacy:</strong> We never sell your personal data. Recovery and health data is encrypted and protected. We are not a HIPAA-covered entity.</li>
                      <li><strong className="text-foreground">Arbitration:</strong> Disputes are resolved through binding individual arbitration. You waive your right to class action lawsuits.</li>
                      <li><strong className="text-foreground">Liability Cap:</strong> Our maximum liability is limited to the amount you paid us in the preceding 12 months, or $100, whichever is greater.</li>
                      <li><strong className="text-foreground">Age Requirement:</strong> You must be 18 or older to use this App.</li>
                      <li><strong className="text-foreground">Community:</strong> You are responsible for content you post. We may moderate or remove content at our discretion.</li>
                      <li><strong className="text-foreground">Termination:</strong> We may suspend or terminate your account for violations of these Terms.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Your Rights</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Access, correct, or delete your personal data at any time</li>
                      <li>Export your data in a machine-readable format</li>
                      <li>Opt out of marketing communications</li>
                      <li>Opt out of the arbitration clause within 30 days of first use</li>
                      <li>Delete your account and all associated data</li>
                      <li>File complaints with your local data protection authority (EU/UK)</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">Your Obligations</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Provide accurate information and maintain account security</li>
                      <li>Seek professional help for medical and mental health needs</li>
                      <li>Respect other users in community features</li>
                      <li>Do not provide medical advice to other users</li>
                      <li>Report concerning content or behavior</li>
                      <li>Comply with all applicable laws</li>
                    </ul>
                  </section>

                  <section className="pt-4 border-t border-border">
                    <p className="text-xs mb-3">
                      This is a summary only. The full Terms of Service and Privacy Policy contain important legal provisions that govern your use of the App.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to="/terms"
                        className="inline-flex items-center gap-1.5 text-primary text-xs font-medium hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Full Terms of Service
                      </Link>
                      <Link
                        to="/privacy"
                        className="inline-flex items-center gap-1.5 text-primary text-xs font-medium hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Full Privacy Policy
                      </Link>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default TermsAndConditions;
