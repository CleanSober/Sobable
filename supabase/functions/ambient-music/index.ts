import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated royalty-free ambient track fallback (stored in the private
// `ambient-music` Supabase Storage bucket). Used whenever the ElevenLabs
// Music API is unavailable (e.g. free-tier 402, network error, missing key).
const FALLBACK_TRACKS: Record<string, string> = {
  breathing: "breathing.mp3",
  "478": "calm.mp3",
  box: "focus.mp3",
  calm: "calm.mp3",
  energize: "energize.mp3",
  "physiological-sigh": "ocean.mp3",
  resonant: "calm.mp3",
  diaphragmatic: "grounding.mp3",
  "body-scan": "calm.mp3",
  mindfulness: "focus.mp3",
  sleep: "sleep.mp3",
  grounding: "grounding.mp3",
  "loving-kindness": "loving.mp3",
  "urge-surfing": "ocean.mp3",
  default: "calm.mp3",
};

async function signFallbackTrack(adminClient: any, type: string) {
  const track = FALLBACK_TRACKS[type] || FALLBACK_TRACKS.default;
  // 1 hour signed URL — long enough for an exercise session.
  const { data, error } = await adminClient
    .storage
    .from("ambient-music")
    .createSignedUrl(track, 60 * 60);
  if (error || !data?.signedUrl) {
    console.error("Failed to sign fallback track", track, error);
    return null;
  }
  return data.signedUrl;
}

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

    const userId = user.id;
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Premium gate (with rewarded-ad pass fallback)
    const { data: isPremium } = await supabaseClient.rpc("is_premium_user", { check_user_id: userId });

    if (!isPremium) {
      const { data: passes } = await adminClient
        .from("ambient_music_passes")
        .select("id, expires_at")
        .eq("user_id", userId)
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("granted_at", { ascending: false })
        .limit(1);

      const activePass = passes?.[0];
      if (!activePass) {
        return new Response(
          JSON.stringify({ locked: true, code: "PREMIUM_REQUIRED" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { data: consumed } = await adminClient
        .from("ambient_music_passes")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", activePass.id)
        .is("consumed_at", null)
        .select("id");

      if (!consumed || consumed.length === 0) {
        return new Response(
          JSON.stringify({ locked: true, code: "PREMIUM_REQUIRED" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { type = "default", duration } = await req.json().catch(() => ({}));
    const safeType = typeof type === "string" ? type : "default";

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    const musicPrompts: Record<string, string> = {
      breathing: "Gentle ambient meditation music with soft piano and flowing synth pads, calming and serene, perfect for breathing exercises, slow tempo, peaceful atmosphere",
      "478": "Deeply relaxing ambient soundscape with soft wind chimes and gentle ocean waves, perfect for 4-7-8 breathing technique, calming and anxiety-reducing",
      "box": "Focused ambient music with steady, grounding rhythm, soft electronic pads, clear and centered feeling, ideal for box breathing concentration",
      "calm": "Ultra-calming ambient music with soft strings and gentle nature sounds, peaceful piano notes, soothing and tranquil atmosphere",
      "energize": "Uplifting ambient music with gentle awakening tones, soft morning vibes, refreshing and invigorating yet peaceful soundscape",
      "physiological-sigh": "Calming ambient music with gentle wave-like rhythm, soft ocean sounds and airy synths, ideal for physiological sigh breathing",
      "resonant": "Deep resonant ambient music with warm bass tones and gentle harmonic overtones, hypnotic and meditative, ideal for resonant breathing",
      "diaphragmatic": "Warm grounding ambient music with soft earthen tones, gentle acoustic guitar and nature sounds, calming belly breathing atmosphere",
      "body-scan": "Warm, enveloping ambient music with soft harmonics and gentle flowing melodies, perfect for body awareness meditation",
      "mindfulness": "Minimalist ambient soundscape with subtle bell tones and soft breathing space, open and present moment awareness music",
      "sleep": "Deeply calming sleep music with soft delta wave frequencies, gentle lullaby tones, dreamy and restful atmosphere for sleep preparation",
      "grounding": "Earthy ambient music with gentle rain sounds and soft piano, grounding and centering, perfect for 5-4-3-2-1 sensory awareness",
      "loving-kindness": "Warm, heart-centered ambient music with gentle strings and soft choral harmonics, compassionate and loving atmosphere",
      "urge-surfing": "Oceanic ambient soundscape with gentle wave rhythms and soft flowing synths, calm strength and resilience, perfect for riding out cravings",
      default: "Peaceful meditation ambient music with soft synth pads and gentle nature sounds, calming and centered atmosphere",
    };

    const useCuratedFallback = async (reason: string) => {
      console.log(`Using curated ambient fallback (${reason})`);
      const trackUrl = await signFallbackTrack(adminClient, safeType);
      if (!trackUrl) {
        return new Response(
          JSON.stringify({ error: "Fallback track unavailable" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ trackUrl, fallback: true, source: "curated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    };

    if (!ELEVENLABS_API_KEY) {
      return await useCuratedFallback("missing_api_key");
    }

    const prompt = musicPrompts[safeType] || musicPrompts.default;
    const musicDuration = Math.min(duration || 30, 120);

    let response: Response;
    try {
      response = await fetch("https://api.elevenlabs.io/v1/music", {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, duration_seconds: musicDuration }),
      });
    } catch (err) {
      console.error("ElevenLabs fetch failed:", err);
      return await useCuratedFallback("network_error");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", response.status, errorText);
      // Free tier / quota / auth / any non-OK → curated fallback.
      return await useCuratedFallback(`elevenlabs_${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    return new Response(
      JSON.stringify({ audioContent: base64Audio, source: "elevenlabs" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ambient music error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
