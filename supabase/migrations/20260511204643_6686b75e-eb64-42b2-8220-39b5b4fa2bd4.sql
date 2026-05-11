-- 1. Profiles UPDATE: add WITH CHECK
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Drop leaderboard XP policy (frontend uses user_karma for leaderboard)
DROP POLICY IF EXISTS "Users can view leaderboard XP" ON public.user_xp;

-- 3. Add auth.uid() guard to claim_daily_login_reward
CREATE OR REPLACE FUNCTION public.claim_daily_login_reward(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_xp RECORD;
  v_base_xp INTEGER := 25;
  v_streak_bonus INTEGER := 0;
  v_total_reward INTEGER;
  v_new_streak INTEGER;
  v_result JSONB;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_user_xp FROM public.user_xp WHERE user_id = p_user_id;

  IF v_user_xp IS NULL THEN
    INSERT INTO public.user_xp (user_id, total_xp, current_level, daily_login_streak, last_login_date)
    VALUES (p_user_id, 0, 1, 0, NULL)
    RETURNING * INTO v_user_xp;
  END IF;

  IF v_user_xp.last_login_reward_date = CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Already claimed today',
      'next_claim_at', (CURRENT_DATE + INTERVAL '1 day')::TEXT
    );
  END IF;

  IF v_user_xp.last_login_reward_date = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := v_user_xp.daily_login_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_streak_bonus := LEAST(v_new_streak * 5, 50);
  v_total_reward := v_base_xp + v_streak_bonus;

  IF v_new_streak = 7 THEN
    v_total_reward := v_total_reward + 100;
  END IF;

  UPDATE public.user_xp
  SET
    daily_login_streak = v_new_streak,
    last_login_reward_date = CURRENT_DATE,
    last_login_date = CURRENT_DATE
  WHERE user_id = p_user_id;

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
$function$;

-- 4. Add auth.uid() guard to use_streak_freeze
CREATE OR REPLACE FUNCTION public.use_streak_freeze(p_user_id uuid, p_streak_type text DEFAULT 'check_in'::text, p_protected_date date DEFAULT (CURRENT_DATE - '1 day'::interval))
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_week_start DATE;
  can_freeze BOOLEAN;
  streak_record RECORD;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;

  SELECT public.can_use_streak_freeze(p_user_id, p_streak_type) INTO can_freeze;

  IF NOT can_freeze THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot use freeze - either not premium or already used this week');
  END IF;

  SELECT * INTO streak_record
  FROM public.user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  IF streak_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No streak found');
  END IF;

  INSERT INTO public.streak_freezes (user_id, streak_type, week_start, protected_date)
  VALUES (p_user_id, p_streak_type, current_week_start, p_protected_date);

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
$function$;

-- 5. Revoke direct EXECUTE on is_user_blocked from API roles.
-- It's SECURITY DEFINER, so RLS policies that call it still work.
REVOKE EXECUTE ON FUNCTION public.is_user_blocked(uuid, uuid) FROM PUBLIC, anon, authenticated;