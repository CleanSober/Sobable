
-- 1. Lock down user_xp: remove user-facing INSERT/UPDATE so XP/level/leaderboard cannot be self-edited.
-- All writes go through SECURITY DEFINER functions (initialize_user_xp, add_user_xp, claim_daily_login_reward, toggle_leaderboard_visibility).
DROP POLICY IF EXISTS "Users can insert own user_xp" ON public.user_xp;
DROP POLICY IF EXISTS "Users can update own user_xp" ON public.user_xp;

-- 2. Harden is_user_blocked: move auth guard inside the EXISTS so it cannot silently return false in non-user contexts.
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
      AND (blocker_id = auth.uid() OR blocked_id = auth.uid())
  );
$function$;

-- 3. Allow moderators/admins to delete community content (so admin moderation actions actually take effect).
CREATE POLICY "Moderators can delete any forum post"
ON public.forum_posts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role));

CREATE POLICY "Moderators can delete any forum reply"
ON public.forum_replies FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role));

CREATE POLICY "Moderators can delete any chat message"
ON public.chat_messages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role));
