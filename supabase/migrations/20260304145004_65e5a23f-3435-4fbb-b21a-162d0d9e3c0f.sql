
-- Fix: Drop the existing community_posts policy and recreate with block filtering
DROP POLICY IF EXISTS "Authenticated users can view community posts" ON public.community_posts;

CREATE POLICY "Authenticated users can view community posts"
ON public.community_posts
FOR SELECT
TO authenticated
USING (
  NOT public.is_user_blocked(user_id, auth.uid())
);
