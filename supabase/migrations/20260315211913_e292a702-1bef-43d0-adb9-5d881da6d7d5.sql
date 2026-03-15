
-- streak_freezes: INSERT policy from public to authenticated
DROP POLICY "Users can insert own freezes" ON public.streak_freezes;
CREATE POLICY "Users can insert own freezes" ON public.streak_freezes
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- risk_scores: INSERT and SELECT from public to authenticated
DROP POLICY "Users can insert own risk scores" ON public.risk_scores;
CREATE POLICY "Users can insert own risk scores" ON public.risk_scores
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can view own risk scores" ON public.risk_scores;
CREATE POLICY "Users can view own risk scores" ON public.risk_scores
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- journal_entries: INSERT from public to authenticated
DROP POLICY "Users can create own journal entries" ON public.journal_entries;
CREATE POLICY "Users can create own journal entries" ON public.journal_entries
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- pathway_progress: INSERT, UPDATE, SELECT from public to authenticated
DROP POLICY "Users can insert own pathway progress" ON public.pathway_progress;
CREATE POLICY "Users can insert own pathway progress" ON public.pathway_progress
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can update own pathway progress" ON public.pathway_progress;
CREATE POLICY "Users can update own pathway progress" ON public.pathway_progress
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY "Users can view own pathway progress" ON public.pathway_progress;
CREATE POLICY "Users can view own pathway progress" ON public.pathway_progress
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- predictive_insights: INSERT, DELETE, SELECT from public to authenticated
DROP POLICY "Users can insert own insights" ON public.predictive_insights;
CREATE POLICY "Users can insert own insights" ON public.predictive_insights
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can delete own insights" ON public.predictive_insights;
CREATE POLICY "Users can delete own insights" ON public.predictive_insights
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY "Users can view own insights" ON public.predictive_insights;
CREATE POLICY "Users can view own insights" ON public.predictive_insights
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- friend_invitations: INSERT from public to authenticated
DROP POLICY "Users can create invitations" ON public.friend_invitations;
CREATE POLICY "Users can create invitations" ON public.friend_invitations
FOR INSERT TO authenticated WITH CHECK (auth.uid() = inviter_id);

-- chat_rooms: INSERT from public to authenticated
DROP POLICY "Premium users can create chat rooms" ON public.chat_rooms;
CREATE POLICY "Premium users can create chat rooms" ON public.chat_rooms
FOR INSERT TO authenticated WITH CHECK (is_premium_user(auth.uid()) AND auth.uid() = created_by);

-- notifications: INSERT from public to authenticated
DROP POLICY "Premium users can create notifications" ON public.notifications;
CREATE POLICY "Premium users can create notifications" ON public.notifications
FOR INSERT TO authenticated WITH CHECK (is_premium_user(auth.uid()) AND auth.uid() = from_user_id);

-- forum_posts: INSERT from public to authenticated
DROP POLICY "Premium users can create forum posts" ON public.forum_posts;
CREATE POLICY "Premium users can create forum posts" ON public.forum_posts
FOR INSERT TO authenticated WITH CHECK (is_premium_user(auth.uid()) AND auth.uid() = user_id);

-- moderation_logs: INSERT and SELECT from public to authenticated
DROP POLICY "Admins can insert logs" ON public.moderation_logs;
CREATE POLICY "Admins can insert logs" ON public.moderation_logs
FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY "Admins can view logs" ON public.moderation_logs;
CREATE POLICY "Admins can view logs" ON public.moderation_logs
FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- analytics_events: INSERT from public to authenticated
DROP POLICY "Users can insert own analytics" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics" ON public.analytics_events
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- recovery_pathways: SELECT from public to authenticated (public viewing of active pathways)
DROP POLICY "Anyone can view active pathways" ON public.recovery_pathways;
CREATE POLICY "Anyone can view active pathways" ON public.recovery_pathways
FOR SELECT TO authenticated USING (is_active = true);

-- post_bookmarks: SELECT, INSERT, DELETE from public to authenticated
DROP POLICY "Users can view own bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can view own bookmarks" ON public.post_bookmarks
FOR SELECT TO authenticated USING (auth.uid() = user_id AND is_premium_user(auth.uid()));

DROP POLICY "Users can create bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can create bookmarks" ON public.post_bookmarks
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));

DROP POLICY "Users can delete bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can delete bookmarks" ON public.post_bookmarks
FOR DELETE TO authenticated USING (auth.uid() = user_id AND is_premium_user(auth.uid()));
