CREATE POLICY "Authenticated users can read ambient-music"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ambient-music');