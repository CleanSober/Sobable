import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user with their token
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to delete user data and auth account
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user data from all tables
    const tables = [
      "analytics_events", "app_settings", "blocked_users", "challenge_progress",
      "chat_messages", "community_posts", "content_reports", "daily_goals",
      "forum_replies", "forum_posts", "forums", "friend_invitations",
      "journal_entries", "moderation_logs", "mood_entries", "notifications",
      "partner_messages", "partner_matches", "pathway_progress", "poll_votes",
      "post_bookmarks", "predictive_insights", "prevention_plans", "profiles",
      "reactions", "risk_scores", "sleep_entries", "streak_freezes",
      "subscriptions", "thread_subscriptions", "trigger_entries", "user_badges",
      "user_bans", "user_follows", "user_karma", "user_roles",
      "user_streaks", "user_xp", "xp_history",
    ];

    for (const table of tables) {
      await adminClient.from(table).delete().eq("user_id", user.id);
    }

    // Also clean up blocked_users where user is the blocked one
    await adminClient.from("blocked_users").delete().eq("blocked_id", user.id);
    // Clean up follows where user is being followed
    await adminClient.from("user_follows").delete().eq("following_id", user.id);
    // Clean up partner matches where user is partner
    await adminClient.from("partner_matches").delete().eq("partner_id", user.id);

    // Delete avatar from storage
    const { data: avatarFiles } = await adminClient.storage
      .from("avatars")
      .list(user.id);
    if (avatarFiles && avatarFiles.length > 0) {
      const filePaths = avatarFiles.map((f) => `${user.id}/${f.name}`);
      await adminClient.storage.from("avatars").remove(filePaths);
    }

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
