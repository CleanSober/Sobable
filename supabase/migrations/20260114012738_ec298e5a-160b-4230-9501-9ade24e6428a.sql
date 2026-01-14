-- Create forums table
CREATE TABLE public.forums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  post_count INTEGER NOT NULL DEFAULT 0
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has premium subscription
CREATE OR REPLACE FUNCTION public.is_premium_user(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = check_user_id
    AND plan_type IN ('premium', 'pro')
    AND status = 'active'
  )
$$;

-- Forums policies (premium users can view and create)
CREATE POLICY "Premium users can view forums"
  ON public.forums FOR SELECT
  USING (public.is_premium_user(auth.uid()));

CREATE POLICY "Premium users can create forums"
  ON public.forums FOR INSERT
  WITH CHECK (public.is_premium_user(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Forum creators can update their forums"
  ON public.forums FOR UPDATE
  USING (auth.uid() = created_by AND public.is_premium_user(auth.uid()));

-- Forum posts policies
CREATE POLICY "Premium users can view forum posts"
  ON public.forum_posts FOR SELECT
  USING (public.is_premium_user(auth.uid()));

CREATE POLICY "Premium users can create forum posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (public.is_premium_user(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = user_id AND public.is_premium_user(auth.uid()));

CREATE POLICY "Users can delete their own posts"
  ON public.forum_posts FOR DELETE
  USING (auth.uid() = user_id AND public.is_premium_user(auth.uid()));

-- Forum replies policies
CREATE POLICY "Premium users can view replies"
  ON public.forum_replies FOR SELECT
  USING (public.is_premium_user(auth.uid()));

CREATE POLICY "Premium users can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (public.is_premium_user(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
  ON public.forum_replies FOR DELETE
  USING (auth.uid() = user_id);

-- Chat rooms policies
CREATE POLICY "Premium users can view chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (public.is_premium_user(auth.uid()));

CREATE POLICY "Premium users can create chat rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (public.is_premium_user(auth.uid()) AND auth.uid() = created_by);

-- Chat messages policies
CREATE POLICY "Premium users can view chat messages"
  ON public.chat_messages FOR SELECT
  USING (public.is_premium_user(auth.uid()));

CREATE POLICY "Premium users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (public.is_premium_user(auth.uid()) AND auth.uid() = user_id);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Create triggers for updated_at
CREATE TRIGGER update_forums_updated_at
  BEFORE UPDATE ON public.forums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create default chat room
INSERT INTO public.chat_rooms (name, description, created_by)
VALUES ('Recovery Lounge', 'A safe space for premium members to connect and support each other in real-time', '00000000-0000-0000-0000-000000000000');

-- Create default forums
INSERT INTO public.forums (title, description, slug, created_by)
VALUES 
  ('Daily Wins', 'Share your victories, big or small!', 'daily-wins', '00000000-0000-0000-0000-000000000000'),
  ('Coping Strategies', 'What works for you? Share and learn from others', 'coping-strategies', '00000000-0000-0000-0000-000000000000'),
  ('Support Circle', 'Need encouragement? We''ve got your back', 'support-circle', '00000000-0000-0000-0000-000000000000');