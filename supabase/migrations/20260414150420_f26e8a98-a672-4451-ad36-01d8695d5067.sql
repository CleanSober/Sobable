
-- ===== USER_XP: Remove INSERT and UPDATE policies =====
DROP POLICY IF EXISTS "Users can insert own xp" ON public.user_xp;
DROP POLICY IF EXISTS "Users can update own xp" ON public.user_xp;

-- Create initialization function (the add_user_xp function already handles updates)
CREATE OR REPLACE FUNCTION public.initialize_user_xp(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_record RECORD;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Return existing record if it exists
  SELECT * INTO v_record FROM public.user_xp WHERE user_id = p_user_id;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'total_xp', v_record.total_xp,
      'current_level', v_record.current_level,
      'daily_login_streak', v_record.daily_login_streak,
      'show_on_leaderboard', v_record.show_on_leaderboard,
      'last_login_date', v_record.last_login_date,
      'last_login_reward_date', v_record.last_login_reward_date
    );
  END IF;

  -- Create new record with defaults
  INSERT INTO public.user_xp (user_id)
  VALUES (p_user_id)
  RETURNING * INTO v_record;

  RETURN jsonb_build_object(
    'success', true,
    'total_xp', v_record.total_xp,
    'current_level', v_record.current_level,
    'daily_login_streak', v_record.daily_login_streak,
    'show_on_leaderboard', v_record.show_on_leaderboard,
    'last_login_date', v_record.last_login_date,
    'last_login_reward_date', v_record.last_login_reward_date
  );
END;
$$;

-- Function to toggle leaderboard visibility
CREATE OR REPLACE FUNCTION public.toggle_leaderboard_visibility(p_user_id uuid, p_visible boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.user_xp
  SET show_on_leaderboard = p_visible, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ===== USER_KARMA: Remove INSERT and UPDATE policies =====
DROP POLICY IF EXISTS "Users can insert own karma" ON public.user_karma;
DROP POLICY IF EXISTS "Users can update own karma" ON public.user_karma;

-- Create controlled karma initialization function
CREATE OR REPLACE FUNCTION public.initialize_user_karma(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_record RECORD;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_record FROM public.user_karma WHERE user_id = p_user_id;
  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'already_exists', true);
  END IF;

  INSERT INTO public.user_karma (user_id, total_karma, posts_count, replies_count, reactions_received, helpful_votes)
  VALUES (p_user_id, 0, 0, 0, 0, 0)
  RETURNING * INTO v_record;

  RETURN jsonb_build_object('success', true, 'already_exists', false);
END;
$$;

-- Create controlled karma increment function
CREATE OR REPLACE FUNCTION public.add_user_karma(
  p_user_id uuid,
  p_points integer,
  p_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_valid_types text[] := ARRAY['post', 'reply', 'reaction', 'helpful'];
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF NOT (p_type = ANY(v_valid_types)) THEN
    RAISE EXCEPTION 'Invalid karma type: %', p_type;
  END IF;

  -- Cap points to prevent abuse (max 10 per action)
  IF p_points < 0 OR p_points > 10 THEN
    RAISE EXCEPTION 'Invalid karma points';
  END IF;

  -- Initialize if not exists
  INSERT INTO public.user_karma (user_id, total_karma, posts_count, replies_count, reactions_received, helpful_votes)
  VALUES (p_user_id, 0, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Increment the appropriate counter
  UPDATE public.user_karma
  SET
    total_karma = total_karma + p_points,
    posts_count = posts_count + CASE WHEN p_type = 'post' THEN 1 ELSE 0 END,
    replies_count = replies_count + CASE WHEN p_type = 'reply' THEN 1 ELSE 0 END,
    reactions_received = reactions_received + CASE WHEN p_type = 'reaction' THEN 1 ELSE 0 END,
    helpful_votes = helpful_votes + CASE WHEN p_type = 'helpful' THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
