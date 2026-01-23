-- =============================================
-- GAMIFICATION SYSTEM: XP, Levels, Daily Rewards
-- =============================================

-- Create user_xp table to track XP and levels
CREATE TABLE public.user_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  daily_login_streak INTEGER NOT NULL DEFAULT 0,
  last_login_reward_date DATE,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own XP" 
  ON public.user_xp FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP" 
  ON public.user_xp FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own XP" 
  ON public.user_xp FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create XP history table for tracking XP gains
CREATE TABLE public.xp_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'daily_login', 'check_in', 'journal', 'meditation', 'streak_bonus', 'achievement', 'community'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for XP history
CREATE POLICY "Users can view own XP history" 
  ON public.xp_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP history" 
  ON public.xp_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_xp_history_user_id ON public.xp_history(user_id);
CREATE INDEX idx_xp_history_created_at ON public.xp_history(created_at DESC);

-- Update trigger for user_xp
CREATE TRIGGER update_user_xp_updated_at
  BEFORE UPDATE ON public.user_xp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate level from XP (logarithmic scaling)
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Level formula: Each level requires progressively more XP
  -- Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, Level 4: 450 XP, etc.
  -- Formula: XP needed = 50 * level^1.5
  IF xp_amount < 100 THEN
    RETURN 1;
  ELSIF xp_amount < 250 THEN
    RETURN 2;
  ELSIF xp_amount < 450 THEN
    RETURN 3;
  ELSIF xp_amount < 700 THEN
    RETURN 4;
  ELSIF xp_amount < 1000 THEN
    RETURN 5;
  ELSIF xp_amount < 1400 THEN
    RETURN 6;
  ELSIF xp_amount < 1900 THEN
    RETURN 7;
  ELSIF xp_amount < 2500 THEN
    RETURN 8;
  ELSIF xp_amount < 3200 THEN
    RETURN 9;
  ELSIF xp_amount < 4000 THEN
    RETURN 10;
  ELSE
    -- For levels beyond 10, use formula
    RETURN 10 + FLOOR((xp_amount - 4000) / 1000);
  END IF;
END;
$$;

-- Function to add XP and update level
CREATE OR REPLACE FUNCTION public.add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_xp RECORD;
  v_new_total_xp INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
  v_leveled_up BOOLEAN := FALSE;
BEGIN
  -- Get or create user XP record
  SELECT * INTO v_user_xp FROM public.user_xp WHERE user_id = p_user_id;
  
  IF v_user_xp IS NULL THEN
    INSERT INTO public.user_xp (user_id, total_xp, current_level)
    VALUES (p_user_id, 0, 1)
    RETURNING * INTO v_user_xp;
  END IF;
  
  v_old_level := v_user_xp.current_level;
  v_new_total_xp := v_user_xp.total_xp + p_xp_amount;
  v_new_level := public.calculate_level_from_xp(v_new_total_xp);
  v_leveled_up := v_new_level > v_old_level;
  
  -- Update user XP
  UPDATE public.user_xp
  SET 
    total_xp = v_new_total_xp,
    current_level = v_new_level,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record XP history
  INSERT INTO public.xp_history (user_id, xp_amount, source, description)
  VALUES (p_user_id, p_xp_amount, p_source, p_description);
  
  RETURN jsonb_build_object(
    'success', true,
    'xp_gained', p_xp_amount,
    'total_xp', v_new_total_xp,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'leveled_up', v_leveled_up
  );
END;
$$;

-- Function to claim daily login reward
CREATE OR REPLACE FUNCTION public.claim_daily_login_reward(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_xp RECORD;
  v_base_xp INTEGER := 25;
  v_streak_bonus INTEGER := 0;
  v_total_reward INTEGER;
  v_new_streak INTEGER;
  v_result JSONB;
BEGIN
  -- Get or create user XP record
  SELECT * INTO v_user_xp FROM public.user_xp WHERE user_id = p_user_id;
  
  IF v_user_xp IS NULL THEN
    INSERT INTO public.user_xp (user_id, total_xp, current_level, daily_login_streak, last_login_date)
    VALUES (p_user_id, 0, 1, 0, NULL)
    RETURNING * INTO v_user_xp;
  END IF;
  
  -- Check if already claimed today
  IF v_user_xp.last_login_reward_date = CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Already claimed today',
      'next_claim_at', (CURRENT_DATE + INTERVAL '1 day')::TEXT
    );
  END IF;
  
  -- Calculate streak
  IF v_user_xp.last_login_reward_date = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := v_user_xp.daily_login_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Calculate streak bonus (5 XP per streak day, max 50 bonus)
  v_streak_bonus := LEAST(v_new_streak * 5, 50);
  v_total_reward := v_base_xp + v_streak_bonus;
  
  -- Special bonus for 7-day streak
  IF v_new_streak = 7 THEN
    v_total_reward := v_total_reward + 100;
  END IF;
  
  -- Update streak and login date
  UPDATE public.user_xp
  SET 
    daily_login_streak = v_new_streak,
    last_login_reward_date = CURRENT_DATE,
    last_login_date = CURRENT_DATE
  WHERE user_id = p_user_id;
  
  -- Add XP via the add function
  SELECT public.add_user_xp(p_user_id, v_total_reward, 'daily_login', 
    'Day ' || v_new_streak || ' login reward') INTO v_result;
  
  RETURN jsonb_build_object(
    'success', true,
    'base_xp', v_base_xp,
    'streak_bonus', v_streak_bonus,
    'total_reward', v_total_reward,
    'new_streak', v_new_streak,
    'leveled_up', (v_result->>'leveled_up')::BOOLEAN,
    'new_level', (v_result->>'new_level')::INTEGER,
    'total_xp', (v_result->>'total_xp')::INTEGER
  );
END;
$$;