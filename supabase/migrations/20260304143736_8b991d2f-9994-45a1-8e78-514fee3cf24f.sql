
CREATE OR REPLACE FUNCTION public.is_premium_user(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = check_user_id
    AND plan_type IN ('premium', 'pro')
    AND status IN ('active', 'trialing')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_use_streak_freeze(check_user_id uuid, check_streak_type text DEFAULT 'check_in'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  current_week_start DATE;
  freeze_exists BOOLEAN;
  is_premium BOOLEAN;
BEGIN
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = check_user_id 
    AND status IN ('active', 'trialing')
    AND (plan_type = 'premium' OR plan_type = 'pro')
  ) INTO is_premium;
  
  IF NOT is_premium THEN
    RETURN FALSE;
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM public.streak_freezes
    WHERE user_id = check_user_id
    AND streak_type = check_streak_type
    AND week_start = current_week_start
  ) INTO freeze_exists;
  
  RETURN NOT freeze_exists;
END;
$$;
