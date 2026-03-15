
-- Replace is_user_blocked with auth.uid() guard
CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_uuid uuid, blocked_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE blocker_id = blocker_uuid AND blocked_id = blocked_uuid
  )
  AND (auth.uid() = blocker_uuid OR auth.uid() = blocked_uuid);
$$;
