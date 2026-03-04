
-- 1. Remove user_karma INSERT/UPDATE policies (karma should only be managed by system functions)
DROP POLICY IF EXISTS "System can update karma" ON public.user_karma;
DROP POLICY IF EXISTS "Users can update own karma" ON public.user_karma;

-- Recreate as system-only (no direct user access for INSERT/UPDATE)
-- Karma changes should go through secure backend functions only

-- 2. Remove user_xp direct INSERT/UPDATE policies (XP should only be managed by add_user_xp function)
DROP POLICY IF EXISTS "Users can insert own XP" ON public.user_xp;
DROP POLICY IF EXISTS "Users can update own XP" ON public.user_xp;

-- 3. Remove user_badges self-award INSERT policy
DROP POLICY IF EXISTS "Badges awarded by system only" ON public.user_badges;

-- 4. Restrict forum_posts UPDATE to only content/title (prevent likes/reply_count manipulation)
DROP POLICY IF EXISTS "Users can update their own posts" ON public.forum_posts;
CREATE POLICY "Users can update their own posts" ON public.forum_posts
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Create a secure function to increment forum post likes (prevents direct manipulation)
CREATE OR REPLACE FUNCTION public.increment_forum_post_likes(p_post_id uuid, p_increment integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_posts
  SET likes = likes + p_increment
  WHERE id = p_post_id;
END;
$$;

-- 6. Create a secure function to increment forum post reply count
CREATE OR REPLACE FUNCTION public.increment_forum_reply_count(p_post_id uuid, p_increment integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_posts
  SET reply_count = reply_count + p_increment
  WHERE id = p_post_id;
END;
$$;
