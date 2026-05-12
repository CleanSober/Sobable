import { useEffect, useId, useRef } from "react";
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
import type { GuestProfile } from "@/lib/guestProfile";

interface AccountSnapshot {
  display_name?: string | null;
  sobriety_start_date?: string | null;
  daily_spending?: number | null;
  updated_at?: string | null;
}

interface Props {
  open: boolean;
  guest: GuestProfile;
  account: AccountSnapshot;
  onKeepAccount: () => void;
  onUseGuest: () => void;
}

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString() : "—";

const fmtMoney = (n?: number | null) =>
  typeof n === "number" ? `$${n.toFixed(2)}/day` : "—";

const fmtTimestamp = (epochOrIso: number | string | null | undefined) => {
  if (!epochOrIso) return "Unknown";
  const d = typeof epochOrIso === "number" ? new Date(epochOrIso) : new Date(epochOrIso);
  return d.toLocaleString();
};

export const GuestMigrationConflictDialog = ({
  open,
  guest,
  account,
  onKeepAccount,
  onUseGuest,
}: Props) => {
  const titleId = useId();
  const descId = useId();
  const guestCardId = useId();
  const accountCardId = useId();
  const keepBtnRef = useRef<HTMLButtonElement>(null);

  // Move focus to the safer default ("Keep account version") when opened.
  useEffect(() => {
    if (!open) return;
    // Defer to after Radix's own focus trap mounts.
    const t = window.setTimeout(() => {
      keepBtnRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  // Keyboard shortcuts: Enter = keep account (safe default), Esc handled by Radix.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.defaultPrevented) {
      const target = e.target as HTMLElement;
      // Don't hijack Enter when focus is already on an actionable element.
      if (target.tagName !== "BUTTON" && target.tagName !== "A") {
        e.preventDefault();
        onKeepAccount();
      }
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="max-w-md"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={onKeyDown}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onKeepAccount();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle id={titleId}>Two versions of your profile</AlertDialogTitle>
          <AlertDialogDescription id={descId}>
            We found guest progress on this device that's newer than what's on your
            account. Which version would you like to keep? Press Enter or Escape to
            keep your account version.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3 my-2" role="group" aria-label="Profile versions to compare">
          <section
            className="rounded-lg border border-border p-3 text-sm"
            aria-labelledby={guestCardId}
          >
            <div id={guestCardId} className="font-semibold text-foreground mb-1">
              Guest version (this device)
            </div>
            <div className="text-muted-foreground">Name: {guest.display_name || "—"}</div>
            <div className="text-muted-foreground">Sober since: {fmtDate(guest.sobriety_start_date)}</div>
            <div className="text-muted-foreground">Daily spending: {fmtMoney(guest.daily_spending)}</div>
            <div className="text-muted-foreground text-xs mt-1">
              Last edited: {fmtTimestamp(guest.updated_at)}
            </div>
          </section>

          <section
            className="rounded-lg border border-border p-3 text-sm"
            aria-labelledby={accountCardId}
          >
            <div id={accountCardId} className="font-semibold text-foreground mb-1">
              Account version
            </div>
            <div className="text-muted-foreground">Name: {account.display_name || "—"}</div>
            <div className="text-muted-foreground">Sober since: {fmtDate(account.sobriety_start_date)}</div>
            <div className="text-muted-foreground">Daily spending: {fmtMoney(account.daily_spending)}</div>
            <div className="text-muted-foreground text-xs mt-1">
              Last edited: {fmtTimestamp(account.updated_at)}
            </div>
          </section>
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onUseGuest}
            className="w-full"
            aria-label="Use guest version from this device and replace account version"
          >
            Use guest version
          </AlertDialogAction>
          <AlertDialogCancel
            ref={keepBtnRef}
            onClick={onKeepAccount}
            className="w-full mt-0"
            aria-label="Keep account version and discard guest progress"
          >
            Keep account version
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
