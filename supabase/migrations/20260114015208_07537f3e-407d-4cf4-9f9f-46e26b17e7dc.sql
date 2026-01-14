-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked_users
CREATE POLICY "Users can view their own blocks"
ON public.blocked_users FOR SELECT
USING (auth.uid() = blocker_id AND is_premium_user(auth.uid()));

CREATE POLICY "Users can block others"
ON public.blocked_users FOR INSERT
WITH CHECK (auth.uid() = blocker_id AND is_premium_user(auth.uid()) AND auth.uid() != blocked_id);

CREATE POLICY "Users can unblock"
ON public.blocked_users FOR DELETE
USING (auth.uid() = blocker_id AND is_premium_user(auth.uid()));

-- Create content_reports table
CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('forum_post', 'forum_reply', 'chat_message')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'inappropriate', 'misinformation', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_reports
CREATE POLICY "Users can view their own reports"
ON public.content_reports FOR SELECT
USING (auth.uid() = reporter_id AND is_premium_user(auth.uid()));

CREATE POLICY "Users can create reports"
ON public.content_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id AND is_premium_user(auth.uid()) AND auth.uid() != reported_user_id);

-- Add indexes for performance
CREATE INDEX idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_id);
CREATE INDEX idx_content_reports_reporter ON public.content_reports(reporter_id);
CREATE INDEX idx_content_reports_status ON public.content_reports(status);
CREATE INDEX idx_content_reports_target ON public.content_reports(target_type, target_id);

-- Function to check if a user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_uuid UUID, blocked_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE blocker_id = blocker_uuid AND blocked_id = blocked_uuid
  )
$$;