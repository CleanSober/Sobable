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
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Two versions of your profile</AlertDialogTitle>
          <AlertDialogDescription>
            We found guest progress on this device that's newer than what's on your
            account. Which version would you like to keep?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3 my-2">
          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="font-semibold text-foreground mb-1">Guest version (this device)</div>
            <div className="text-muted-foreground">Name: {guest.display_name || "—"}</div>
            <div className="text-muted-foreground">Sober since: {fmtDate(guest.sobriety_start_date)}</div>
            <div className="text-muted-foreground">Daily spending: {fmtMoney(guest.daily_spending)}</div>
            <div className="text-muted-foreground text-xs mt-1">
              Last edited: {fmtTimestamp(guest.updated_at)}
            </div>
          </div>

          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="font-semibold text-foreground mb-1">Account version</div>
            <div className="text-muted-foreground">Name: {account.display_name || "—"}</div>
            <div className="text-muted-foreground">Sober since: {fmtDate(account.sobriety_start_date)}</div>
            <div className="text-muted-foreground">Daily spending: {fmtMoney(account.daily_spending)}</div>
            <div className="text-muted-foreground text-xs mt-1">
              Last edited: {fmtTimestamp(account.updated_at)}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction onClick={onUseGuest} className="w-full">
            Use guest version
          </AlertDialogAction>
          <AlertDialogCancel onClick={onKeepAccount} className="w-full mt-0">
            Keep account version
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
