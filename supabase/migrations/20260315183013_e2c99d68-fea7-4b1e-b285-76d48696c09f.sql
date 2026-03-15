
DROP POLICY "Authenticated users can view badges" ON public.user_badges;

CREATE POLICY "Users can view own badges"
ON public.user_badges
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
