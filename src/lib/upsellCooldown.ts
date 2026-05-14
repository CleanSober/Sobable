/**
 * Global upsell modal cooldown.
 *
 * Many surfaces open the pricing modal (milestones, smart insights, locked
 * cards, community gates, etc.). Without coordination, a user can see two
 * upsell modals back-to-back which feels nagging ("lock fatigue").
 *
 * Rule: any time the PricingPlans modal opens — user-initiated OR automatic —
 * we stamp a 24h cooldown. Automatic triggers (e.g. milestone prompts) check
 * `canShowUpsell()` before firing. User-initiated taps on Upgrade buttons or
 * locked cards always proceed (we never block intentional intent).
 */

const KEY = "sober_club_upsell_last_shown";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function markUpsellShown(): void {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* storage disabled */
  }
}

export function canShowUpsell(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return true;
    const last = Number(raw);
    if (Number.isNaN(last)) return true;
    return Date.now() - last >= COOLDOWN_MS;
  } catch {
    return true;
  }
}
