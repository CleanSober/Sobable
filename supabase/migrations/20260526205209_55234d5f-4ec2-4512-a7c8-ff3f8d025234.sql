-- 1. Restrict find_partner_candidates to authenticated users only
REVOKE EXECUTE ON FUNCTION public.find_partner_candidates(uuid, uuid[], integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_partner_candidates(uuid, uuid[], integer) TO authenticated;

-- 2. Leaderboard RPC: SECURITY DEFINER so it can read other users' karma in a controlled way.
CREATE OR REPLACE FUNCTION public.get_karma_leaderboard(p_limit integer DEFAULT 10)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  total_karma integer,
  posts_count integer,
  replies_count integer,
  reactions_received integer,
  helpful_votes integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    k.user_id,
    p.display_name,
    k.total_karma,
    k.posts_count,
    k.replies_count,
    k.reactions_received,
    k.helpful_votes
  FROM public.user_karma k
  LEFT JOIN public.profiles p ON p.user_id = k.user_id
  WHERE auth.uid() IS NOT NULL
  ORDER BY k.total_karma DESC
  LIMIT GREATEST(LEAST(p_limit, 100), 1);
$function$;

REVOKE EXECUTE ON FUNCTION public.get_karma_leaderboard(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_karma_leaderboard(integer) TO authenticated;