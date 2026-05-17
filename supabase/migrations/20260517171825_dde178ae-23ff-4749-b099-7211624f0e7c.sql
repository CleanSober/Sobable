CREATE OR REPLACE FUNCTION public.find_partner_candidates(p_user_id uuid, p_exclude_ids uuid[], p_limit integer DEFAULT 20)
 RETURNS TABLE(user_id uuid, display_name text, sobriety_start_date date, substances text[])
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.sobriety_start_date,
    p.substances
  FROM public.profiles p
  WHERE p.user_id != p_user_id
    AND p.user_id != ALL(COALESCE(p_exclude_ids, ARRAY[]::uuid[]))
    AND p.display_name IS NOT NULL
    AND p.onboarding_complete = true
  LIMIT p_limit;
END;
$function$;