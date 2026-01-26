-- Add leaderboard visibility to user_xp
ALTER TABLE public.user_xp ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN NOT NULL DEFAULT true;

-- Create friend_invitations table
CREATE TABLE public.friend_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL,
  invitee_email TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'expired'))
);

-- Enable RLS
ALTER TABLE public.friend_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for friend_invitations
CREATE POLICY "Users can view their own sent invitations"
ON public.friend_invitations
FOR SELECT
USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create invitations"
ON public.friend_invitations
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Anyone can view invitation by code for acceptance"
ON public.friend_invitations
FOR SELECT
USING (true);

-- Create index for invite codes
CREATE INDEX idx_friend_invitations_code ON public.friend_invitations(invite_code);

-- Add XP bonus for successful referrals
-- When someone accepts an invitation, both get bonus XP