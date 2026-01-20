import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert addiction recovery analyst. Based on the user's recovery data, provide personalized, actionable recommendations.

Your analysis should include:
1. **Recovery Strength Assessment**: Evaluate what's going well in their recovery
2. **Risk Factors**: Identify patterns that may need attention
3. **Personalized Action Plan**: 3-5 specific, actionable recommendations
4. **Daily Focus**: One thing to focus on today
5. **Weekly Goal**: A measurable goal for the week

Be encouraging but honest. Use data-driven insights when available. Keep recommendations practical and achievable.

Format your response as JSON with this structure:
{
  "strengthScore": 0-100,
  "strengths": ["strength1", "strength2"],
  "riskFactors": ["risk1", "risk2"],
  "actionPlan": [
    {"title": "Action title", "description": "What to do", "priority": "high|medium|low"}
  ],
  "dailyFocus": "Today's focus",
  "weeklyGoal": "This week's goal",
  "motivationalMessage": "Personalized encouragement"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !userData.user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    console.log("Generating recommendations for user:", userId);

    // Fetch user data for analysis
    const [profileResult, moodResult, triggerResult, sleepResult, goalsResult] = await Promise.all([
      supabaseClient.from("profiles").select("*").eq("user_id", userId).single(),
      supabaseClient.from("mood_entries").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(30),
      supabaseClient.from("trigger_entries").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(30),
      supabaseClient.from("sleep_entries").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(14),
      supabaseClient.from("daily_goals").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(14),
    ]);

    const profile = profileResult.data;
    const moodEntries = moodResult.data || [];
    const triggerEntries = triggerResult.data || [];
    const sleepEntries = sleepResult.data || [];
    const dailyGoals = goalsResult.data || [];

    // Calculate days sober
    let daysSober = 0;
    if (profile?.sobriety_start_date) {
      const startDate = new Date(profile.sobriety_start_date);
      const today = new Date();
      daysSober = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Build context for AI
    const analysisContext = {
      daysSober,
      substances: profile?.substances || [],
      personalReminder: profile?.personal_reminder,
      recentMoods: moodEntries.map(m => ({
        date: m.date,
        mood: m.mood,
        cravingLevel: m.craving_level,
        note: m.note
      })),
      triggerPatterns: triggerEntries.map(t => ({
        trigger: t.trigger,
        emotion: t.emotion,
        intensity: t.intensity,
        situation: t.situation,
        copingUsed: t.coping_used,
        outcome: t.outcome
      })),
      sleepData: sleepEntries.map(s => ({
        date: s.date,
        hoursSlept: s.hours_slept,
        quality: s.quality
      })),
      goalCompletion: dailyGoals.map(g => ({
        date: g.date,
        moodLogged: g.mood_logged,
        triggerLogged: g.trigger_logged,
        meditationDone: g.meditation_done,
        journalWritten: g.journal_written
      }))
    };

    // Calculate some quick stats
    const avgMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum, m) => sum + m.mood, 0) / moodEntries.length 
      : 0;
    const avgCraving = moodEntries.length > 0 
      ? moodEntries.reduce((sum, m) => sum + m.craving_level, 0) / moodEntries.length 
      : 0;
    const avgSleep = sleepEntries.length > 0 
      ? sleepEntries.reduce((sum, s) => sum + s.hours_slept, 0) / sleepEntries.length 
      : 0;
    const successfulCopings = triggerEntries.filter(t => t.outcome === "resisted").length;
    const totalTriggers = triggerEntries.length;

    const userPrompt = `Analyze this recovery data and provide personalized recommendations:

**User Profile:**
- Days Sober: ${daysSober}
- Substances: ${analysisContext.substances.join(", ") || "Not specified"}
- Personal Recovery Reason: ${analysisContext.personalReminder || "Not set"}

**Last 30 Days Summary:**
- Mood entries logged: ${moodEntries.length}
- Average mood score: ${avgMood.toFixed(1)}/5
- Average craving level: ${avgCraving.toFixed(1)}/5
- Trigger entries: ${totalTriggers}
- Successfully resisted: ${successfulCopings}/${totalTriggers} triggers
- Average sleep: ${avgSleep.toFixed(1)} hours/night

**Recent Patterns:**
${moodEntries.slice(0, 7).map(m => `- ${m.date}: Mood ${m.mood}/5, Craving ${m.craving_level}/5${m.note ? ` - "${m.note}"` : ""}`).join("\n") || "No recent mood data"}

**Common Triggers:**
${[...new Set(triggerEntries.map(t => t.trigger))].slice(0, 5).join(", ") || "No trigger data"}

**Coping Strategies Used:**
${[...new Set(triggerEntries.filter(t => t.coping_used).map(t => t.coping_used))].slice(0, 5).join(", ") || "No coping data"}

Provide your analysis as JSON.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
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
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    // Parse the JSON response from AI
    let recommendations;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      // Provide fallback recommendations
      recommendations = {
        strengthScore: daysSober > 0 ? Math.min(40 + daysSober, 85) : 30,
        strengths: ["You're taking steps to track your recovery", "Using tools to support your journey"],
        riskFactors: ["Need more data to identify patterns"],
        actionPlan: [
          { title: "Log your mood daily", description: "Track how you feel each day to identify patterns", priority: "high" },
          { title: "Identify your triggers", description: "Note situations that create cravings", priority: "medium" },
          { title: "Build a support network", description: "Connect with others in recovery", priority: "medium" }
        ],
        dailyFocus: "Take it one day at a time",
        weeklyGoal: "Log your mood and triggers for 7 consecutive days",
        motivationalMessage: "Every step forward, no matter how small, is progress. You're doing great! 💪"
      };
    }

    // Add computed stats to response
    recommendations.stats = {
      daysSober,
      avgMood: Number(avgMood.toFixed(1)),
      avgCraving: Number(avgCraving.toFixed(1)),
      avgSleep: Number(avgSleep.toFixed(1)),
      triggerSuccessRate: totalTriggers > 0 ? Math.round((successfulCopings / totalTriggers) * 100) : 0,
      moodEntriesCount: moodEntries.length,
      triggerEntriesCount: totalTriggers
    };

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Recommendations error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
