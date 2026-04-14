
-- Remove the permissive INSERT policy
DROP POLICY "Users can insert own badges" ON public.user_badges;

-- Create a controlled SECURITY DEFINER function for badge issuance
CREATE OR REPLACE FUNCTION public.award_badge(
  p_user_id uuid,
  p_badge_type text,
  p_badge_name text,
  p_badge_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_valid_types text[] := ARRAY[
    'first_post', 'ten_posts', 'fifty_posts',
    'first_reply', 'ten_replies', 'fifty_replies',
    'karma_100', 'karma_500', 'karma_1000',
    'streak_7', 'streak_30', 'streak_90', 'streak_365',
    'milestone_1', 'milestone_7', 'milestone_30', 'milestone_90', 'milestone_180', 'milestone_365',
    'journal_first', 'journal_10', 'journal_50',
    'community_helper', 'early_adopter'
  ];
BEGIN
  -- Only the requesting user can earn badges for themselves
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Validate badge type against allowed list
  IF NOT (p_badge_type = ANY(v_valid_types)) THEN
    RAISE EXCEPTION 'Invalid badge type: %', p_badge_type;
  END IF;

  -- Insert (ignore duplicates)
  INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description)
  VALUES (p_user_id, p_badge_type, p_badge_name, p_badge_description)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('success', true, 'badge_type', p_badge_type);
END;
$$;
