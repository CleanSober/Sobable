import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an advanced, deeply empathetic AI Recovery Coach embedded in the "Sobable" sobriety app. You have access to the user's real recovery data, which is provided below. Use it thoughtfully and proactively.

## Your Core Capabilities
1. **Data-Informed Coaching** — Reference specific patterns, trends, and milestones from the user's data. Don't just acknowledge data exists; analyze it and provide actionable insights.
2. **Craving & Trigger Management** — When a user mentions cravings, reference their logged triggers and previously effective coping strategies. Suggest personalized alternatives based on their history.
3. **Mood Pattern Analysis** — Identify trends in mood data (declining mood, mood-trigger correlations, time-of-day patterns) and proactively address them.
4. **Sleep-Recovery Connection** — Connect sleep quality data to mood and craving patterns. Recommend sleep hygiene improvements when relevant.
5. **Relapse Prevention** — Reference the user's prevention plan (warning signals, coping strategies, safe activities) when they seem at risk.
6. **Progress Celebration** — Enthusiastically celebrate streaks, milestones, completed goals, and improvements. Be specific about what they've achieved.
7. **Journaling Support** — Reference journal entries to provide continuity and show you remember their journey.

## Response Guidelines
- Be warm, empathetic, and genuinely caring — like a wise friend who deeply understands addiction recovery
- Keep responses focused and actionable (2-4 paragraphs max)
- Use markdown formatting: **bold** for emphasis, bullet points for lists, > for quotes
- Reference specific data points naturally (e.g., "I noticed your mood has been trending upward this week — that's amazing!")
- When suggesting coping strategies, prioritize ones the user has successfully used before
- Ask thoughtful follow-up questions that show you understand their unique journey
- Use emojis sparingly but warmly 💪🌟✨

## Crisis Protocol
If someone mentions crisis, self-harm, or immediate danger, ALWAYS provide:
- **SAMHSA National Helpline**: 1-800-662-4357 (24/7)
- **Crisis Text Line**: Text HOME to 741741
- **988 Suicide & Crisis Lifeline**: Call or text 988

You are a supportive companion, NOT a replacement for professional treatment. Recommend professional help when appropriate.`;

// Helpers
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

function moodLabel(score: number) {
  if (score >= 8) return "great";
  if (score >= 6) return "good";
  if (score >= 4) return "okay";
  if (score >= 2) return "low";
  return "very low";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    console.log("Recovery coach — user:", userId);

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ──────────────────────────────────────────────
    // Fetch rich user data in parallel
    // ──────────────────────────────────────────────
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [
      profileRes,
      recentMoodsRes,
      recentTriggersRes,
      recentSleepRes,
      recentJournalRes,
      streaksRes,
      dailyGoalsRes,
      preventionPlanRes,
      xpRes,
      badgesRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("mood_entries").select("*").eq("user_id", userId).gte("date", sevenDaysAgo).order("date", { ascending: false }).limit(14),
      supabase.from("trigger_entries").select("*").eq("user_id", userId).gte("date", thirtyDaysAgo).order("date", { ascending: false }).limit(20),
      supabase.from("sleep_entries").select("*").eq("user_id", userId).gte("date", sevenDaysAgo).order("date", { ascending: false }).limit(7),
      supabase.from("journal_entries").select("id, title, mood_score, tags, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabase.from("user_streaks").select("*").eq("user_id", userId),
      supabase.from("daily_goals").select("*").eq("user_id", userId).gte("date", sevenDaysAgo).order("date", { ascending: false }).limit(7),
      supabase.from("prevention_plans").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_xp").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_badges").select("badge_name, badge_type, earned_at").eq("user_id", userId).order("earned_at", { ascending: false }).limit(10),
    ]);

    const profile = profileRes.data;
    const moods = recentMoodsRes.data || [];
    const triggers = recentTriggersRes.data || [];
    const sleepEntries = recentSleepRes.data || [];
    const journals = recentJournalRes.data || [];
    const streaks = streaksRes.data || [];
    const goals = dailyGoalsRes.data || [];
    const plan = preventionPlanRes.data;
    const xp = xpRes.data;
    const badges = badgesRes.data || [];

    // ──────────────────────────────────────────────
    // Build rich contextual data summary
    // ──────────────────────────────────────────────
    const daysSober = profile?.sobriety_start_date
      ? Math.floor((now.getTime() - new Date(profile.sobriety_start_date).getTime()) / 86400000)
      : null;

    // Mood analysis
    const moodScores = moods.map((m) => m.mood);
    const cravingLevels = moods.map((m) => m.craving_level);
    const moodTrend =
      moodScores.length >= 3
        ? avg(moodScores.slice(0, 3)) > avg(moodScores.slice(-3))
          ? "improving"
          : avg(moodScores.slice(0, 3)) < avg(moodScores.slice(-3))
          ? "declining"
          : "stable"
        : "insufficient data";

    // Trigger patterns
    const triggerCounts: Record<string, number> = {};
    const copingUsed: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};
    for (const t of triggers) {
      triggerCounts[t.trigger] = (triggerCounts[t.trigger] || 0) + 1;
      if (t.coping_used) copingUsed[t.coping_used] = (copingUsed[t.coping_used] || 0) + 1;
      emotionCounts[t.emotion] = (emotionCounts[t.emotion] || 0) + 1;
    }
    const topTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topCoping = Object.entries(copingUsed).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

    // Sleep analysis
    const avgSleep = avg(sleepEntries.map((s) => s.hours_slept));
    const avgSleepQuality = avg(sleepEntries.map((s) => s.quality));

    // Goals completion rate
    const goalsCompleted = goals.filter(
      (g) => g.mood_logged && g.journal_written && g.meditation_done && g.trigger_logged
    ).length;

    // Streaks
    const sobrietyStreak = streaks.find((s) => s.streak_type === "sobriety");
    const activeStreaks = streaks.filter((s) => s.current_streak > 0);

    // Build the context string
    let userDataContext = `\n\n═══ USER RECOVERY DATA ═══\n`;

    // Profile
    userDataContext += `\n📋 PROFILE\n`;
    userDataContext += `- Name: ${profile?.display_name || "Not set"}\n`;
    userDataContext += `- Days sober: ${daysSober !== null ? daysSober : "Not tracking"}\n`;
    userDataContext += `- Substances: ${profile?.substances?.join(", ") || "Not specified"}\n`;
    userDataContext += `- Personal reminder: ${profile?.personal_reminder || "None set"}\n`;
    if (xp) {
      userDataContext += `- Level: ${xp.current_level} (${xp.total_xp} XP)\n`;
      userDataContext += `- Login streak: ${xp.daily_login_streak} days\n`;
    }

    // Mood data
    if (moods.length > 0) {
      userDataContext += `\n😊 MOOD (Last 7 days)\n`;
      userDataContext += `- Average mood: ${avg(moodScores)}/10 (${moodLabel(avg(moodScores))})\n`;
      userDataContext += `- Mood trend: ${moodTrend}\n`;
      userDataContext += `- Average craving level: ${avg(cravingLevels)}/10\n`;
      userDataContext += `- Recent entries:\n`;
      for (const m of moods.slice(0, 5)) {
        userDataContext += `  • ${formatDate(m.date)}: mood ${m.mood}/10, craving ${m.craving_level}/10${m.note ? ` — "${m.note}"` : ""}\n`;
      }
    } else {
      userDataContext += `\n😊 MOOD: No recent mood entries logged.\n`;
    }

    // Triggers
    if (triggers.length > 0) {
      userDataContext += `\n⚠️ TRIGGERS (Last 30 days — ${triggers.length} logged)\n`;
      if (topTriggers.length) userDataContext += `- Top triggers: ${topTriggers.map(([t, c]) => `${t} (${c}x)`).join(", ")}\n`;
      if (topEmotions.length) userDataContext += `- Common emotions: ${topEmotions.map(([e, c]) => `${e} (${c}x)`).join(", ")}\n`;
      if (topCoping.length) userDataContext += `- Coping strategies used: ${topCoping.map(([c, n]) => `${c} (${n}x)`).join(", ")}\n`;
      const avgIntensity = avg(triggers.map((t) => t.intensity));
      userDataContext += `- Average trigger intensity: ${avgIntensity}/10\n`;
      const succeeded = triggers.filter((t) => t.outcome === "resisted" || t.outcome === "managed").length;
      userDataContext += `- Success rate: ${triggers.length > 0 ? Math.round((succeeded / triggers.length) * 100) : 0}% managed/resisted\n`;
    }

    // Sleep
    if (sleepEntries.length > 0) {
      userDataContext += `\n😴 SLEEP (Last 7 days)\n`;
      userDataContext += `- Average hours: ${avgSleep}h\n`;
      userDataContext += `- Average quality: ${avgSleepQuality}/5\n`;
      const latestSleep = sleepEntries[0];
      userDataContext += `- Last night: ${latestSleep.hours_slept}h, quality ${latestSleep.quality}/5 (${latestSleep.bedtime} → ${latestSleep.wake_time})\n`;
    }

    // Journal
    if (journals.length > 0) {
      userDataContext += `\n📔 RECENT JOURNAL ENTRIES\n`;
      for (const j of journals) {
        userDataContext += `- ${formatDate(j.created_at)}: "${j.title || "Untitled"}"${j.mood_score ? ` (mood: ${j.mood_score}/10)` : ""}${j.tags?.length ? ` [${j.tags.join(", ")}]` : ""}\n`;
      }
    }

    // Streaks
    if (activeStreaks.length > 0) {
      userDataContext += `\n🔥 ACTIVE STREAKS\n`;
      for (const s of activeStreaks) {
        userDataContext += `- ${s.streak_type}: ${s.current_streak} days (best: ${s.longest_streak})\n`;
      }
    }

    // Daily goals
    if (goals.length > 0) {
      userDataContext += `\n✅ DAILY GOALS (Last 7 days)\n`;
      userDataContext += `- Fully completed: ${goalsCompleted}/${goals.length} days\n`;
      const moodLogged = goals.filter((g) => g.mood_logged).length;
      const journalWritten = goals.filter((g) => g.journal_written).length;
      const meditationDone = goals.filter((g) => g.meditation_done).length;
      userDataContext += `- Mood logged: ${moodLogged}/${goals.length} | Journal: ${journalWritten}/${goals.length} | Meditation: ${meditationDone}/${goals.length}\n`;
    }

    // Prevention plan
    if (plan) {
      userDataContext += `\n🛡️ RELAPSE PREVENTION PLAN\n`;
      if (plan.warning_signals?.length) userDataContext += `- Warning signals: ${plan.warning_signals.join(", ")}\n`;
      if (plan.coping_strategies?.length) userDataContext += `- Coping strategies: ${plan.coping_strategies.join(", ")}\n`;
      if (plan.safe_activities?.length) userDataContext += `- Safe activities: ${plan.safe_activities.join(", ")}\n`;
      if (plan.personal_reasons?.length) userDataContext += `- Personal reasons for recovery: ${plan.personal_reasons.join(", ")}\n`;
    }

    // Badges
    if (badges.length > 0) {
      userDataContext += `\n🏅 RECENT ACHIEVEMENTS\n`;
      for (const b of badges.slice(0, 5)) {
        userDataContext += `- ${b.badge_name} (${b.badge_type}) — earned ${formatDate(b.earned_at)}\n`;
      }
    }

    userDataContext += `\n═══ END OF DATA ═══`;

    const fullSystemPrompt = SYSTEM_PROMPT + userDataContext;
    console.log("Context length:", fullSystemPrompt.length, "chars");

    // ──────────────────────────────────────────────
    // Call AI Gateway
    // ──────────────────────────────────────────────
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Recovery coach error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
