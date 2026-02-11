
-- Risk Scores table
CREATE TABLE public.risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level TEXT NOT NULL DEFAULT 'low',
  factors JSONB DEFAULT '[]',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own risk scores" ON public.risk_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own risk scores" ON public.risk_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recovery Pathways (predefined programs)
CREATE TABLE public.recovery_pathways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  category TEXT NOT NULL DEFAULT 'general',
  tasks JSONB NOT NULL DEFAULT '[]',
  icon TEXT DEFAULT 'compass',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.recovery_pathways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active pathways" ON public.recovery_pathways FOR SELECT USING (is_active = true);

-- User pathway progress
CREATE TABLE public.pathway_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pathway_id UUID NOT NULL REFERENCES public.recovery_pathways(id) ON DELETE CASCADE,
  current_week INTEGER NOT NULL DEFAULT 1,
  completed_tasks TEXT[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, pathway_id)
);
ALTER TABLE public.pathway_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pathway progress" ON public.pathway_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pathway progress" ON public.pathway_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pathway progress" ON public.pathway_progress FOR UPDATE USING (auth.uid() = user_id);

-- Accountability partner matches
CREATE TABLE public.partner_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  partner_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  match_score INTEGER DEFAULT 0,
  shared_goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.partner_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own matches" ON public.partner_matches FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);
CREATE POLICY "Users can insert own matches" ON public.partner_matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own matches" ON public.partner_matches FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- Partner messages
CREATE TABLE public.partner_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.partner_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.partner_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their matches" ON public.partner_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.partner_matches WHERE id = match_id AND (user_id = auth.uid() OR partner_id = auth.uid()))
);
CREATE POLICY "Users can send messages in their matches" ON public.partner_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.partner_matches WHERE id = match_id AND (user_id = auth.uid() OR partner_id = auth.uid()))
);

-- Predictive insights cache
CREATE TABLE public.predictive_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence REAL DEFAULT 0.5,
  pattern_data JSONB DEFAULT '{}',
  strategies TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.predictive_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON public.predictive_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.predictive_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON public.predictive_insights FOR DELETE USING (auth.uid() = user_id);

-- Seed recovery pathways
INSERT INTO public.recovery_pathways (title, description, duration_weeks, difficulty, category, icon, tasks) VALUES
('First 30 Days', 'Build a strong foundation for your recovery journey with daily habits and coping strategies.', 4, 'beginner', 'foundation', 'shield', '[
  {"week": 1, "title": "Building Awareness", "tasks": ["Log your mood daily", "Identify 3 personal triggers", "Write a journal entry about your motivation", "Practice 5-minute breathing exercise", "Set up your prevention plan"]},
  {"week": 2, "title": "Establishing Routine", "tasks": ["Complete daily check-in every day", "Track sleep for 7 nights", "Try a guided meditation", "Reach out to a support person", "Log all cravings and their outcomes"]},
  {"week": 3, "title": "Strengthening Coping", "tasks": ["Use the craving timer 3 times", "Write about a challenging moment", "Practice breathing during a craving", "Review your pattern analysis", "Update your prevention plan"]},
  {"week": 4, "title": "Celebrating Progress", "tasks": ["Review your 30-day progress", "Share a milestone with someone", "Set goals for the next month", "Write a gratitude journal entry", "Reward yourself for your dedication"]}
]'),
('Stress Mastery', 'Learn to manage stress without substances through proven techniques and daily practice.', 4, 'intermediate', 'coping', 'brain', '[
  {"week": 1, "title": "Understanding Stress", "tasks": ["Identify your top 5 stressors", "Rate stress levels daily", "Learn box breathing technique", "Journal about stress-substance connection", "Create a stress-free zone at home"]},
  {"week": 2, "title": "Active Coping", "tasks": ["Try progressive muscle relaxation", "Exercise for 20 min 3 times", "Practice saying no to one thing", "Use the 5-4-3-2-1 grounding technique", "Schedule 30 min of fun daily"]},
  {"week": 3, "title": "Building Resilience", "tasks": ["Meditate for 10 min daily", "Practice gratitude journaling", "Try a new healthy hobby", "Reach out when stressed", "Use cognitive reframing on a worry"]},
  {"week": 4, "title": "Maintaining Balance", "tasks": ["Create a weekly self-care plan", "Review stress patterns", "Teach someone a coping skill", "Plan for upcoming stressful events", "Celebrate your stress management growth"]}
]'),
('Sleep Reset', 'Transform your sleep habits to support recovery and improve overall wellbeing.', 3, 'beginner', 'wellness', 'moon', '[
  {"week": 1, "title": "Sleep Assessment", "tasks": ["Track bedtime and wake time for 7 days", "Identify sleep disruptors", "Set a consistent bedtime", "Remove screens 1 hour before bed", "Create a bedtime routine"]},
  {"week": 2, "title": "Sleep Optimization", "tasks": ["Keep bedroom cool and dark", "Try a sleep meditation", "Avoid caffeine after 2pm", "Practice relaxation before bed", "Log sleep quality daily"]},
  {"week": 3, "title": "Sleep Mastery", "tasks": ["Maintain consistent schedule all week", "Review sleep improvement data", "Address remaining sleep issues", "Establish a morning routine", "Share your sleep success"]}
]'),
('Mindfulness Journey', 'Develop a sustainable mindfulness practice to stay present and grounded in recovery.', 4, 'beginner', 'mindfulness', 'lotus', '[
  {"week": 1, "title": "Beginning Mindfulness", "tasks": ["Try 3-minute breathing space", "Eat one meal mindfully", "Take a mindful walk", "Practice body scan meditation", "Notice 5 things you see, hear, feel"]},
  {"week": 2, "title": "Deepening Practice", "tasks": ["Meditate for 10 min daily", "Practice mindful listening", "Try loving-kindness meditation", "Use mindfulness during a craving", "Journal about present-moment awareness"]},
  {"week": 3, "title": "Daily Integration", "tasks": ["Set 3 mindfulness reminders", "Practice mindful transitions", "Try yoga or tai chi", "Use RAIN technique for emotions", "Share mindfulness with someone"]},
  {"week": 4, "title": "Sustained Practice", "tasks": ["Meditate for 15 min daily", "Create a mindfulness routine", "Practice acceptance meditation", "Review your mindfulness journey", "Plan ongoing practice schedule"]}
]');

-- Enable realtime for partner messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_messages;
