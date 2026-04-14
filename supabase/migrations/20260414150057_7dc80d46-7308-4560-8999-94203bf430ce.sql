
-- Fix the SELECT policy to scope to own votes only
DROP POLICY "Premium users can view votes" ON public.poll_votes;

CREATE POLICY "Premium users can view own votes"
  ON public.poll_votes FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) AND is_premium_user(auth.uid()));

-- Create a function to get aggregate vote counts for a poll
CREATE OR REPLACE FUNCTION public.get_poll_vote_counts(p_poll_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    jsonb_agg(jsonb_build_object('option_index', option_index, 'count', cnt)),
    '[]'::jsonb
  )
  FROM (
    SELECT option_index, COUNT(*)::integer AS cnt
    FROM public.poll_votes
    WHERE poll_id = p_poll_id
    GROUP BY option_index
    ORDER BY option_index
  ) sub;
$$;
