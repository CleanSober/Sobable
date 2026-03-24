DROP POLICY "Premium users can view reactions" ON public.reactions;
CREATE POLICY "Premium users can view reactions"
  ON public.reactions FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) AND is_premium_user(auth.uid()));