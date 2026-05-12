import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight analytics event tracker. Writes to the public.analytics_events
 * table when an authed user is present. Silently no-ops for guests (RLS would
 * reject) and for any transport error — analytics must never break a flow.
 */
export async function trackEvent(
  event_type: string,
  event_data?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // guest — skip
    await supabase.from("analytics_events").insert({
      user_id: user.id,
      event_type,
      event_data: event_data ?? {},
    });
  } catch {
    // swallow — analytics failures must never surface to users
  }
}
