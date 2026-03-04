
-- Admin function to count total users (security definer, admin-only)
CREATE OR REPLACE FUNCTION public.admin_count_users()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer FROM public.profiles;
$$;
