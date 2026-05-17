-- Block direct client writes on user_xp
CREATE POLICY "Block client INSERT on user_xp"
ON public.user_xp AS RESTRICTIVE FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Block client UPDATE on user_xp"
ON public.user_xp AS RESTRICTIVE FOR UPDATE
TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "Block client DELETE on user_xp"
ON public.user_xp AS RESTRICTIVE FOR DELETE
TO anon, authenticated
USING (false);

-- Block direct client writes on user_streaks
CREATE POLICY "Block client INSERT on user_streaks"
ON public.user_streaks AS RESTRICTIVE FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Block client UPDATE on user_streaks"
ON public.user_streaks AS RESTRICTIVE FOR UPDATE
TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "Block client DELETE on user_streaks"
ON public.user_streaks AS RESTRICTIVE FOR DELETE
TO anon, authenticated
USING (false);