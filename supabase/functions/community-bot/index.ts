import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Community bot profile (use a known user ID from the seed data)
const BOT_USER_ID = "856f8d37-8666-4939-ac38-e31f334c64d4";
const BOT_DISPLAY_NAME = "🤖 SobrietyBot";

const SUPPORTIVE_SYSTEM_PROMPT = `You are SobrietyBot, a compassionate community bot in a sobriety support app. Your role is to provide brief, supportive responses to community posts.

Guidelines:
- Keep responses SHORT (1-3 sentences max)
- Be warm, encouraging, and supportive
- Use recovery-positive language
- Include 1-2 relevant emojis
- NEVER give medical advice
- Acknowledge struggles without minimizing them
- Celebrate wins genuinely
- If the post mentions crisis or danger, gently suggest reaching out to SAMHSA (1-800-662-4357)

Response style examples:
- "That's a huge milestone! Keep going strong 💪🎉"
- "I hear you. Those moments are tough, but you're not alone in this 💙"
- "One day at a time - you've got this! 🌟"

IMPORTANT: Your response will be clearly marked as coming from a bot, so users know it's automated support while waiting for human community members to respond.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, targetId, targetType } = await req.json();
    
    console.log(`Community bot triggered: type=${type}, targetType=${targetType}, targetId=${targetId}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate AI response
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SUPPORTIVE_SYSTEM_PROMPT },
          { role: "user", content: `Please provide a brief supportive response to this community post:\n\n"${content}"` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("Failed to generate response");
    }

    const aiData = await aiResponse.json();
    const botReply = aiData.choices?.[0]?.message?.content?.trim();

    if (!botReply) {
      throw new Error("No response generated");
    }

    // Prefix with bot indicator
    const markedReply = `${botReply}\n\n_— ${BOT_DISPLAY_NAME}_`;

    console.log(`Bot reply generated: ${botReply.substring(0, 50)}...`);

    // Insert the reply based on target type
    if (targetType === "chat_message") {
      // Reply to chat room
      const { data: originalMsg } = await supabaseClient
        .from("chat_messages")
        .select("room_id")
        .eq("id", targetId)
        .single();

      if (originalMsg) {
        const { error: insertError } = await supabaseClient
          .from("chat_messages")
          .insert({
            room_id: originalMsg.room_id,
            user_id: BOT_USER_ID,
            message: markedReply,
          });

        if (insertError) {
          console.error("Failed to insert chat reply:", insertError);
          throw insertError;
        }
      }
    } else if (targetType === "forum_post") {
      // Reply to forum post
      const { error: insertError } = await supabaseClient
        .from("forum_replies")
        .insert({
          post_id: targetId,
          user_id: BOT_USER_ID,
          content: markedReply,
        });

      if (insertError) {
        console.error("Failed to insert forum reply:", insertError);
        throw insertError;
      }

      // Increment reply count manually
      const { data: post } = await supabaseClient
        .from("forum_posts")
        .select("reply_count")
        .eq("id", targetId)
        .single();
      
      if (post) {
        await supabaseClient
          .from("forum_posts")
          .update({ reply_count: (post.reply_count || 0) + 1 })
          .eq("id", targetId);
      }
    } else if (targetType === "community_post") {
      // For community_posts, we could add a reply system or just log
      console.log("Community post bot response (no reply table):", botReply);
    }

    return new Response(JSON.stringify({ success: true, reply: botReply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Community bot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
