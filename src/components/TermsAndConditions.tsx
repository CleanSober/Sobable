import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
            <strong className="text-foreground">This app is not a substitute for professional medical advice, diagnosis, or treatment.</strong> Sobable is designed as a supportive tool for individuals on their recovery journey but should not replace professional healthcare services.
          </p>
          <p>
            If you are experiencing a medical emergency, thoughts of self-harm, or need immediate assistance, please contact emergency services (911) or a crisis hotline immediately:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>National Suicide Prevention Lifeline: 988</li>
            <li>SAMHSA National Helpline: 1-800-662-4357</li>
            <li>Crisis Text Line: Text HOME to 741741</li>
          </ul>
          <p>
            Always consult with qualified healthcare professionals, addiction specialists, or mental health providers for personalized medical advice and treatment plans.
          </p>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Collapsible open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Terms and Conditions
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
                    Last Updated: January 2025
                  </p>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
                    <p>
                      By accessing and using the Sobable application ("App"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">2. Description of Service</h3>
                    <p>
                      Sobable is a personal recovery support application that provides tools for tracking sobriety, mood logging, trigger identification, community support features, and motivational content. The App is designed to supplement, not replace, professional addiction treatment and mental health services.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">3. Medical Disclaimer</h3>
                    <p>
                      THE APP DOES NOT PROVIDE MEDICAL ADVICE. The content, features, and information provided through this App are for informational and educational purposes only. Nothing contained in this App is intended to be used for medical diagnosis or treatment. Always seek the advice of your physician, psychiatrist, addiction specialist, or other qualified health provider with any questions you may have regarding a medical condition or treatment.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">4. User Responsibilities</h3>
                    <p className="mb-2">By using this App, you agree to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Provide accurate and truthful information</li>
                      <li>Maintain the confidentiality of your account credentials</li>
                      <li>Use the App in compliance with all applicable laws</li>
                      <li>Not share content that is harmful, threatening, abusive, or inappropriate</li>
                      <li>Respect other users in community features</li>
                      <li>Seek professional help when needed</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">5. Privacy and Data</h3>
                    <p>
                      Your privacy is important to us. Personal data including mood entries, trigger logs, and recovery information is stored securely. We do not sell your personal information to third parties. Data may be used to improve App functionality and provide personalized features. You may request deletion of your data at any time by contacting support.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">6. Community Guidelines</h3>
                    <p className="mb-2">When using community features, you agree to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Be respectful and supportive of others in recovery</li>
                      <li>Not share explicit details about substance use that may trigger others</li>
                      <li>Not promote illegal activities or substances</li>
                      <li>Report any concerning content or behavior</li>
                      <li>Maintain confidentiality of shared experiences</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">7. Intellectual Property</h3>
                    <p>
                      All content, features, and functionality of the App, including but not limited to text, graphics, logos, icons, and software, are the exclusive property of Sobable and are protected by copyright, trademark, and other intellectual property laws.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">8. Limitation of Liability</h3>
                    <p>
                      TO THE FULLEST EXTENT PERMITTED BY LAW, CLEAN & SOBER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE APP. The App is provided "as is" without warranties of any kind.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">9. Emergency Situations</h3>
                    <p>
                      This App is not designed for emergency situations. If you are experiencing a medical emergency, suicidal thoughts, or immediate danger, please call emergency services (911) or go to your nearest emergency room immediately. The App should not be used as a crisis intervention tool.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">10. Account Termination</h3>
                    <p>
                      We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any conduct that we determine to be harmful to other users or the integrity of the App. You may also delete your account at any time through the App settings.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">11. Changes to Terms</h3>
                    <p>
                      We may update these Terms and Conditions from time to time. We will notify you of any material changes by posting the new Terms within the App. Your continued use of the App after such modifications constitutes your acceptance of the updated Terms.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">12. Governing Law</h3>
                    <p>
                      These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the service is provided, without regard to its conflict of law provisions.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">13. Contact Information</h3>
                    <p>
                      If you have any questions about these Terms and Conditions, please contact us through the App support feature or email us at support@cleanandsoberapp.com.
                    </p>
                  </section>

                  <section className="pt-4 border-t border-border">
                    <p className="text-xs">
                      By continuing to use Clean & Sober, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                    </p>
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
