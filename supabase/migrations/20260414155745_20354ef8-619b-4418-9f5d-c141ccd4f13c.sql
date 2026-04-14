-- Fix user_bans INSERT policy: change from {public} to {authenticated}
DROP POLICY IF EXISTS "Admins can create bans" ON public.user_bans;

CREATE POLICY "Admins can create bans"
ON public.user_bans FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));
