-- Remove broad SELECT policy on avatars bucket to prevent file enumeration via list API.
-- Files remain accessible via direct public URLs because the bucket is marked public.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;