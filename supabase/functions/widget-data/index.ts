import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("sobriety_start_date, daily_spending, display_name, substances")
      .eq("user_id", user.id)
      .single();

    // Fetch XP data
    const { data: xpData } = await supabase
      .from("user_xp")
      .select("total_xp, current_level, daily_login_streak")
      .eq("user_id", user.id)
      .single();

    // Fetch today's mood entry
    const today = new Date().toISOString().split("T")[0];
    const { data: todayMood } = await supabase
      .from("mood_entries")
      .select("mood, craving_level")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    // Fetch daily goals for today
    const { data: dailyGoals } = await supabase
      .from("daily_goals")
      .select("mood_logged, journal_written, meditation_done, trigger_logged")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    // Fetch check-in streak
    const { data: streak } = await supabase
      .from("user_streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", user.id)
      .eq("streak_type", "check_in")
      .single();

    // Calculate sobriety stats
    let soberDays = 0;
    let moneySaved = 0;
    const sobrietyStartDate = profile?.sobriety_start_date;
    const dailySpending = profile?.daily_spending || 0;

    if (sobrietyStartDate) {
      const start = new Date(sobrietyStartDate);
      const now = new Date();
      soberDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      moneySaved = soberDays * dailySpending;
    }

    // Calculate daily goals completion
    const goalsCompleted = dailyGoals
      ? [dailyGoals.mood_logged, dailyGoals.journal_written, dailyGoals.meditation_done, dailyGoals.trigger_logged].filter(Boolean).length
      : 0;

    // Level names
    const levelNames: Record<number, string> = {
      1: "Newcomer", 2: "Explorer", 3: "Achiever", 4: "Warrior",
      5: "Champion", 6: "Hero", 7: "Master", 8: "Sage",
      9: "Titan", 10: "Legend",
    };
    const currentLevel = xpData?.current_level || 1;
    const levelName = levelNames[Math.min(currentLevel, 10)] || "Legend";

    const widgetData = {
      // Core stats
      sober_days: soberDays,
      money_saved: Math.round(moneySaved * 100) / 100,
      currency: "USD",
      sobriety_start_date: sobrietyStartDate,
      substances: profile?.substances || [],
      display_name: profile?.display_name || "Recovery Champion",

      // Streaks
      check_in_streak: streak?.current_streak || 0,
      longest_streak: streak?.longest_streak || 0,
      login_streak: xpData?.daily_login_streak || 0,

      // Today's status
      today: {
        mood: todayMood?.mood || null,
        craving_level: todayMood?.craving_level || null,
        goals_completed: goalsCompleted,
        goals_total: 4,
        mood_logged: dailyGoals?.mood_logged || false,
        journal_written: dailyGoals?.journal_written || false,
        meditation_done: dailyGoals?.meditation_done || false,
        trigger_logged: dailyGoals?.trigger_logged || false,
      },

      // Gamification
      level: currentLevel,
      level_name: levelName,
      total_xp: xpData?.total_xp || 0,

      // Metadata
      last_updated: new Date().toISOString(),
    };

    return new Response(JSON.stringify(widgetData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Widget data error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
