-- Fix community_posts to require authentication for viewing
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;

CREATE POLICY "Authenticated users can view community posts" 
ON public.community_posts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add missing DELETE policies for tables that need them
CREATE POLICY "Users can delete own prevention plan" 
ON public.prevention_plans 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenge progress" 
ON public.challenge_progress 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep entries" 
ON public.sleep_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add streaks table for gamification
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL, -- 'check_in', 'meditation', 'mood_log'
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Enable RLS on user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_streaks
CREATE POLICY "Users can view own streaks" 
ON public.user_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" 
ON public.user_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" 
ON public.user_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streaks" 
ON public.user_streaks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at on user_streaks
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add daily_goals table for engagement
CREATE TABLE IF NOT EXISTS public.daily_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_logged BOOLEAN NOT NULL DEFAULT false,
  trigger_logged BOOLEAN NOT NULL DEFAULT false,
  meditation_done BOOLEAN NOT NULL DEFAULT false,
  journal_written BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on daily_goals
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_goals
CREATE POLICY "Users can view own daily goals" 
ON public.daily_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily goals" 
ON public.daily_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily goals" 
ON public.daily_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily goals" 
ON public.daily_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at on daily_goals
CREATE TRIGGER update_daily_goals_updated_at
BEFORE UPDATE ON public.daily_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();