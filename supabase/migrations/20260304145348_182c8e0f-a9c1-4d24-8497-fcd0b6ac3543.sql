
-- Create a function to find partner candidates (security definer, bypasses RLS)
CREATE OR REPLACE FUNCTION public.find_partner_candidates(
  p_user_id uuid,
  p_exclude_ids uuid[],
  p_limit integer DEFAULT 20
)
RETURNS TABLE(user_id uuid, display_name text, sobriety_start_date date, substances text[])
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.sobriety_start_date,
    p.substances
  FROM public.profiles p
  WHERE p.user_id != p_user_id
    AND p.user_id != ALL(p_exclude_ids)
    AND p.display_name IS NOT NULL
    AND p.onboarding_complete = true
  LIMIT p_limit;
$$;
