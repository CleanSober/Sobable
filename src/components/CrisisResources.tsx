import { useState } from "react";
import { Phone, MessageCircle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { makePhoneCall, sendSMS, hapticTap } from "@/lib/nativeActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const resources = [
  { name: "SAMHSA Helpline", phone: "1-800-662-4357", label: "24/7 substance use support" },
  { name: "Crisis Text Line", text: "HOME to 741741", label: "Free 24/7 text support" },
  { name: "988 Lifeline", phone: "988", text: "988", label: "Suicide & crisis support" },
];

export const CrisisResources = () => {
  const [confirmAction, setConfirmAction] = useState<{ type: "call" | "text"; value: string; name: string } | null>(null);

  const executeAction = async () => {
    if (!confirmAction) return;
    await hapticTap();
    if (confirmAction.type === "call") {
      await makePhoneCall(confirmAction.value);
    } else {
      const number = confirmAction.value.includes("to") ? confirmAction.value.split(" to ")[1] : confirmAction.value;
      const body = confirmAction.value.includes("to") ? confirmAction.value.split(" to ")[0] : undefined;
      await sendSMS(number, body);
    }
    setConfirmAction(null);
  };

  return (
    <>
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
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setConfirmAction({ type: "call", value: r.phone!, name: r.name })}>
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </Button>
                )}
                {r.text && (
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setConfirmAction({ type: "text", value: r.text!, name: r.name })}>
                    <MessageCircle className="w-3.5 h-3.5 text-primary" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "call" ? "Call" : "Text"} {confirmAction?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "call"
                ? `This will start a phone call to ${confirmAction?.value}.`
                : `This will open your messaging app to text ${confirmAction?.value}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              Yes, {confirmAction?.type === "call" ? "call now" : "text now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
