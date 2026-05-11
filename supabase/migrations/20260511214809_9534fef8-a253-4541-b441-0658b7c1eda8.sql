
-- 1) Avatars bucket: make private + add SELECT/INSERT/UPDATE/DELETE policies
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2) user_karma: explicit deny on direct writes (mutations must go through SECURITY DEFINER fns)
DROP POLICY IF EXISTS "Block direct karma inserts" ON public.user_karma;
CREATE POLICY "Block direct karma inserts"
ON public.user_karma FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Block direct karma updates" ON public.user_karma;
CREATE POLICY "Block direct karma updates"
ON public.user_karma FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Block direct karma deletes" ON public.user_karma;
CREATE POLICY "Block direct karma deletes"
ON public.user_karma FOR DELETE
TO authenticated
USING (false);

-- 3) reactions: let premium authenticated users see all reactions (not just their own)
DROP POLICY IF EXISTS "Premium users can view reactions" ON public.reactions;
CREATE POLICY "Premium users can view reactions"
ON public.reactions FOR SELECT
TO authenticated
USING (public.is_premium_user(auth.uid()));

-- 4) user_bans: allow a user to view their own ban record
DROP POLICY IF EXISTS "Users can view own ban" ON public.user_bans;
CREATE POLICY "Users can view own ban"
ON public.user_bans FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
