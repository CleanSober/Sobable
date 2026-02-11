import { Phone, MessageCircle, ExternalLink, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { makePhoneCall, sendSMS, hapticTap } from "@/lib/nativeActions";

const resources = [
  { name: "SAMHSA Helpline", phone: "1-800-662-4357", label: "24/7 substance use support" },
  { name: "Crisis Text Line", text: "HOME to 741741", label: "Free 24/7 text support" },
  { name: "988 Lifeline", phone: "988", text: "988", label: "Suicide & crisis support" },
  { name: "AA Hotline", phone: "1-800-839-1686", label: "Alcoholics Anonymous" },
  { name: "NA Helpline", phone: "1-818-773-9999", label: "Narcotics Anonymous" },
];

export const CrisisResources = () => {
  const handleCall = async (phone: string) => {
    await hapticTap();
    await makePhoneCall(phone);
  };

  const handleText = async (text: string) => {
    await hapticTap();
    const number = text.includes("to") ? text.split(" to ")[1] : text;
    const body = text.includes("to") ? text.split(" to ")[0] : undefined;
    await sendSMS(number, body);
  };

  return (
    <Card className="gradient-card border-border/50 border-l-4 border-l-red-500">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-4 h-4 text-red-400" />
          Crisis Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {resources.map((r) => (
          <div key={r.name} className="flex items-center justify-between gap-2 py-2 border-b border-border/30 last:border-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.label}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {r.phone && (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCall(r.phone!)}>
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </Button>
              )}
              {r.text && (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleText(r.text!)}>
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
