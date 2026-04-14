
DROP POLICY IF EXISTS "Users can insert own matches" ON public.partner_matches;
DROP POLICY IF EXISTS "Users can update own matches" ON public.partner_matches;
DROP POLICY IF EXISTS "Users can view own matches" ON public.partner_matches;

CREATE POLICY "Users can insert own matches"
ON public.partner_matches FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches"
ON public.partner_matches FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can view own matches"
ON public.partner_matches FOR SELECT TO authenticated
USING (auth.uid() = user_id OR auth.uid() = partner_id);
