import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Warm, natural female voice — Matilda. Best for meditation narration.
const DEFAULT_VOICE_ID = "XrExE9yKIg1WjnnlVkGX";
const MAX_TEXTS = 20;
const MAX_TEXT_LENGTH = 400;

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
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const texts: unknown = body?.texts;
    const voiceId: string = typeof body?.voiceId === "string" ? body.voiceId : DEFAULT_VOICE_ID;
    const clientSettings = (body?.voiceSettings && typeof body.voiceSettings === "object")
      ? body.voiceSettings as Record<string, unknown>
      : null;
    const voiceSettings = {
      stability: typeof clientSettings?.stability === "number" ? clientSettings.stability : 0.5,
      similarity_boost: typeof clientSettings?.similarity_boost === "number" ? clientSettings.similarity_boost : 0.82,
      style: typeof clientSettings?.style === "number" ? clientSettings.style : 0.3,
      use_speaker_boost: clientSettings?.use_speaker_boost !== false,
      speed: typeof clientSettings?.speed === "number"
        ? Math.min(Math.max(clientSettings.speed, 0.7), 1.2)
        : 0.92,
    };

    if (!Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ error: "texts must be a non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (texts.length > MAX_TEXTS) {
      return new Response(
        JSON.stringify({ error: `Max ${MAX_TEXTS} texts per request` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const cleaned = texts.map((t) => String(t ?? "").slice(0, MAX_TEXT_LENGTH).trim()).filter(Boolean);
    if (cleaned.length === 0) {
      return new Response(
        JSON.stringify({ error: "no valid text strings" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Generate audio with limited concurrency to respect ElevenLabs plan limits
    // (free/basic plans allow only 2 concurrent requests). Retry on 429.
    const CONCURRENCY = 2;
    const results: (string | null)[] = new Array(cleaned.length).fill(null);

    const synthesize = async (text: string, attempt = 0): Promise<string | null> => {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.8,
              style: 0.35,
              use_speaker_boost: true,
              speed: 0.92,
            },
          }),
        },
      );
      if (res.status === 429 && attempt < 3) {
        const wait = 800 * (attempt + 1);
        await new Promise((r) => setTimeout(r, wait));
        return synthesize(text, attempt + 1);
      }
      if (!res.ok) {
        const err = await res.text();
        console.error("ElevenLabs TTS error:", res.status, err);
        return null;
      }
      const buf = await res.arrayBuffer();
      return base64Encode(buf);
    };

    let cursor = 0;
    const workers = Array.from({ length: Math.min(CONCURRENCY, cleaned.length) }, async () => {
      while (true) {
        const i = cursor++;
        if (i >= cleaned.length) return;
        results[i] = await synthesize(cleaned[i]);
      }
    });
    await Promise.all(workers);

    return new Response(
      JSON.stringify({ audio: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("tts-narration error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
