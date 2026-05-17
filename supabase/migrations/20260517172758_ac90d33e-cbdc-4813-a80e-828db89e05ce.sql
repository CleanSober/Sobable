DROP POLICY IF EXISTS "Premium users can create notifications" ON public.notifications;

CREATE POLICY "Premium users can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_premium_user(auth.uid())
  AND auth.uid() = from_user_id
  AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.partner_matches pm
      WHERE pm.status = 'accepted'
        AND (
          (pm.user_id = auth.uid() AND pm.partner_id = notifications.user_id)
          OR (pm.partner_id = auth.uid() AND pm.user_id = notifications.user_id)
        )
    )
    OR (
      EXISTS (SELECT 1 FROM public.user_follows uf WHERE uf.follower_id = auth.uid() AND uf.following_id = notifications.user_id)
      AND EXISTS (SELECT 1 FROM public.user_follows uf2 WHERE uf2.follower_id = notifications.user_id AND uf2.following_id = auth.uid())
    )
  )
);