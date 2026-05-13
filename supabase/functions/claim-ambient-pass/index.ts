import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const source = typeof body?.source === "string" ? body.source : "rewarded_ad";
    if (!["rewarded_ad", "rewarded_ad_web"].includes(source)) {
      return new Response(JSON.stringify({ error: "Invalid source" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Rate-limit: max 1 active pass at a time per user
    const { data: existing } = await admin
      .from("ambient_music_passes")
      .select("id, expires_at")
      .eq("user_id", user.id)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("granted_at", { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ success: true, expires_at: existing[0].expires_at, reused: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { data: inserted, error: insertError } = await admin
      .from("ambient_music_passes")
      .insert({ user_id: user.id, source, expires_at: expiresAt })
      .select("expires_at")
      .single();

    if (insertError) {
      console.error("claim-ambient-pass insert error", insertError);
      return new Response(JSON.stringify({ error: "Failed to grant pass" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, expires_at: inserted.expires_at }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("claim-ambient-pass error", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
