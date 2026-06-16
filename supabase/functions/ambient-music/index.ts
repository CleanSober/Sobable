import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated royalty-free ambient track per exercise/meditation type, stored
// in the private `ambient-music` Supabase Storage bucket. Each track is
// sonically tailored to the experience (e.g. bell tones for mindfulness,
// ocean waves for urge-surfing, warm choir pad for loving-kindness).
const TRACKS: Record<string, string> = {
  // Breathing exercises
  breathing: "breathing.mp3",
  "478": "calm.mp3",
  box: "focus.mp3",
  calm: "calm.mp3",
  energize: "energize.mp3",
  "physiological-sigh": "ocean.mp3",
  resonant: "calm.mp3",
  diaphragmatic: "grounding.mp3",
  // Guided meditations — dedicated track per meditation
  "body-scan": "body-scan.mp3",
  mindfulness: "mindfulness.mp3",
  sleep: "sleep.mp3",
  grounding: "grounding.mp3",
  "loving-kindness": "loving-kindness.mp3",
  "urge-surfing": "urge-surfing.mp3",
  default: "calm.mp3",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { type = "default" } = await req.json().catch(() => ({}));
    const safeType = typeof type === "string" ? type : "default";

    const track = TRACKS[safeType] || TRACKS.default;
    const { data, error } = await adminClient
      .storage
      .from("ambient-music")
      .createSignedUrl(track, 60 * 60);

    if (error || !data?.signedUrl) {
      console.error("Failed to sign ambient track", track, error);
      return new Response(
        JSON.stringify({ error: "Ambient track unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ trackUrl: data.signedUrl, source: "curated" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Ambient music error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
