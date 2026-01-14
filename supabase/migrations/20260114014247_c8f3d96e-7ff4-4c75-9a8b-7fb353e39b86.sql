-- Create notifications table for mentions and other notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('mention', 'reply', 'reaction')),
  target_type TEXT NOT NULL CHECK (target_type IN ('forum_post', 'forum_reply', 'chat_message')),
  target_id UUID NOT NULL,
  content_preview TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id AND is_premium_user(auth.uid()));

-- Premium users can create notifications (when mentioning others)
CREATE POLICY "Premium users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (is_premium_user(auth.uid()) AND auth.uid() = from_user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id AND is_premium_user(auth.uid()));

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id AND is_premium_user(auth.uid()));

-- Add indexes for performance
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(user_id, created_at DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add index for forum_replies for faster lookups
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_created ON public.forum_replies(post_id, created_at ASC);