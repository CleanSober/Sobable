-- =====================================================
-- SECURITY FIX PART 3: Fix remaining tables
-- =====================================================

-- Fix forum_posts - require authenticated + premium for viewing
DROP POLICY IF EXISTS "Premium users can view forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Premium users can create posts" ON public.forum_posts;

CREATE POLICY "Premium users can view forum posts"
  ON public.forum_posts FOR SELECT
  TO authenticated
  USING (is_premium_user(auth.uid()));

CREATE POLICY "Premium users can create posts"
  ON public.forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.forum_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix forum_replies
DROP POLICY IF EXISTS "Premium users can view replies" ON public.forum_replies;
DROP POLICY IF EXISTS "Users can delete their own replies" ON public.forum_replies;
DROP POLICY IF EXISTS "Premium users can create replies" ON public.forum_replies;

CREATE POLICY "Premium users can view replies"
  ON public.forum_replies FOR SELECT
  TO authenticated
  USING (is_premium_user(auth.uid()));

CREATE POLICY "Premium users can create replies"
  ON public.forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));

CREATE POLICY "Users can delete their own replies"
  ON public.forum_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix forums
DROP POLICY IF EXISTS "Premium users can view forums" ON public.forums;
DROP POLICY IF EXISTS "Forum creators can update their forums" ON public.forums;
DROP POLICY IF EXISTS "Premium users can create forums" ON public.forums;

CREATE POLICY "Premium users can view forums"
  ON public.forums FOR SELECT
  TO authenticated
  USING (is_premium_user(auth.uid()));

CREATE POLICY "Premium users can create forums"
  ON public.forums FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by AND is_premium_user(auth.uid()));

CREATE POLICY "Forum creators can update their forums"
  ON public.forums FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Fix journal_entries
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;

CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix mood_entries
DROP POLICY IF EXISTS "Users can delete own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can update own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can view own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can insert own mood entries" ON public.mood_entries;

CREATE POLICY "Users can view own mood entries"
  ON public.mood_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON public.mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON public.mood_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON public.mood_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix poll_votes
DROP POLICY IF EXISTS "Premium users can view votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Users can remove own votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Premium users can vote" ON public.poll_votes;

CREATE POLICY "Premium users can view votes"
  ON public.poll_votes FOR SELECT
  TO authenticated
  USING (is_premium_user(auth.uid()));

CREATE POLICY "Premium users can vote"
  ON public.poll_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));

CREATE POLICY "Users can remove own votes"
  ON public.poll_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix polls
DROP POLICY IF EXISTS "Premium users can view polls" ON public.polls;
DROP POLICY IF EXISTS "Premium users can create polls" ON public.polls;

CREATE POLICY "Premium users can view polls"
  ON public.polls FOR SELECT
  TO authenticated
  USING (is_premium_user(auth.uid()));

CREATE POLICY "Premium users can create polls"
  ON public.polls FOR INSERT
  TO authenticated
  WITH CHECK (is_premium_user(auth.uid()));