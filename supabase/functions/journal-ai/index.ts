import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are a compassionate recovery journal assistant. Your role is to:
1. Generate thoughtful journaling prompts that encourage self-reflection and healing
2. Analyze journal entries to identify mood patterns and emotional themes
3. Provide supportive, non-judgmental feedback

When generating prompts, consider the user's recovery journey and create prompts that:
- Encourage gratitude and positive reflection
- Help process difficult emotions safely
- Celebrate progress and milestones
- Build self-awareness and coping skills

When analyzing mood, return a JSON object with:
- mood_score: 1-10 scale (1=very negative, 10=very positive)
- primary_emotion: the dominant emotion detected
- themes: array of key themes in the entry
- insight: a brief, supportive insight about the entry`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, content, context } = await req.json();

    let userPrompt = '';
    let responseFormat = 'text';

    if (action === 'generate_prompt') {
      const category = context?.category || 'general';
      const daysSober = context?.daysSober || 0;
      const recentMood = context?.recentMood || 'unknown';
      
      userPrompt = `Generate a single thoughtful journaling prompt for someone in recovery.
      
Context:
- Days sober: ${daysSober}
- Recent mood trend: ${recentMood}
- Category requested: ${category}

Categories:
- gratitude: Focus on things to be thankful for
- reflection: Deep self-reflection on the journey
- goals: Future aspirations and progress
- challenges: Processing difficult moments
- celebration: Acknowledging wins and progress
- general: Open-ended reflection

Return ONLY the prompt text, nothing else. Make it personal and thought-provoking.`;

    } else if (action === 'analyze_mood') {
      userPrompt = `Analyze this journal entry and return a JSON object with mood analysis:

Entry: "${content}"

Return ONLY valid JSON in this exact format:
{
  "mood_score": <number 1-10>,
  "primary_emotion": "<emotion>",
  "themes": ["<theme1>", "<theme2>"],
  "insight": "<supportive insight about the entry>"
}`;
      responseFormat = 'json';

    } else if (action === 'suggest_tags') {
      userPrompt = `Suggest 3-5 relevant tags for this journal entry. Return ONLY a JSON array of lowercase tags.

Entry: "${content}"

Example: ["gratitude", "family", "progress", "hope"]`;
      responseFormat = 'json';
    }

    console.log(`Journal AI: Processing ${action} request for user ${user.id}`);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', errorText);
      
      // Provide fallback responses
      if (action === 'generate_prompt') {
        const fallbackPrompts = [
          "What are three things you're grateful for today, and why do they matter to your recovery?",
          "Describe a moment this week when you felt proud of yourself.",
          "What coping strategies have been most helpful for you lately?",
          "Write about someone who has supported your journey and what they mean to you.",
          "What would you tell your past self about where you are today?",
        ];
        return new Response(JSON.stringify({ 
          result: fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)] 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (action === 'analyze_mood') {
        return new Response(JSON.stringify({ 
          result: {
            mood_score: 5,
            primary_emotion: 'reflective',
            themes: ['self-reflection', 'growth'],
            insight: 'Thank you for taking time to journal. Every entry is a step forward in your journey.'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (action === 'suggest_tags') {
        return new Response(JSON.stringify({ result: ['journal', 'reflection', 'recovery'] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const aiData = await aiResponse.json();
    const resultText = aiData.choices?.[0]?.message?.content || '';

    let result;
    if (responseFormat === 'json') {
      try {
        // Extract JSON from the response
        const jsonMatch = resultText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : resultText;
      } catch {
        result = resultText;
      }
    } else {
      result = resultText.trim();
    }

    console.log(`Journal AI: ${action} completed successfully`);

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Journal AI error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
