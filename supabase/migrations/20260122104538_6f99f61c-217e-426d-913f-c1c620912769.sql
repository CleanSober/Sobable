-- Create streak_freezes table to track freeze usage
CREATE TABLE public.streak_freezes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL DEFAULT 'check_in',
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  week_start DATE NOT NULL,
  protected_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type, week_start)
);

-- Enable RLS
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;

-- Users can view their own freezes
CREATE POLICY "Users can view own freezes"
ON public.streak_freezes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own freezes
CREATE POLICY "Users can insert own freezes"
ON public.streak_freezes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add freeze_available column to user_streaks for quick access
ALTER TABLE public.user_streaks 
ADD COLUMN IF NOT EXISTS freeze_used_this_week BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_freeze_week DATE;

-- Create function to check if user can use freeze this week
CREATE OR REPLACE FUNCTION public.can_use_streak_freeze(check_user_id UUID, check_streak_type TEXT DEFAULT 'check_in')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_week_start DATE;
  freeze_exists BOOLEAN;
  is_premium BOOLEAN;
BEGIN
  -- Calculate start of current week (Monday)
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  -- Check if user is premium
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = check_user_id 
    AND status = 'active'
    AND (plan_type = 'premium' OR plan_type = 'pro')
  ) INTO is_premium;
  
  IF NOT is_premium THEN
    RETURN FALSE;
  END IF;
  
  -- Check if freeze already used this week
  SELECT EXISTS (
    SELECT 1 FROM public.streak_freezes
    WHERE user_id = check_user_id
    AND streak_type = check_streak_type
    AND week_start = current_week_start
  ) INTO freeze_exists;
  
  RETURN NOT freeze_exists;
END;
$$;

-- Create function to use a streak freeze
CREATE OR REPLACE FUNCTION public.use_streak_freeze(
  p_user_id UUID,
  p_streak_type TEXT DEFAULT 'check_in',
  p_protected_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_week_start DATE;
  can_freeze BOOLEAN;
  streak_record RECORD;
BEGIN
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  -- Check if can use freeze
  SELECT public.can_use_streak_freeze(p_user_id, p_streak_type) INTO can_freeze;
  
  IF NOT can_freeze THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot use freeze - either not premium or already used this week');
  END IF;
  
  -- Get current streak info
  SELECT * INTO streak_record
  FROM public.user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;
  
  IF streak_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No streak found');
  END IF;
  
  -- Insert freeze record
  INSERT INTO public.streak_freezes (user_id, streak_type, week_start, protected_date)
  VALUES (p_user_id, p_streak_type, current_week_start, p_protected_date);
  
  -- Update streak to maintain it (set last_activity_date to today so streak continues)
  UPDATE public.user_streaks
  SET 
    last_activity_date = CURRENT_DATE,
    freeze_used_this_week = true,
    last_freeze_week = current_week_start,
    updated_at = now()
  WHERE user_id = p_user_id AND streak_type = p_streak_type;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Streak protected! Your freeze has been used.',
    'protected_streak', streak_record.current_streak
  );
END;
$$;