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
  journalEntries: number;
  meditationMinutes: number;
  triggersLogged: number;
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
  const weekAgoStr = oneWeekAgo.toISOString().split('T')[0];

  // Get mood check-ins
  const { count: moodCount } = await supabase
    .from('mood_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', weekAgoStr);

  // Get journal entries
  const { count: journalCount } = await supabase
    .from('journal_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneWeekAgo.toISOString());

  // Get triggers logged
  const { count: triggerCount } = await supabase
    .from('trigger_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', weekAgoStr);

  // Get XP gained this week
  const { data: xpData } = await supabase
    .from('xp_history')
    .select('xp_amount')
    .eq('user_id', userId)
    .gte('created_at', oneWeekAgo.toISOString());

  const xpGained = xpData?.reduce((sum: number, entry: { xp_amount: number }) => sum + entry.xp_amount, 0) || 0;

  // Get current level
  const { data: userXp } = await supabase
    .from('user_xp')
    .select('current_level')
    .eq('user_id', userId)
    .single();

  // Get new badges this week
  const { data: badges } = await supabase
    .from('user_badges')
    .select('badge_name')
    .eq('user_id', userId)
    .gte('earned_at', oneWeekAgo.toISOString());

  return {
    moodCheckIns: moodCount || 0,
    journalEntries: journalCount || 0,
    meditationMinutes: 0,
    triggersLogged: triggerCount || 0,
    xpGained,
    currentLevel: userXp?.current_level || 1,
    achievements: badges?.map((b: { badge_name: string }) => b.badge_name) || [],
  };
}

async function getCommunityStats(supabase: any): Promise<CommunityStats> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get new posts count
  const { count: newPosts } = await supabase
    .from('forum_posts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());

  // Get new replies count
  const { count: newReplies } = await supabase
    .from('forum_replies')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());

  // Get active discussions (most replied)
  const { data: activeDiscussions } = await supabase
    .from('forum_posts')
    .select('title, reply_count')
    .gte('created_at', oneWeekAgo.toISOString())
    .order('reply_count', { ascending: false })
    .limit(3);

  return {
    newPosts: newPosts || 0,
    newReplies: newReplies || 0,
    activeDiscussions: activeDiscussions?.map((d: { title: string }) => d.title) || [],
  };
}

function calculateDaysSober(sobrietyStartDate: string | null): number {
  if (!sobrietyStartDate) return 0;
  const start = new Date(sobrietyStartDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function generateEmailHtml(
  displayName: string,
  daysSober: number,
  stats: WeeklyStats,
  communityStats: CommunityStats,
  appUrl: string
): string {
  const achievementsHtml = stats.achievements.length > 0
    ? `<h2 style="color: #374151; font-size: 20px; font-weight: 600; margin: 24px 0 12px; padding: 0 30px;">🏆 New Achievements</h2>
       <div style="padding: 0 30px;">${stats.achievements.map(a => `<p style="margin: 6px 0; color: #4b5563;">✨ ${a}</p>`).join('')}</div>`
    : '';

  const discussionsHtml = communityStats.activeDiscussions.length > 0
    ? `<p style="color: #6b7280; font-size: 14px; font-weight: 600; padding: 0 30px; margin: 12px 0 8px;">Hot discussions:</p>
       ${communityStats.activeDiscussions.slice(0, 3).map(t => `<p style="color: #4b5563; font-size: 14px; padding: 4px 30px; margin: 0;">💬 ${t}</p>`).join('')}`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Recovery Progress</title>
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px;">
  <div style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; max-width: 600px; border-radius: 12px;">
    
    <!-- Header -->
    <div style="padding: 20px 30px; text-align: center;">
      <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 0;">🌿 Sobable</p>
    </div>
    
    <!-- Greeting -->
    <h1 style="color: #1f2937; font-size: 28px; font-weight: bold; margin: 30px 0 10px; padding: 0 30px;">
      Hey ${displayName}! 👋
    </h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 26px; padding: 0 30px; margin: 0 0 10px;">
      Here's your weekly recovery journey summary. You're doing amazing!
    </p>
    
    <!-- Sobriety Counter -->
    <div style="background-color: #ecfdf5; border-radius: 12px; padding: 24px; margin: 20px 30px; text-align: center;">
      <p style="font-size: 48px; font-weight: bold; color: #16a34a; margin: 0; line-height: 1;">${daysSober}</p>
      <p style="font-size: 16px; color: #065f46; margin: 8px 0 0; font-weight: 500;">Days Sober</p>
    </div>
    
    <hr style="border-color: #e5e7eb; margin: 24px 30px;">
    
    <!-- Weekly Activity -->
    <h2 style="color: #374151; font-size: 20px; font-weight: 600; margin: 24px 0 12px; padding: 0 30px;">📊 This Week's Activity</h2>
    
    <table style="width: 100%; padding: 0 30px; border-collapse: collapse;">
      <tr>
        <td style="text-align: center; padding: 12px; width: 50%;">
          <p style="font-size: 32px; font-weight: bold; color: #3b82f6; margin: 0; line-height: 1.2;">${stats.moodCheckIns}</p>
          <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Mood Check-ins</p>
        </td>
        <td style="text-align: center; padding: 12px; width: 50%;">
          <p style="font-size: 32px; font-weight: bold; color: #3b82f6; margin: 0; line-height: 1.2;">${stats.journalEntries}</p>
          <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Journal Entries</p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 12px; width: 50%;">
          <p style="font-size: 32px; font-weight: bold; color: #3b82f6; margin: 0; line-height: 1.2;">${stats.meditationMinutes}</p>
          <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Meditation Min</p>
        </td>
        <td style="text-align: center; padding: 12px; width: 50%;">
          <p style="font-size: 32px; font-weight: bold; color: #3b82f6; margin: 0; line-height: 1.2;">${stats.triggersLogged}</p>
          <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Triggers Logged</p>
        </td>
      </tr>
    </table>
    
    <hr style="border-color: #e5e7eb; margin: 24px 30px;">
    
    <!-- XP & Level -->
    <h2 style="color: #374151; font-size: 20px; font-weight: 600; margin: 24px 0 12px; padding: 0 30px;">🎮 Gamification Progress</h2>
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px 20px; margin: 0 30px;">
      <p style="color: #4b5563; font-size: 16px; margin: 0;">
        <strong>+${stats.xpGained} XP</strong> earned this week! You're now at <strong>Level ${stats.currentLevel}</strong>.
      </p>
    </div>
    
    ${achievementsHtml}
    
    <hr style="border-color: #e5e7eb; margin: 24px 30px;">
    
    <!-- Community -->
    <h2 style="color: #374151; font-size: 20px; font-weight: 600; margin: 24px 0 12px; padding: 0 30px;">👥 Community Highlights</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 26px; padding: 0 30px; margin: 0 0 10px;">
      This week in the community: <strong>${communityStats.newPosts}</strong> new posts and <strong>${communityStats.newReplies}</strong> replies!
    </p>
    ${discussionsHtml}
    
    <hr style="border-color: #e5e7eb; margin: 24px 30px;">
    
    <!-- CTA -->
    <div style="text-align: center; padding: 20px 30px;">
      <a href="${appUrl}" style="background-color: #16a34a; border-radius: 8px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
        Continue Your Journey
      </a>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; border-radius: 0 0 12px 12px; padding: 24px 30px; margin-top: 24px;">
      <p style="color: #374151; font-size: 16px; text-align: center; margin: 0 0 12px;">
        Keep going strong! Every day is a victory. 💪
      </p>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 8px;">
        Sobable App • You're receiving this because you opted in to weekly digests.
      </p>
    </div>
  </div>
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
      user.displayName || 'Friend',
      daysSober,
      stats,
      communityStats,
      appUrl
    );

    const { error } = await resend.emails.send({
      from: "Sobable <onboarding@resend.dev>",
      to: [user.email],
      subject: `Your Weekly Recovery Progress - ${daysSober} Days Strong! 🌟`,
      html,
    });

    if (error) {
      console.error(`Failed to send digest to ${user.email}:`, error);
      return { success: false, email: user.email, error };
    }

    console.log(`Successfully sent digest to ${user.email}`);
    return { success: true, email: user.email };
  } catch (error) {
    console.error(`Error processing digest for ${user.email}:`, error);
    return { success: false, email: user.email, error };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get app URL from environment or use default
    const appUrl = Deno.env.get("APP_URL") || "https://id-preview--94e498b2-e0e1-433a-9333-abea9f12a84c.lovable.app";

    // Parse request body for optional filters
    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body?.userId || null;
    } catch {
      // No body provided, send to all users
    }

    // Get users who have completed onboarding
    let query = supabase
      .from('profiles')
      .select('user_id, display_name, sobriety_start_date');

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    } else {
      query = query.eq('onboarding_complete', true);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users to send digests to" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user emails from auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      throw authError;
    }

    // Map profiles to include emails
    const usersWithEmails: UserDigestData[] = profiles.map((profile) => {
      const authUser = authData.users.find((u) => u.id === profile.user_id);
      return {
        userId: profile.user_id,
        email: authUser?.email || '',
        displayName: profile.display_name,
        sobrietyStartDate: profile.sobriety_start_date,
      };
    }).filter((u) => u.email);

    // Get community stats once (shared across all digests)
    const communityStats = await getCommunityStats(supabase);

    // Send digests to all users
    const results = await Promise.all(
      usersWithEmails.map((user) => sendDigestToUser(user, supabase, communityStats, appUrl))
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Weekly digest completed: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({
        message: "Weekly digest processing complete",
        successful,
        failed,
        details: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in weekly-digest function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
