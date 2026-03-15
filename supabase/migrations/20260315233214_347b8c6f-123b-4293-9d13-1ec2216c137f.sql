
-- Table for community notification subscriptions (chat rooms + forums)
CREATE TABLE public.community_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'chat_room' or 'forum'
  target_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

-- Enable RLS
ALTER TABLE public.community_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can view own community subscriptions"
ON public.community_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Premium users can subscribe"
ON public.community_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND is_premium_user(auth.uid()));

CREATE POLICY "Users can unsubscribe"
ON public.community_subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
