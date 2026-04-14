
DROP POLICY IF EXISTS "Authenticated users can view community posts" ON public.community_posts;

CREATE POLICY "Authenticated users can view community posts"
ON public.community_posts
FOR SELECT
TO authenticated
USING (
  NOT is_user_blocked(user_id, auth.uid())
  AND NOT is_user_blocked(auth.uid(), user_id)
);
