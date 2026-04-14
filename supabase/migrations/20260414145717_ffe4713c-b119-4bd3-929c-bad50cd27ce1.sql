
CREATE OR REPLACE FUNCTION public.admin_count_users()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN (SELECT COUNT(*)::integer FROM public.profiles);
END;
$$;
