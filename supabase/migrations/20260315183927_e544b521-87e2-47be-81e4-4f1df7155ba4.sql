
-- Fix 1: Remove client-facing INSERT on xp_history (writes should only go through add_user_xp RPC)
DROP POLICY "Users can insert own XP history" ON public.xp_history;

-- Fix 2: Add status='accepted' check to partner_messages INSERT policy
DROP POLICY "Users can send messages in their matches" ON public.partner_messages;
CREATE POLICY "Users can send messages in accepted matches"
ON public.partner_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.partner_matches
    WHERE partner_matches.id = partner_messages.match_id
    AND partner_matches.status = 'accepted'
    AND (partner_matches.user_id = auth.uid() OR partner_matches.partner_id = auth.uid())
  )
);

-- Fix 3: Add status='accepted' check to partner_messages SELECT policy
DROP POLICY "Users can view messages in their matches" ON public.partner_messages;
CREATE POLICY "Users can view messages in accepted matches"
ON public.partner_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.partner_matches
    WHERE partner_matches.id = partner_messages.match_id
    AND partner_matches.status = 'accepted'
    AND (partner_matches.user_id = auth.uid() OR partner_matches.partner_id = auth.uid())
  )
);
