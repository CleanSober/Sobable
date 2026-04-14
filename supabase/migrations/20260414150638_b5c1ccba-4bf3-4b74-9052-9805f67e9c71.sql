
-- Remove the duplicate/broken policy
DROP POLICY IF EXISTS "View invitation by specific code" ON public.friend_invitations;

-- Create a SECURITY DEFINER function for invite code redemption
CREATE OR REPLACE FUNCTION public.redeem_invite_code(p_invite_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Look up the invitation by code
  SELECT id, inviter_id, status
  INTO v_invitation
  FROM public.friend_invitations
  WHERE invite_code = p_invite_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid invite code');
  END IF;

  IF v_invitation.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation already used');
  END IF;

  IF v_invitation.inviter_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot accept your own invitation');
  END IF;

  -- Mark as accepted
  UPDATE public.friend_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'success', true,
    'inviter_id', v_invitation.inviter_id
  );
END;
$$;
