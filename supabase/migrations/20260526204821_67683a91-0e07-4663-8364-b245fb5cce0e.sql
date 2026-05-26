DROP FUNCTION IF EXISTS public.find_partner_candidates(uuid, uuid[], integer);

CREATE FUNCTION public.find_partner_candidates(p_user_id uuid, p_exclude_ids uuid[], p_limit integer DEFAULT 20)
 RETURNS TABLE(user_id uuid, display_name text, sobriety_start_date date, substance_overlap integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_my_substances text[];
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT p.substances INTO v_my_substances
  FROM public.profiles p
  WHERE p.user_id = p_user_id;

  RETURN QUERY
  SELECT
    p.user_id,
    p.display_name,
    p.sobriety_start_date,
    COALESCE(cardinality(ARRAY(SELECT unnest(p.substances) INTERSECT SELECT unnest(COALESCE(v_my_substances, ARRAY[]::text[])))), 0) AS substance_overlap
  FROM public.profiles p
  WHERE p.user_id != p_user_id
    AND p.user_id != ALL(COALESCE(p_exclude_ids, ARRAY[]::uuid[]))
    AND p.display_name IS NOT NULL
    AND p.onboarding_complete = true
  LIMIT p_limit;
END;
$function$;