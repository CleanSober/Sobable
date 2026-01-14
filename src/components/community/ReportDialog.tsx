import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useContentReports, REPORT_REASONS, ReportReason } from "@/hooks/useModeration";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "forum_post" | "forum_reply" | "chat_message";
  targetId: string;
  reportedUserId: string;
}

export const ReportDialog = ({
  open,
  onOpenChange,
  targetType,
  targetId,
  reportedUserId,
}: ReportDialogProps) => {
  const { reportContent } = useContentReports();
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;

    setSubmitting(true);
    const success = await reportContent(
      targetType,
      targetId,
      reportedUserId,
      reason,
      description
    );

    if (success) {
      setReason("");
      setDescription("");
      onOpenChange(false);
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    if (!submitting) {
      setReason("");
      setDescription("");
      onOpenChange(false);
    }
  };

  const targetLabel = targetType === "forum_post" 
    ? "post" 
    : targetType === "forum_reply" 
    ? "reply" 
    : "message";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Report {targetLabel}
          </DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with this {targetLabel}. Reports are confidential.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Why are you reporting this?</Label>
            <RadioGroup
              value={reason}
              onValueChange={(val) => setReason(val as ReportReason)}
              className="space-y-2"
            >
              {REPORT_REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context..."
              rows={3}
              maxLength={500}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
