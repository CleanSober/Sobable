
-- Create user_bans table
CREATE TABLE public.user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  banned_by uuid NOT NULL,
  reason text NOT NULL,
  is_permanent boolean NOT NULL DEFAULT false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can view bans
CREATE POLICY "Admins can view bans"
  ON public.user_bans FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Only admins/moderators can create bans
CREATE POLICY "Admins can create bans"
  ON public.user_bans FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Only admins can delete bans
CREATE POLICY "Admins can delete bans"
  ON public.user_bans FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create moderation_logs table
CREATE TABLE public.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid NOT NULL,
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can view logs
CREATE POLICY "Admins can view logs"
  ON public.moderation_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Only admins/moderators can insert logs
CREATE POLICY "Admins can insert logs"
  ON public.moderation_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));
