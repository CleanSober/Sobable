-- ========================================
-- PHASE 1: Core Forum Enhancements
-- ========================================

-- Add pinned and tags to forum_posts
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Post bookmarks
CREATE TABLE public.post_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.post_bookmarks FOR SELECT USING (auth.uid() = user_id AND is_premium_user(auth.uid()));
CREATE POLICY "Users can create bookmarks" ON public.post_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));
CREATE POLICY "Users can delete bookmarks" ON public.post_bookmarks FOR DELETE USING (auth.uid() = user_id AND is_premium_user(auth.uid()));
CREATE INDEX idx_bookmarks_user ON public.post_bookmarks(user_id);

-- ========================================
-- PHASE 2: Polls
-- ========================================

CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  ends_at TIMESTAMP WITH TIME ZONE,
  allows_multiple BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (post_id)
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Premium users can view polls" ON public.polls FOR SELECT USING (is_premium_user(auth.uid()));
CREATE POLICY "Premium users can create polls" ON public.polls FOR INSERT WITH CHECK (is_premium_user(auth.uid()));

CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id, option_index)
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Premium users can view votes" ON public.poll_votes FOR SELECT USING (is_premium_user(auth.uid()));
CREATE POLICY "Premium users can vote" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));
CREATE POLICY "Users can remove own votes" ON public.poll_votes FOR DELETE USING (auth.uid() = user_id AND is_premium_user(auth.uid()));
CREATE INDEX idx_poll_votes_poll ON public.poll_votes(poll_id);

-- ========================================
-- PHASE 3: User Following
-- ========================================

CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view follows" ON public.user_follows FOR SELECT USING (is_premium_user(auth.uid()));
CREATE POLICY "Users can follow" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id AND is_premium_user(auth.uid()));
CREATE POLICY "Users can unfollow" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id AND is_premium_user(auth.uid()));
CREATE INDEX idx_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_follows_following ON public.user_follows(following_id);

-- ========================================
-- PHASE 4: Karma & Achievements
-- ========================================

CREATE TABLE public.user_karma (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_karma INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  reactions_received INTEGER NOT NULL DEFAULT 0,
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_karma ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view karma" ON public.user_karma FOR SELECT USING (is_premium_user(auth.uid()));
CREATE POLICY "System can update karma" ON public.user_karma FOR INSERT WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));
CREATE POLICY "Users can update own karma" ON public.user_karma FOR UPDATE USING (auth.uid() = user_id AND is_premium_user(auth.uid()));

CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_type)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (is_premium_user(auth.uid()));
CREATE POLICY "System can award badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));

CREATE INDEX idx_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_karma_total ON public.user_karma(total_karma DESC);

-- ========================================
-- PHASE 5: Thread Subscriptions
-- ========================================

CREATE TABLE public.thread_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);
ALTER TABLE public.thread_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.thread_subscriptions FOR SELECT USING (auth.uid() = user_id AND is_premium_user(auth.uid()));
CREATE POLICY "Users can subscribe" ON public.thread_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));
CREATE POLICY "Users can unsubscribe" ON public.thread_subscriptions FOR DELETE USING (auth.uid() = user_id AND is_premium_user(auth.uid()));
CREATE INDEX idx_subscriptions_user ON public.thread_subscriptions(user_id);
CREATE INDEX idx_subscriptions_post ON public.thread_subscriptions(post_id);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_karma;