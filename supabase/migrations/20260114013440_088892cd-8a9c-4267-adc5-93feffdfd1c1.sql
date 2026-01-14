-- Create reactions table for forum posts and chat messages
CREATE TABLE public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('forum_post', 'chat_message')),
  target_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure one reaction type per user per target
  UNIQUE (user_id, target_type, target_id, emoji)
);

-- Enable RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Policies for reactions (premium users only for community features)
CREATE POLICY "Premium users can view reactions"
  ON public.reactions FOR SELECT
  USING (is_premium_user(auth.uid()));

CREATE POLICY "Premium users can add reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (is_premium_user(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id AND is_premium_user(auth.uid()));

-- Create index for fast lookups
CREATE INDEX idx_reactions_target ON public.reactions(target_type, target_id);
CREATE INDEX idx_reactions_user ON public.reactions(user_id);