
-- Drop the overly permissive SELECT policy
DROP POLICY "Authenticated users can view karma" ON public.user_karma;

-- Users can only view their own karma
CREATE POLICY "Users can view own karma"
ON public.user_karma
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
