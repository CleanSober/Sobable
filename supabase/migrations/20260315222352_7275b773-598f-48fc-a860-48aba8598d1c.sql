
-- Fix user_karma: add INSERT and UPDATE policies for authenticated users
CREATE POLICY "Users can insert own karma"
ON public.user_karma
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own karma"
ON public.user_karma
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Fix user_badges: add INSERT policy for authenticated users
CREATE POLICY "Users can insert own badges"
ON public.user_badges
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix forum_replies: check and add missing RLS policies
-- Add UPDATE policy so users can edit their own replies
CREATE POLICY "Users can update own replies"
ON public.forum_replies
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy so users can delete their own replies
CREATE POLICY "Users can delete own replies"
ON public.forum_replies
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
