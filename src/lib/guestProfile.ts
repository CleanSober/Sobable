/**
 * Helpers for the guest profile blob in localStorage.
 *
 * Every write goes through `writeGuestProfile` so the blob always carries an
 * `updated_at` epoch-ms timestamp. The migration flow uses that timestamp to
 * decide whether a guest blob is newer or older than the authed profile when
 * resolving conflicts.
 */
export const GUEST_PROFILE_KEY = "sober_club_guest_profile";

export interface GuestProfile {
  display_name?: string | null;
  substances?: string[];
  sobriety_start_date?: string | null;
  savings_start_date?: string | null;
  daily_spending?: number;
  sponsor_phone?: string | null;
  emergency_contact?: string | null;
  personal_reminder?: string | null;
  onboarding_complete?: boolean;
  /** epoch ms — set automatically by writeGuestProfile. */
  updated_at?: number;
}

export const readGuestProfile = (): GuestProfile | null => {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as GuestProfile) : null;
  } catch {
    return null;
  }
};

export const writeGuestProfile = (next: GuestProfile): GuestProfile => {
  const stamped: GuestProfile = { ...next, updated_at: Date.now() };
  localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(stamped));
  return stamped;
};

export const patchGuestProfile = (patch: Partial<GuestProfile>): GuestProfile => {
  const current = readGuestProfile() ?? {};
  return writeGuestProfile({ ...current, ...patch });
};

export const clearGuestProfile = () => {
  localStorage.removeItem(GUEST_PROFILE_KEY);
};
