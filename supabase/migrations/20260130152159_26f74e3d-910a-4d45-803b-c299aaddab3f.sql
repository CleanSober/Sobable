-- =====================================================
-- SECURITY FIX PART 4: Fix remaining tables
-- =====================================================

-- Fix prevention_plans
DROP POLICY IF EXISTS "Users can delete own prevention plan" ON public.prevention_plans;
DROP POLICY IF EXISTS "Users can update own prevention plan" ON public.prevention_plans;
DROP POLICY IF EXISTS "Users can view own prevention plan" ON public.prevention_plans;
DROP POLICY IF EXISTS "Users can insert own prevention plan" ON public.prevention_plans;

CREATE POLICY "Users can view own prevention plan"
  ON public.prevention_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prevention plan"
  ON public.prevention_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prevention plan"
  ON public.prevention_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prevention plan"
  ON public.prevention_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix profiles - keep the one we created
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix reactions
DROP POLICY IF EXISTS "Premium users can view reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Premium users can add reactions" ON public.reactions;

CREATE POLICY "Premium users can view reactions"
  ON public.reactions FOR SELECT
  TO authenticated
  USING (is_premium_user(auth.uid()));

CREATE POLICY "Premium users can add reactions"
  ON public.reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));

CREATE POLICY "Users can remove their own reactions"
  ON public.reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix sleep_entries
DROP POLICY IF EXISTS "Users can delete own sleep entries" ON public.sleep_entries;
DROP POLICY IF EXISTS "Users can update own sleep entries" ON public.sleep_entries;
DROP POLICY IF EXISTS "Users can view own sleep entries" ON public.sleep_entries;
DROP POLICY IF EXISTS "Users can insert own sleep entries" ON public.sleep_entries;

CREATE POLICY "Users can view own sleep entries"
  ON public.sleep_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep entries"
  ON public.sleep_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep entries"
  ON public.sleep_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep entries"
  ON public.sleep_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix streak_freezes
DROP POLICY IF EXISTS "Users can view own freezes" ON public.streak_freezes;

CREATE POLICY "Users can view own freezes"
  ON public.streak_freezes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix subscriptions
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix thread_subscriptions
DROP POLICY IF EXISTS "Users can unsubscribe" ON public.thread_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.thread_subscriptions;
DROP POLICY IF EXISTS "Premium users can subscribe" ON public.thread_subscriptions;

CREATE POLICY "Users can view own thread subscriptions"
  ON public.thread_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Premium users can subscribe to threads"
  ON public.thread_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));

CREATE POLICY "Users can unsubscribe from threads"
  ON public.thread_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix trigger_entries
DROP POLICY IF EXISTS "Users can delete own trigger entries" ON public.trigger_entries;
DROP POLICY IF EXISTS "Users can update own trigger entries" ON public.trigger_entries;
DROP POLICY IF EXISTS "Users can view own trigger entries" ON public.trigger_entries;
DROP POLICY IF EXISTS "Users can insert own trigger entries" ON public.trigger_entries;

CREATE POLICY "Users can view own trigger entries"
  ON public.trigger_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trigger entries"
  ON public.trigger_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trigger entries"
  ON public.trigger_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trigger entries"
  ON public.trigger_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix user_streaks
DROP POLICY IF EXISTS "Users can delete own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can view own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON public.user_streaks;

CREATE POLICY "Users can view own streaks"
  ON public.user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.user_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.user_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streaks"
  ON public.user_streaks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix user_xp
DROP POLICY IF EXISTS "Users can update own XP" ON public.user_xp;
DROP POLICY IF EXISTS "Users can view leaderboard XP" ON public.user_xp;
DROP POLICY IF EXISTS "Users can view own XP" ON public.user_xp;
DROP POLICY IF EXISTS "Users can insert own XP" ON public.user_xp;

CREATE POLICY "Users can view own XP"
  ON public.user_xp FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard XP"
  ON public.user_xp FOR SELECT
  TO authenticated
  USING (show_on_leaderboard = true);

CREATE POLICY "Users can insert own XP"
  ON public.user_xp FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own XP"
  ON public.user_xp FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix xp_history
DROP POLICY IF EXISTS "Users can view own XP history" ON public.xp_history;

CREATE POLICY "Users can view own XP history"
  ON public.xp_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix friend_invitations
DROP POLICY IF EXISTS "Users can view their own sent invitations" ON public.friend_invitations;
DROP POLICY IF EXISTS "Users can send invitations" ON public.friend_invitations;
DROP POLICY IF EXISTS "Users can update their invitations" ON public.friend_invitations;

CREATE POLICY "Users can view their own sent invitations"
  ON public.friend_invitations FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can send invitations"
  ON public.friend_invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their invitations"
  ON public.friend_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = inviter_id);