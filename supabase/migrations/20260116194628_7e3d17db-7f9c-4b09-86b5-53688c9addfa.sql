-- Update chat_messages SELECT policy to be explicit about open community chat
-- This restricts access to active rooms only, making the intent clear

DROP POLICY IF EXISTS "Premium users can view chat messages" ON public.chat_messages;

CREATE POLICY "Premium users can view messages in active rooms"
  ON public.chat_messages FOR SELECT
  USING (
    public.is_premium_user(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_messages.room_id
      AND is_active = true
    )
  );

-- Add comment to document the intentional open access for community chat
COMMENT ON POLICY "Premium users can view messages in active rooms" ON public.chat_messages IS 
  'Chat rooms are intentionally open to all premium members as a community feature. Access is restricted to active rooms only.';