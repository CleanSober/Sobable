CREATE POLICY "Users can insert own user_xp" ON public.user_xp
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_xp" ON public.user_xp
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);