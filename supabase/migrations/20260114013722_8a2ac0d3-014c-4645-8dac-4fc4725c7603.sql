-- Add indexes for better query performance on community tables
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum_created ON public.forum_posts(forum_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_target ON public.reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_target ON public.reactions(user_id, target_type, target_id);

-- Enable realtime for reactions table for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;

-- Add unique constraint to prevent duplicate reactions
ALTER TABLE public.reactions ADD CONSTRAINT unique_user_reaction 
  UNIQUE (user_id, target_type, target_id, emoji);

-- Add check constraint for valid target types
ALTER TABLE public.reactions ADD CONSTRAINT valid_target_type 
  CHECK (target_type IN ('forum_post', 'chat_message'));

-- Add message length constraint (prevent spam/abuse)
ALTER TABLE public.chat_messages ADD CONSTRAINT message_length_check 
  CHECK (char_length(message) BETWEEN 1 AND 2000);

-- Add forum post content constraints
ALTER TABLE public.forum_posts ADD CONSTRAINT post_title_length 
  CHECK (char_length(title) BETWEEN 1 AND 200);
ALTER TABLE public.forum_posts ADD CONSTRAINT post_content_length 
  CHECK (char_length(content) BETWEEN 1 AND 10000);