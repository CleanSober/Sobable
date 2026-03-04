
-- 1. Fix user_follows: restrict SELECT to only the user's own follows (as follower or following)
DROP POLICY IF EXISTS "Users can view follows" ON public.user_follows;
DROP POLICY IF EXISTS "Authenticated users can view follows" ON public.user_follows;

CREATE POLICY "Users can view own follows" ON public.user_follows
FOR SELECT TO authenticated
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- 2. Hide Stripe IDs: create a secure view for subscriptions, deny direct SELECT
-- First drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

-- Create a view that excludes Stripe-sensitive fields
CREATE OR REPLACE VIEW public.subscriptions_safe
WITH (security_invoker = on)
AS SELECT
  id,
  user_id,
  plan_type,
  status,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
FROM public.subscriptions;

-- Recreate SELECT policy that only allows access through the view (deny direct table access)
-- The view with security_invoker=on will use the caller's permissions
-- We need a restrictive policy that allows the view to work but prevents direct access
-- Actually, security_invoker views use the caller's RLS, so we keep the policy but change code to use the view
CREATE POLICY "Users can view own subscription" ON public.subscriptions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);
