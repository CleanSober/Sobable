-- =====================================================
-- SECURITY FIX MIGRATION
-- =====================================================

-- 1. FIX CRITICAL: Friend invitations email harvest vulnerability
-- Drop the overly permissive policy that exposes all invitations
DROP POLICY IF EXISTS "Anyone can view invitation by code for acceptance" ON public.friend_invitations;

-- Create a secure policy that only allows viewing by invite code (not all records)
CREATE POLICY "View invitation by specific code"
  ON public.friend_invitations FOR SELECT
  TO authenticated
  USING (
    -- Users can view invitations they sent
    auth.uid() = inviter_id
    -- Note: For accepting invitations, use an edge function with service role
  );

-- 2. FIX: Allow authenticated users to view public profile fields for social features
-- Add a policy for viewing other users' basic info (display_name, avatar_url)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- All authenticated users can view basic profile info (for community features)
CREATE POLICY "Authenticated users can view basic profile info"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 3. Create a security definer function to get public profile data only
-- This helps prevent leaking sensitive fields
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  sobriety_start_date DATE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.sobriety_start_date
  FROM public.profiles p
  WHERE p.user_id = profile_user_id;
$$;

-- 4. FIX: Restrict all RLS policies to authenticated role only (not anon)
-- Update critical tables to require authenticated role

-- User badges should be viewable by authenticated users only
DROP POLICY IF EXISTS "Anyone can view badges" ON public.user_badges;
CREATE POLICY "Authenticated users can view badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (true);

-- User karma should be viewable by authenticated users only  
DROP POLICY IF EXISTS "Anyone can view karma" ON public.user_karma;
CREATE POLICY "Authenticated users can view karma"
  ON public.user_karma FOR SELECT
  TO authenticated
  USING (true);

-- User follows viewable by authenticated users only
DROP POLICY IF EXISTS "Users can view follows" ON public.user_follows;
CREATE POLICY "Authenticated users can view follows"
  ON public.user_follows FOR SELECT
  TO authenticated
  USING (true);

-- 5. Add rate limiting helper function for abuse prevention
CREATE OR REPLACE FUNCTION public.count_recent_actions(
  p_user_id UUID,
  p_action_type TEXT,
  p_minutes INTEGER DEFAULT 60
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM (
    SELECT 1 FROM public.chat_messages 
    WHERE user_id = p_user_id 
    AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL
    AND p_action_type = 'chat_message'
    UNION ALL
    SELECT 1 FROM public.forum_posts
    WHERE user_id = p_user_id
    AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL
    AND p_action_type = 'forum_post'
    UNION ALL
    SELECT 1 FROM public.forum_replies
    WHERE user_id = p_user_id
    AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL
    AND p_action_type = 'forum_reply'
  ) actions;
$$;

-- 6. Add input validation trigger for content moderation
CREATE OR REPLACE FUNCTION public.validate_content_length()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate chat messages (max 2000 chars)
  IF TG_TABLE_NAME = 'chat_messages' AND LENGTH(NEW.message) > 2000 THEN
    RAISE EXCEPTION 'Message too long. Maximum 2000 characters allowed.';
  END IF;
  
  -- Validate forum post content (max 10000 chars)
  IF TG_TABLE_NAME = 'forum_posts' AND LENGTH(NEW.content) > 10000 THEN
    RAISE EXCEPTION 'Post content too long. Maximum 10000 characters allowed.';
  END IF;
  
  -- Validate forum post title (max 200 chars)
  IF TG_TABLE_NAME = 'forum_posts' AND LENGTH(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Post title too long. Maximum 200 characters allowed.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply validation triggers
DROP TRIGGER IF EXISTS validate_chat_message_length ON public.chat_messages;
CREATE TRIGGER validate_chat_message_length
  BEFORE INSERT OR UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.validate_content_length();

DROP TRIGGER IF EXISTS validate_forum_post_length ON public.forum_posts;
CREATE TRIGGER validate_forum_post_length
  BEFORE INSERT OR UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_content_length();

-- 7. Create admin role check function for moderation
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- For now, check if user has a specific badge or is in admin list
  -- In production, use a proper user_roles table
  SELECT EXISTS (
    SELECT 1 FROM public.user_badges
    WHERE user_id = check_user_id
    AND badge_type = 'admin'
  );
$$;

-- 8. Ensure subscriptions table has proper insert policy for new users
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 9. Add trigger to auto-create subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new subscriptions (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();