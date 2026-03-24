import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UserDigestData {
  userId: string;
  email: string;
  displayName: string | null;
  sobrietyStartDate: string | null;
}

interface WeeklyStats {
  moodCheckIns: number;
  moodAvg: number;
  journalEntries: number;
  meditationSessions: number;
  triggersLogged: number;
  triggersResisted: number;
  sleepEntries: number;
  sleepAvg: number;
  cravingAvg: number;
  goalsCompleted: number;
  totalGoalDays: number;
  xpGained: number;
  currentLevel: number;
  achievements: string[];
}

interface CommunityStats {
  newPosts: number;
  newReplies: number;
  activeDiscussions: string[];
}

async function getWeeklyStats(supabase: any, userId: string): Promise<WeeklyStats> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekAgoStr = oneWeekAgo.toISOString().split("T")[0];

  const [moodRes, journalRes, triggerRes, sleepRes, goalsRes, xpRes, userXpRes, badgesRes] = await Promise.all([
    supabase.from("mood_entries").select("mood, craving_level").eq("user_id", userId).gte("date", weekAgoStr),
    supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", oneWeekAgo.toISOString()),
    supabase.from("trigger_entries").select("id, outcome").eq("user_id", userId).gte("date", weekAgoStr),
    supabase.from("sleep_entries").select("hours_slept").eq("user_id", userId).gte("date", weekAgoStr),
    supabase.from("daily_goals").select("meditation_done, mood_logged, journal_written, trigger_logged").eq("user_id", userId).gte("date", weekAgoStr),
    supabase.from("xp_history").select("xp_amount").eq("user_id", userId).gte("created_at", oneWeekAgo.toISOString()),
    supabase.from("user_xp").select("current_level").eq("user_id", userId).single(),
    supabase.from("user_badges").select("badge_name").eq("user_id", userId).gte("earned_at", oneWeekAgo.toISOString()),
  ]);

  const moods = moodRes.data || [];
  const triggers = triggerRes.data || [];
  const sleeps = (sleepRes.data || []).map((s: any) => ({ ...s, hours_slept: Number(s.hours_slept) }));
  const goals = goalsRes.data || [];
  const xpData = xpRes.data || [];

  const moodValues = moods.map((m: any) => m.mood);
  const cravingValues = moods.map((m: any) => m.craving_level);
  const sleepValues = sleeps.map((s: any) => s.hours_slept);
  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a: number, b: number) => a + b, 0) / arr.length : 0;

  const completedGoals = goals.filter((g: any) => g.meditation_done && g.mood_logged && g.journal_written && g.trigger_logged).length;

  return {
    moodCheckIns: moods.length,
    moodAvg: Math.round(avg(moodValues) * 10) / 10,
    journalEntries: journalRes.count || 0,
    meditationSessions: goals.filter((g: any) => g.meditation_done).length,
    triggersLogged: triggers.length,
    triggersResisted: triggers.filter((t: any) => t.outcome === "resisted" || t.outcome === "stayed_sober").length,
    sleepEntries: sleeps.length,
    sleepAvg: Math.round(avg(sleepValues) * 10) / 10,
    cravingAvg: Math.round(avg(cravingValues) * 10) / 10,
    goalsCompleted: completedGoals,
    totalGoalDays: goals.length,
    xpGained: xpData.reduce((sum: number, entry: any) => sum + entry.xp_amount, 0),
    currentLevel: userXpRes.data?.current_level || 1,
    achievements: (badgesRes.data || []).map((b: any) => b.badge_name),
  };
}

async function getCommunityStats(supabase: any): Promise<CommunityStats> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [postsRes, repliesRes, activeRes] = await Promise.all([
    supabase.from("forum_posts").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
    supabase.from("forum_replies").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
    supabase.from("forum_posts").select("title, reply_count").gte("created_at", oneWeekAgo.toISOString()).order("reply_count", { ascending: false }).limit(3),
  ]);

  return {
    newPosts: postsRes.count || 0,
    newReplies: repliesRes.count || 0,
    activeDiscussions: (activeRes.data || []).map((d: any) => d.title),
  };
}

function calculateDaysSober(sobrietyStartDate: string | null): number {
  if (!sobrietyStartDate) return 0;
  const start = new Date(sobrietyStartDate);
  const now = new Date();
  return Math.floor(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function getMoodEmoji(mood: number): string {
  if (mood >= 8) return "😊";
  if (mood >= 6) return "🙂";
  if (mood >= 4) return "😐";
  if (mood >= 2) return "😔";
  return "😢";
}

function getMotivationalMessage(daysSober: number, stats: WeeklyStats): string {
  if (stats.goalsCompleted >= 5) return "Incredible consistency this week — you're building unshakable habits! 🏆";
  if (stats.moodAvg >= 7) return "Your mood has been great this week — your hard work is paying off! ✨";
  if (stats.cravingAvg > 0 && stats.cravingAvg <= 3) return "Cravings are under control — your resilience is growing stronger every day! 💪";
  if (daysSober >= 90) return "Over 90 days strong — you're in a whole new chapter of your life! 📖";
  if (daysSober >= 30) return "A full month and beyond — every day adds to your incredible foundation! 🏗️";
  if (daysSober >= 7) return "One week at a time — you're proving what's possible! 🌟";
  return "Every single day counts. You're choosing a better life! 💚";
}

function generateEmailHtml(
  displayName: string,
  daysSober: number,
  stats: WeeklyStats,
  communityStats: CommunityStats,
  appUrl: string
): string {
  const resistRate = stats.triggersLogged > 0
    ? Math.round((stats.triggersResisted / stats.triggersLogged) * 100)
    : null;

  const goalRate = stats.totalGoalDays > 0
    ? Math.round((stats.goalsCompleted / stats.totalGoalDays) * 100)
    : null;

  const motivationalMessage = getMotivationalMessage(daysSober, stats);

  const achievementsHtml = stats.achievements.length > 0
    ? `<tr><td style="padding: 0 30px;">
        <h2 style="color: #374151; font-size: 18px; font-weight: 600; margin: 24px 0 12px;">🏆 New Achievements</h2>
        ${stats.achievements.map(a => `<div style="background: #fef3c7; border-radius: 8px; padding: 10px 14px; margin: 6px 0; color: #92400e; font-size: 14px;">✨ ${a}</div>`).join("")}
      </td></tr>`
    : "";

  const discussionsHtml = communityStats.activeDiscussions.length > 0
    ? communityStats.activeDiscussions.slice(0, 3).map(t =>
        `<div style="color: #4b5563; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">💬 ${t}</div>`
      ).join("")
    : '<p style="color: #9ca3af; font-size: 13px; margin: 0;">No new discussions this week</p>';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Recovery Progress</title>
</head>
<body style="background-color: #0f1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
    
    <!-- Header -->
    <tr><td style="text-align: center; padding: 32px 0 16px;">
      <p style="font-size: 28px; font-weight: bold; color: #22c55e; margin: 0;">🌿 Sober Club</p>
      <p style="font-size: 12px; color: #6b7280; margin: 8px 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Weekly Progress Report</p>
    </td></tr>

    <!-- Main Card -->
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1d27; border-radius: 16px; overflow: hidden;">
        
        <!-- Greeting -->
        <tr><td style="padding: 28px 30px 12px;">
          <h1 style="color: #f9fafb; font-size: 22px; font-weight: bold; margin: 0;">
            Hey ${displayName}! 👋
          </h1>
          <p style="color: #9ca3af; font-size: 14px; line-height: 22px; margin: 8px 0 0;">
            Here's your weekly recovery snapshot.
          </p>
        </td></tr>

        <!-- Sobriety Counter -->
        <tr><td style="padding: 16px 30px;">
          <div style="background: linear-gradient(135deg, #065f46, #047857); border-radius: 12px; padding: 24px; text-align: center;">
            <p style="font-size: 56px; font-weight: bold; color: #ffffff; margin: 0; line-height: 1;">${daysSober}</p>
            <p style="font-size: 14px; color: #a7f3d0; margin: 8px 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Days Sober</p>
          </div>
        </td></tr>

        <!-- Motivational Banner -->
        <tr><td style="padding: 0 30px 16px;">
          <div style="background: #22c55e15; border: 1px solid #22c55e30; border-radius: 10px; padding: 14px 16px;">
            <p style="color: #86efac; font-size: 14px; margin: 0; line-height: 20px;">${motivationalMessage}</p>
          </div>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding: 0 30px;"><hr style="border: none; border-top: 1px solid #2a2d38; margin: 8px 0;"></td></tr>

        <!-- Weekly Activity Stats -->
        <tr><td style="padding: 16px 30px 8px;">
          <h2 style="color: #f3f4f6; font-size: 16px; font-weight: 600; margin: 0;">📊 This Week's Activity</h2>
        </td></tr>

        <tr><td style="padding: 0 30px;">
          <table width="100%" cellpadding="0" cellspacing="8" style="border-collapse: separate;">
            <tr>
              <td width="50%" style="background: #252836; border-radius: 10px; padding: 14px; text-align: center;">
                <p style="font-size: 28px; font-weight: bold; color: #f472b6; margin: 0;">${stats.moodCheckIns}</p>
                <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Mood Check-ins</p>
                ${stats.moodAvg > 0 ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0;">Avg: ${stats.moodAvg}/10 ${getMoodEmoji(stats.moodAvg)}</p>` : ""}
              </td>
              <td width="50%" style="background: #252836; border-radius: 10px; padding: 14px; text-align: center;">
                <p style="font-size: 28px; font-weight: bold; color: #818cf8; margin: 0;">${stats.sleepEntries}</p>
                <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Sleep Logs</p>
                ${stats.sleepAvg > 0 ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0;">Avg: ${stats.sleepAvg}h/night</p>` : ""}
              </td>
            </tr>
            <tr>
              <td width="50%" style="background: #252836; border-radius: 10px; padding: 14px; text-align: center;">
                <p style="font-size: 28px; font-weight: bold; color: #60a5fa; margin: 0;">${stats.journalEntries}</p>
                <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Journal Entries</p>
              </td>
              <td width="50%" style="background: #252836; border-radius: 10px; padding: 14px; text-align: center;">
                <p style="font-size: 28px; font-weight: bold; color: #34d399; margin: 0;">${stats.meditationSessions}</p>
                <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Meditations</p>
              </td>
            </tr>
            <tr>
              <td width="50%" style="background: #252836; border-radius: 10px; padding: 14px; text-align: center;">
                <p style="font-size: 28px; font-weight: bold; color: #fb923c; margin: 0;">${stats.triggersLogged}</p>
                <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Triggers Logged</p>
                ${resistRate !== null ? `<p style="font-size: 12px; color: ${resistRate >= 70 ? "#34d399" : "#fbbf24"}; margin: 4px 0 0;">${resistRate}% resisted</p>` : ""}
              </td>
              <td width="50%" style="background: #252836; border-radius: 10px; padding: 14px; text-align: center;">
                <p style="font-size: 28px; font-weight: bold; color: #fbbf24; margin: 0;">${stats.cravingAvg > 0 ? stats.cravingAvg : "—"}</p>
                <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Avg Craving</p>
                ${stats.cravingAvg > 0 ? `<p style="font-size: 12px; color: ${stats.cravingAvg <= 3 ? "#34d399" : stats.cravingAvg <= 6 ? "#fbbf24" : "#f87171"}; margin: 4px 0 0;">${stats.cravingAvg <= 3 ? "Well managed" : stats.cravingAvg <= 6 ? "Moderate" : "Stay alert"}</p>` : ""}
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Goal Completion -->
        ${goalRate !== null ? `
        <tr><td style="padding: 16px 30px 0;">
          <div style="background: #252836; border-radius: 10px; padding: 14px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #d1d5db; font-size: 13px;">🎯 Daily Goals Completed</span>
              <span style="color: ${goalRate >= 70 ? "#34d399" : goalRate >= 40 ? "#fbbf24" : "#f87171"}; font-size: 16px; font-weight: bold;">${goalRate}%</span>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin: 6px 0 0;">${stats.goalsCompleted} of ${stats.totalGoalDays} days with all goals met</p>
          </div>
        </td></tr>` : ""}

        <!-- Divider -->
        <tr><td style="padding: 8px 30px;"><hr style="border: none; border-top: 1px solid #2a2d38; margin: 8px 0;"></td></tr>

        <!-- XP & Level -->
        <tr><td style="padding: 8px 30px;">
          <h2 style="color: #f3f4f6; font-size: 16px; font-weight: 600; margin: 0 0 12px;">🎮 Progress</h2>
          <div style="background: linear-gradient(135deg, #78350f, #92400e); border-radius: 10px; padding: 16px;">
            <p style="color: #fef3c7; font-size: 15px; margin: 0;">
              <strong>+${stats.xpGained} XP</strong> earned this week · Level <strong>${stats.currentLevel}</strong>
            </p>
          </div>
        </td></tr>

        ${achievementsHtml}

        <!-- Divider -->
        <tr><td style="padding: 8px 30px;"><hr style="border: none; border-top: 1px solid #2a2d38; margin: 8px 0;"></td></tr>

        <!-- Community -->
        <tr><td style="padding: 8px 30px;">
          <h2 style="color: #f3f4f6; font-size: 16px; font-weight: 600; margin: 0 0 8px;">👥 Community</h2>
          <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px;">
            <strong style="color: #d1d5db;">${communityStats.newPosts}</strong> new posts · <strong style="color: #d1d5db;">${communityStats.newReplies}</strong> replies this week
          </p>
          ${discussionsHtml}
        </td></tr>

        <!-- CTA -->
        <tr><td style="text-align: center; padding: 28px 30px;">
          <a href="${appUrl}" style="background: linear-gradient(135deg, #16a34a, #15803d); border-radius: 10px; color: #fff; font-size: 15px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 36px;">
            Continue Your Journey →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background: #12141c; border-radius: 0 0 16px 16px; padding: 20px 30px;">
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0 0 6px;">
            Sober Club · Your recovery companion
          </p>
          <p style="color: #4b5563; font-size: 11px; text-align: center; margin: 0;">
            You're receiving this because you have weekly digests enabled. Manage in app settings.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendDigestToUser(
  user: UserDigestData,
  supabase: any,
  communityStats: CommunityStats,
  appUrl: string
) {
  try {
    const stats = await getWeeklyStats(supabase, user.userId);
    const daysSober = calculateDaysSober(user.sobrietyStartDate);

    const html = generateEmailHtml(
      user.displayName || "Friend",
      daysSober,
      stats,
      communityStats,
      appUrl
    );

    const { error } = await resend.emails.send({
      from: "Sober Club <digest@sobable.com>",
      to: [user.email],
      subject: `📊 Week ${Math.ceil(daysSober / 7)} — ${daysSober} Days Strong!`,
      html,
    });

    if (error) {
      console.error(`Failed to send digest to ${user.email}:`, error);
      return { success: false, email: user.email, error };
    }

    console.log(`Sent digest to ${user.email}`);
    return { success: true, email: user.email };
  } catch (error) {
    console.error(`Error for ${user.email}:`, error);
    return { success: false, email: user.email, error };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth: require admin or scheduled invocation (no origin)
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !userData.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isAdmin } = await supabase.rpc("is_admin", { check_user_id: userData.user.id });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Scheduled/cron invocation — require a shared secret
      const cronSecret = req.headers.get("x-cron-secret");
      if (!cronSecret || cronSecret !== Deno.env.get("CRON_SECRET")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const appUrl = Deno.env.get("APP_URL") || "https://sobable.com";

    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body?.userId || null;
    } catch {
      // No body = send to all opted-in users
    }

    // Get profiles with digest enabled
    // First get users who opted-in (or have no settings row = default enabled)
    let profilesQuery = supabase
      .from("profiles")
      .select("user_id, display_name, sobriety_start_date")
      .eq("onboarding_complete", true);

    if (targetUserId) {
      profilesQuery = profilesQuery.eq("user_id", targetUserId);
    }

    const { data: profiles, error: profilesError } = await profilesQuery;
    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No users to send digests to" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter out users who opted out
    const userIds = profiles.map((p: any) => p.user_id);
    const { data: optedOutSettings } = await supabase
      .from("app_settings")
      .select("user_id")
      .in("user_id", userIds)
      .eq("weekly_digest_enabled", false);

    const optedOutIds = new Set((optedOutSettings || []).map((s: any) => s.user_id));
    const eligibleProfiles = targetUserId
      ? profiles // Always send if targeting specific user
      : profiles.filter((p: any) => !optedOutIds.has(p.user_id));

    if (eligibleProfiles.length === 0) {
      return new Response(JSON.stringify({ message: "All users opted out" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get emails
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const usersWithEmails: UserDigestData[] = eligibleProfiles
      .map((profile: any) => {
        const authUser = authData.users.find((u: any) => u.id === profile.user_id);
        return {
          userId: profile.user_id,
          email: authUser?.email || "",
          displayName: profile.display_name,
          sobrietyStartDate: profile.sobriety_start_date,
        };
      })
      .filter((u: UserDigestData) => u.email);

    const communityStats = await getCommunityStats(supabase);

    // Send in batches of 5 to avoid rate limits
    const batchSize = 5;
    const results: any[] = [];
    for (let i = 0; i < usersWithEmails.length; i += batchSize) {
      const batch = usersWithEmails.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((user) => sendDigestToUser(user, supabase, communityStats, appUrl))
      );
      results.push(...batchResults);
      if (i + batchSize < usersWithEmails.length) {
        await new Promise((r) => setTimeout(r, 1000)); // 1s delay between batches
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Weekly digest: ${successful} sent, ${failed} failed out of ${results.length}`);

    return new Response(
      JSON.stringify({ message: "Weekly digest complete", successful, failed, total: results.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Weekly digest error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
