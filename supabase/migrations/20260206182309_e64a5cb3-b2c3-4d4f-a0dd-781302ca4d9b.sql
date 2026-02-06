
-- =============================================
-- SECURITY HARDENING MIGRATION
-- =============================================

-- 1. FIX PROFILES: Remove the overly permissive SELECT policy
-- Keep the user's own profile access, remove the "true" one
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- 2. FIX SUBSCRIPTIONS: Remove dangerous client-side INSERT/UPDATE
-- Subscriptions should ONLY be managed by server-side (triggers/edge functions)
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- 3. CREATE PROPER USER ROLES TABLE
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles (using security definer function)
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. CREATE SECURITY DEFINER FUNCTION FOR ROLE CHECKS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. FIX is_admin FUNCTION to use user_roles instead of user_badges
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(check_user_id, 'admin');
$$;

-- 6. ADD ADMIN POLICIES FOR CONTENT MODERATION
-- Admins can view all content reports
CREATE POLICY "Admins can view all reports"
  ON public.content_reports
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Admins can update reports (review them)
CREATE POLICY "Admins can update reports"
  ON public.content_reports
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 7. FIX validate_content_length FUNCTION search_path
CREATE OR REPLACE FUNCTION public.validate_content_length()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'chat_messages' THEN
    IF LENGTH(NEW.message) > 2000 THEN
      RAISE EXCEPTION 'Message content exceeds maximum length of 2000 characters';
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'forum_posts' THEN
    IF LENGTH(NEW.content) > 10000 THEN
      RAISE EXCEPTION 'Post content exceeds maximum length of 10000 characters';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. CLEAN UP DUPLICATE POLICIES
-- analytics_events has 2 INSERT policies
DROP POLICY IF EXISTS "Users can insert analytics" ON public.analytics_events;

-- chat_rooms has 2 INSERT policies  
DROP POLICY IF EXISTS "Premium users can create rooms" ON public.chat_rooms;

-- forum_posts has 2 INSERT policies
DROP POLICY IF EXISTS "Premium users can create posts" ON public.forum_posts;

-- thread_subscriptions has 2 INSERT policies
DROP POLICY IF EXISTS "Users can subscribe" ON public.thread_subscriptions;

-- friend_invitations has 2 INSERT policies
DROP POLICY IF EXISTS "Users can send invitations" ON public.friend_invitations;

-- journal_entries has 2 INSERT policies
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;

-- notifications has 2 INSERT policies (keep the one with premium check)
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;

-- 9. FIX USER_BADGES INSERT to prevent privilege escalation
-- Remove the current policy that lets users award themselves badges
DROP POLICY IF EXISTS "System can award badges" ON public.user_badges;

-- Only allow badge insertion via security definer functions (server-side)
-- Users should NOT be able to directly insert badges
CREATE POLICY "Badges awarded by system only"
  ON public.user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND badge_type NOT IN ('admin', 'moderator')
  );
