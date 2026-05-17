CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_uuid uuid, blocked_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE blocker_id = blocker_uuid
      AND blocked_id = blocked_uuid
  );
$function$;