
-- Create batch public profile lookup function (security definer - bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_public_profiles(profile_user_ids uuid[])
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, sobriety_start_date date)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.sobriety_start_date
  FROM public.profiles p
  WHERE p.user_id = ANY(profile_user_ids);
$$;
