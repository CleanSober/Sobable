-- 1. Allow authenticated users to view basic profile info of other users (for community features)
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 2. Add missing UPDATE policy on forum_replies so users can edit their own replies
CREATE POLICY "Users can update their own replies"
ON public.forum_replies
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);