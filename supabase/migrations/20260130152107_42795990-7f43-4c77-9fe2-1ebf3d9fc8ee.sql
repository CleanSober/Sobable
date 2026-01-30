-- =====================================================
-- SECURITY FIX PART 2: Fix remaining anonymous access policies
-- =====================================================

-- Fix analytics_events - require authenticated
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
CREATE POLICY "Users can view own analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert analytics" ON public.analytics_events;
CREATE POLICY "Users can insert analytics"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix app_settings - require authenticated
DROP POLICY IF EXISTS "Users can delete own settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users can view own settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.app_settings;

CREATE POLICY "Users can view own settings"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.app_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.app_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON public.app_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix blocked_users - require authenticated
DROP POLICY IF EXISTS "Users can unblock" ON public.blocked_users;
DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocked_users;
DROP POLICY IF EXISTS "Users can block others" ON public.blocked_users;

CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock"
  ON public.blocked_users FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- Fix challenge_progress - require authenticated
DROP POLICY IF EXISTS "Users can delete own challenge progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can update own challenge progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can view own challenge progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can insert own challenge progress" ON public.challenge_progress;

CREATE POLICY "Users can view own challenge progress"
  ON public.challenge_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge progress"
  ON public.challenge_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON public.challenge_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenge progress"
  ON public.challenge_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix chat_messages - require authenticated + premium
DROP POLICY IF EXISTS "Premium users can view messages in active rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Premium users can send messages" ON public.chat_messages;

CREATE POLICY "Premium users can view messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (is_premium_user(auth.uid()));

CREATE POLICY "Premium users can send messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));

-- Fix chat_rooms - require authenticated + premium
DROP POLICY IF EXISTS "Premium users can view chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Premium users can create rooms" ON public.chat_rooms;

CREATE POLICY "Premium users can view chat rooms"
  ON public.chat_rooms FOR SELECT
  TO authenticated
  USING (is_premium_user(auth.uid()));

CREATE POLICY "Premium users can create rooms"
  ON public.chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by AND is_premium_user(auth.uid()));

-- Fix community_posts - require authenticated
DROP POLICY IF EXISTS "Authenticated users can view community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.community_posts;

CREATE POLICY "Authenticated users can view community posts"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own posts"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix content_reports - require authenticated
DROP POLICY IF EXISTS "Users can view their own reports" ON public.content_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.content_reports;

CREATE POLICY "Users can view their own reports"
  ON public.content_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON public.content_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Fix daily_goals - require authenticated
DROP POLICY IF EXISTS "Users can delete own daily goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Users can update own daily goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Users can view own daily goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Users can insert own daily goals" ON public.daily_goals;

CREATE POLICY "Users can view own daily goals"
  ON public.daily_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily goals"
  ON public.daily_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily goals"
  ON public.daily_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily goals"
  ON public.daily_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);