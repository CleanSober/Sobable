import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
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
    // Authenticate the user
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
    console.log("Generating ambient music for user:", userId);

    const { type, duration } = await req.json();

    // Validate input
    if (type && typeof type !== "string") {
      return new Response(JSON.stringify({ error: "Invalid type parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

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

    const prompt = musicPrompts[type] || musicPrompts.default;
    const musicDuration = Math.min(duration || 30, 120);

    console.log(`Generating ${type} ambient music for ${musicDuration} seconds`);

    const response = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration_seconds: musicDuration,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", response.status, errorText);
      const statusCode = response.status === 402 ? 402 : response.status === 401 ? 401 : 500;
      return new Response(
        JSON.stringify({ error: `ElevenLabs API error: ${response.status}`, detail: errorText }),
        { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    console.log("Music generated successfully");

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Ambient music error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
