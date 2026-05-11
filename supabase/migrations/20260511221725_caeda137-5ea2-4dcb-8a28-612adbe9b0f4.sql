-- Add explicit restrictive policies to subscriptions table to prevent any client-side
-- privilege escalation. All subscription mutations must go through service-role
-- (Stripe webhook / IAP validation edge functions).

CREATE POLICY "Block client INSERT on subscriptions"
ON public.subscriptions
AS RESTRICTIVE
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block client UPDATE on subscriptions"
ON public.subscriptions
AS RESTRICTIVE
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block client DELETE on subscriptions"
ON public.subscriptions
AS RESTRICTIVE
FOR DELETE
TO authenticated, anon
USING (false);