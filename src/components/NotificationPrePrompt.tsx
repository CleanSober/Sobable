import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
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
import { toast } from "sonner";

interface Props {
  userId: string | undefined;
  enabled: boolean;
  requestPermission: () => Promise<boolean>;
}

const STORAGE_KEY = (uid: string) => `sober_club_notif_preprompt_${uid}`;
const SNOOZE_DAYS = 7;

/**
 * Soft pre-prompt shown before triggering the OS notification permission dialog.
 * Asking permission inside our own UI first dramatically improves opt-in rates
 * compared to firing the OS prompt cold — and a denial here is recoverable
 * (we can ask again later) whereas an OS denial is sticky.
 */
export const NotificationPrePrompt = ({ userId, enabled, requestPermission }: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || Notification.permission !== "default") return;

    let raw: string | null = null;
    try { raw = localStorage.getItem(STORAGE_KEY(userId)); } catch { /* ignore */ }
    if (raw) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        const days = (Date.now() - parsed) / 86_400_000;
        if (days < SNOOZE_DAYS) return;
      } else if (raw === "granted" || raw === "denied") {
        return;
      }
    }

    const t = setTimeout(() => setOpen(true), 5000);
    return () => clearTimeout(t);
  }, [enabled, userId]);

  const persist = (value: string) => {
    if (!userId) return;
    try { localStorage.setItem(STORAGE_KEY(userId), value); } catch { /* ignore */ }
  };

  const handleAccept = async () => {
    setOpen(false);
    const granted = await requestPermission();
    if (granted) {
      persist("granted");
      toast.success("🔔 Notifications enabled!", {
        description: "You'll get gentle reminders to stay on track.",
      });
    } else {
      // Treat as a soft snooze — OS prompt may still appear next time
      persist(String(Date.now()));
    }
  };

  const handleSnooze = () => {
    setOpen(false);
    persist(String(Date.now()));
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">
            Stay on track with gentle reminders?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            One quiet nudge a day at your usual check-in time. No spam, no shame —
            just a hand on your shoulder. You can turn it off anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel onClick={handleSnooze}>Not now</AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept}>Yes, remind me</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotificationPrePrompt;
